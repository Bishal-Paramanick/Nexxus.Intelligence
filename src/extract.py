"""
Entity extraction from FIR text files
- Loads a FIR text file
- Runs spaCy NER for PERSON, GPE (locations), ORG
- Runs custom regex for phone numbers and vehicle plates
- Deduplicates exact-match entities and assigns stable IDs
- Prints results
"""

import re
import os
import spacy
from spacy.pipeline import EntityRuler

nlp = spacy.load("en_core_web_trf")

# ---- Custom regex patterns ----
PHONE_PATTERN = re.compile(r"\b[6-9]\d{9}\b")                       # Indian mobile numbers
VEHICLE_PATTERN = re.compile(r"\b[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}\b")   # e.g. WB01AB1234
ACCOUNT_PATTERN = re.compile(r"\b\d{11,16}\b")                      # bank account numbers
DATE_PATTERN = re.compile(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b")     # dd/mm/yyyy style

# Generic fallback for organization names spaCy's NER sometimes misses.
# Matches capitalized phrases ending in a common business-type word —
# this is a STRUCTURAL pattern (works for any org name), not a memorized
# list of specific companies.
ORG_SUFFIXES = (
    r"Supermarket|Traders|Electronics|Enterprises|Textiles|Stores|Finance|"
    r"Logistics|Bank|Industries|Motors|Pharma|Foods|Exports|Imports|"
    r"Corporation|Company|Associates|Solutions|Services"
)
ORG_FALLBACK_PATTERN = re.compile(
    r"\b([A-Z][a-zA-Z&]+(?:\s[A-Z][a-zA-Z&.]+){0,3}\s(?:" + ORG_SUFFIXES + r")\b"
    r"(?:\s(?:Pvt\.?\s?Ltd\.?|Ltd\.?|Limited))?)"
)

# Prefixes that indicate a RELATIVE'S NAME follows (should stay PERSON)
PERSON_PREFIXES = re.compile(r"^(S/o|D/o|W/o|C/o)\s+", re.IGNORECASE)
# Prefix that indicates a PLACE follows (should be forced to LOCATION,
# regardless of what spaCy originally guessed — "R/o" = "Resident of <place>")
RESIDENCE_PREFIX = re.compile(r"^R/o\s+", re.IGNORECASE)


def clean_text(text: str) -> str:
    """Collapse newlines/extra whitespace so entities don't leak line breaks."""
    return re.sub(r"\s+", " ", text)


def clean_entity_name(name: str) -> str:
    """Strip possessives and any relationship/residence prefix, trim whitespace."""
    name = name.strip()
    name = re.sub(r"['’]s\b", "", name)  # strip possessive 's
    name = PERSON_PREFIXES.sub("", name)
    name = RESIDENCE_PREFIX.sub("", name)
    return name.strip()


def extract_entities_from_text(text: str, doc_id: str, debug_labels: bool = False):
    """
    Runs spaCy NER + regex on a block of text.
    Returns a list of entity dicts (before deduplication/ID assignment).

    debug_labels: if True, prints spaCy's raw label for every entity
    (useful for checking what label vehicle brand names get tagged as,
    instead of guessing with a hardcoded brand list).
    """
    text = clean_text(text)
    entities = []

    # Find date spans so we can skip anything spaCy tags as GPE/LOC that
    # actually overlaps a date (dates were getting misclassified as LOCATION)
    date_spans = [m.span() for m in DATE_PATTERN.finditer(text)]

    def overlaps_date(start, end):
        return any(start < d_end and end > d_start for d_start, d_end in date_spans)

    # --- spaCy NER pass ---
    doc = nlp(text)
    for ent in doc.ents:
        if debug_labels:
            print(f"    (raw label: {ent.label_:10} text: {ent.text!r})")

        if not ent.text.strip() or overlaps_date(ent.start_char, ent.end_char):
            continue

        # Special case: "R/o <place>" should ALWAYS be treated as a LOCATION,
        # even if spaCy mislabeled the whole span as PERSON — the prefix
        # itself ("Resident of") tells us the semantic type more reliably
        # than the model's guess here.
        if RESIDENCE_PREFIX.match(ent.text):
            name = clean_entity_name(ent.text)
            if name:
                entities.append({"name": name, "type": "LOCATION", "doc_id": doc_id})
            continue

        name = clean_entity_name(ent.text)
        if not name:
            continue

        if ent.label_ == "PERSON":
            entities.append({"name": name, "type": "PERSON", "doc_id": doc_id})
        elif ent.label_ in ("GPE", "LOC"):
            entities.append({"name": name, "type": "LOCATION", "doc_id": doc_id})
        elif ent.label_ == "PRODUCT":
            continue  # generic filter: vehicle brands/models are usually tagged PRODUCT, not ORG
        elif ent.label_ == "ORG":
            # Skip anything that's actually a vehicle plate mis-tagged as ORG
            if VEHICLE_PATTERN.fullmatch(name):
                continue
            entities.append({"name": name, "type": "ORG", "doc_id": doc_id})

    # --- Regex passes (spaCy won't reliably catch these) ---
    for match in PHONE_PATTERN.findall(text):
        entities.append({"name": match, "type": "PHONE", "doc_id": doc_id})

    for match in VEHICLE_PATTERN.findall(text):
        entities.append({"name": match, "type": "VEHICLE", "doc_id": doc_id})

    for match in ACCOUNT_PATTERN.findall(text):
        entities.append({"name": match, "type": "ACCOUNT", "doc_id": doc_id})

    # Fallback: catch org names spaCy's NER missed, using structural suffix match
    already_found = {e["name"] for e in entities if e["type"] == "ORG"}
    for match in ORG_FALLBACK_PATTERN.findall(text):
        if match not in already_found:
            entities.append({"name": match, "type": "ORG", "doc_id": doc_id})
            already_found.add(match)

    return entities


def load_and_extract(filepath: str, doc_id: str):
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()
    return extract_entities_from_text(text, doc_id)


# ---- ID prefixes per entity type (matches the schema style: P001, etc.) ----
TYPE_PREFIXES = {
    "PERSON": "P",
    "PHONE": "PH",
    "LOCATION": "L",
    "VEHICLE": "V",
    "ORG": "O",
    "ACCOUNT": "A",
}


def deduplicate_entities(all_entities):
    """
    Collapses EXACT (name, type) duplicates into a single entity with a
    unique ID, tracking every doc_id it was mentioned in.
    """
    seen = {}
    type_counters = {}
    ordered = []

    for e in all_entities:
        key = (e["name"], e["type"])

        if key not in seen:
            prefix = TYPE_PREFIXES.get(e["type"], "X")
            type_counters[prefix] = type_counters.get(prefix, 0) + 1
            entity_id = f"{prefix}{type_counters[prefix]:03d}"

            new_entity = {
                "id": entity_id,
                "name": e["name"],
                "type": e["type"],
                "mentioned_in": [e["doc_id"]],
            }
            seen[key] = new_entity
            ordered.append(new_entity)
        else:
            existing = seen[key]
            if e["doc_id"] not in existing["mentioned_in"]:
                existing["mentioned_in"].append(e["doc_id"])

    return ordered


# =====================================================================
# RELATIONSHIP EXTRACTION
# =====================================================================
# Two sources of relationships:
#   1. FIR text -> dependency parsing (this section)
#   2. CDR / bank CSVs -> direct column mapping (see extract_csv_relationships)
#
# Design principle: resolve dependency subject/object tokens to entities
# using CHARACTER-POSITION overlap with the same entity spans your NER
# step already found -- not by re-matching text/words. This avoids
# ambiguity when two different entities share a word (e.g. "Debasish
# Chatterjee" the person vs. "Chatterjee Textiles" the org).

CALL_VERBS = {"call", "phone", "ring"}
TRANSFER_VERBS = {"transfer", "pay", "send"}
MEET_VERBS = {"meet", "see"}
OWN_VERBS = {"own", "drive"}
MEMBER_VERBS = {"work", "belong"}

VERB_RELATION_MAP = {}
for v in CALL_VERBS: VERB_RELATION_MAP[v] = "CALLED"
for v in TRANSFER_VERBS: VERB_RELATION_MAP[v] = "TRANSACTED_WITH"
for v in MEET_VERBS: VERB_RELATION_MAP[v] = "PRESENT_AT"
for v in OWN_VERBS: VERB_RELATION_MAP[v] = "OWNS_VEHICLE"
for v in MEMBER_VERBS: VERB_RELATION_MAP[v] = "MEMBER_OF"


def _get_entity_spans_for_relationships(doc, text):
    """
    Re-derives entity spans (with character offsets) for a document,
    using the SAME logic as extract_entities_from_text, so relationship
    resolution lines up exactly with what was already extracted.
    Returns a list of (start_char, end_char, name, type) tuples.
    """
    spans = []
    date_spans = [m.span() for m in DATE_PATTERN.finditer(text)]

    def overlaps_date(start, end):
        return any(start < d_end and end > d_start for d_start, d_end in date_spans)

    for ent in doc.ents:
        if not ent.text.strip() or overlaps_date(ent.start_char, ent.end_char):
            continue
        if RESIDENCE_PREFIX.match(ent.text):
            name = clean_entity_name(ent.text)
            if name:
                spans.append((ent.start_char, ent.end_char, name, "LOCATION"))
            continue
        name = clean_entity_name(ent.text)
        if not name:
            continue
        if ent.label_ == "PERSON":
            spans.append((ent.start_char, ent.end_char, name, "PERSON"))
        elif ent.label_ in ("GPE", "LOC"):
            spans.append((ent.start_char, ent.end_char, name, "LOCATION"))
        elif ent.label_ == "PRODUCT":
            continue
        elif ent.label_ == "ORG":
            if VEHICLE_PATTERN.fullmatch(name):
                continue
            spans.append((ent.start_char, ent.end_char, name, "ORG"))

    # Add regex-based spans (phone/vehicle/account) so they're resolvable too
    for pattern, etype in [(PHONE_PATTERN, "PHONE"), (VEHICLE_PATTERN, "VEHICLE"),
                            (ACCOUNT_PATTERN, "ACCOUNT")]:
        for m in pattern.finditer(text):
            spans.append((m.start(), m.end(), m.group(0), etype))

    return spans


def _resolve_token_to_entity(token, entity_spans):
    """Find which entity span contains this token's character position."""
    for start, end, name, etype in entity_spans:
        if start <= token.idx < end:
            return name, etype
    return None, None


EXPECTED_PREP = {"MEMBER_OF": "for", "TRANSACTED_WITH": "to"}


def _find_subject(token, max_depth=3):
    """
    Find the grammatical subject of a verb, walking up through
    control-verb chains if needed (e.g. "began CALLING me" -- the real
    subject attaches to "began", not "calling", because "calling" is an
    xcomp/ccomp of "began"). Without this, verbs used inside phrases like
    "began calling", "started threatening", "continued demanding" would
    never resolve a subject and silently get skipped.
    """
    subj = next((c for c in token.children if c.dep_ in ("nsubj", "nsubjpass")), None)
    if subj is not None:
        return subj
    if max_depth > 0 and token.dep_ in ("xcomp", "ccomp", "conj", "advcl") and token.head is not token:
        return _find_subject(token.head, max_depth - 1)
    return None


def _find_target(token, expected_prep=None):
    """
    Find the direct object, or the object of a SPECIFIC preposition when
    given (e.g. "for" for MEMBER_OF, "to" for TRANSACTED_WITH).
    """
    dobj = next((c for c in token.children if c.dep_ in ("dobj", "attr")), None)
    preps = [c for c in token.children if c.dep_ == "prep"]
    prep_obj = None
    if expected_prep:
        match = next((p for p in preps if p.text.lower() == expected_prep), None)
        if match:
            prep_obj = next((g for g in match.children if g.dep_ == "pobj"), None)
    if prep_obj is None and preps:
        prep_obj = next((g for g in preps[0].children if g.dep_ == "pobj"), None)
    return dobj, prep_obj


def extract_relationships_from_text(text: str, doc_id: str, entity_id_lookup: dict):
    """
    Dependency-parses each sentence, finds verbs matching our relation
    map, and resolves subject/object to known entities via character-
    offset overlap. Skips (does not guess) when:
      - subject or object is a pronoun (unresolved coreference)
      - subject or object can't be matched to a known entity
    entity_id_lookup: dict mapping entity name -> entity ID (from your
    deduplicated entity list), used to output IDs matching the schema.
    """
    text = clean_text(text)
    doc = nlp(text)
    entity_spans = _get_entity_spans_for_relationships(doc, text)
    relationships = []

    for sent in doc.sents:
        for token in sent:
            if token.pos_ != "VERB":
                continue
            rel_type = VERB_RELATION_MAP.get(token.lemma_)
            if not rel_type:
                continue

            subj = _find_subject(token)
            if subj is None or subj.pos_ == "PRON":
                continue
            source_name, _ = _resolve_token_to_entity(subj, entity_spans)
            if not source_name:
                continue

            if rel_type == "OWNS_VEHICLE":
                # "own"/"drive" is ambiguous: could be a vehicle OR a
                # business ("owns Chatterjee Textiles"). Check what's
                # actually being owned before deciding the relation type.
                vehicle_match = VEHICLE_PATTERN.search(sent.text)
                if vehicle_match:
                    target_name = vehicle_match.group(0)
                else:
                    # No plate nearby -- check if the direct object resolves
                    # to an ORG instead, and treat that as MEMBER_OF
                    dobj = next((c for c in token.children if c.dep_ in ("dobj", "attr")), None)
                    if dobj is None:
                        continue
                    resolved_name, resolved_type = _resolve_token_to_entity(dobj, entity_spans)
                    if not resolved_name or resolved_type != "ORG":
                        continue
                    rel_type = "MEMBER_OF"
                    target_name = resolved_name
            else:
                dobj, prep_obj = _find_target(token, EXPECTED_PREP.get(rel_type))
                # Transfer/member verbs: prefer the prepositional object
                # ("transferred money TO X" -> X is the real target, not "money")
                target_token = prep_obj if rel_type in ("TRANSACTED_WITH", "MEMBER_OF") and prep_obj else (dobj or prep_obj)
                if target_token is None or target_token.pos_ == "PRON":
                    continue
                target_name, _ = _resolve_token_to_entity(target_token, entity_spans)
                if not target_name:
                    continue

            if source_name == target_name:
                continue  # skip self-loops from parsing noise

            source_id = entity_id_lookup.get(source_name)
            target_id = entity_id_lookup.get(target_name)
            if not source_id or not target_id:
                continue  # shouldn't happen if entity list is complete, but be safe

            relationships.append({
                "source": source_id,
                "type": rel_type,
                "target": target_id,
                "confidence": 0.85,  # inferred from free text -> moderate-high confidence
                "doc_id": doc_id,
                "evidence": sent.text.strip(),  # original sentence, for the evidence trail
            })

    return relationships



def build_entity_id_lookup(deduped_entities):
    """Simple name -> id map for relationship resolution."""
    return {e["name"]: e["id"] for e in deduped_entities}


# =====================================================================
# CSV -> ENTITIES + RELATIONSHIPS (CDR calls, bank transfers)
# =====================================================================

import csv
from datetime import datetime


def _normalize_doc_id(raw_doc_id: str) -> str:
    """CSV doc_id columns may be lowercase ('fir_101') while FIR text
    processing uses uppercase ('FIR_101') -- normalize so entities from
    both sources dedupe together correctly instead of creating dupes."""
    return raw_doc_id.strip().upper()


def _to_iso_timestamp(raw_timestamp: str) -> str:
    """Converts common timestamp formats to ISO 8601 with trailing Z,
    as required by the contract (Section 7). Falls back to the raw
    string, unmodified, if the format isn't recognized -- better to pass
    through an unexpected format than silently mangle or drop data."""
    raw_timestamp = raw_timestamp.strip()
    formats = ["%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"]
    for fmt in formats:
        try:
            dt = datetime.strptime(raw_timestamp, fmt)
            return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        except ValueError:
            continue
    return raw_timestamp  # unrecognized format -- pass through, don't guess


def extract_entities_from_cdr(csv_path: str):
    """Every unique phone number in the CDR file becomes a PHONE entity."""
    entities = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            doc_id = _normalize_doc_id(row.get("doc_id", "CDR"))
            for col in ("caller_phone", "receiver_phone"):
                phone = row.get(col, "").strip()
                if phone:
                    entities.append({"name": phone, "type": "PHONE", "doc_id": doc_id})
    return entities


def extract_entities_from_bank(csv_path: str):
    """Every unique account number in the bank file becomes an ACCOUNT entity."""
    entities = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            doc_id = _normalize_doc_id(row.get("doc_id", "BANK"))
            for col in ("sender_acct", "receiver_acct"):
                acct = row.get(col, "").strip()
                if acct:
                    entities.append({"name": acct, "type": "ACCOUNT", "doc_id": doc_id})
    return entities


def extract_relationships_from_cdr(csv_path: str, entity_id_lookup: dict):
    """
    Every CDR row -> one CALLED relationship, phone-to-phone.
    High confidence (0.95) since this is structured data, not inferred
    from free text.
    """
    relationships = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            caller = row.get("caller_phone", "").strip()
            receiver = row.get("receiver_phone", "").strip()
            source_id = entity_id_lookup.get(caller)
            target_id = entity_id_lookup.get(receiver)
            if not source_id or not target_id:
                continue

            doc_id = _normalize_doc_id(row.get("doc_id", "CDR"))
            timestamp = _to_iso_timestamp(row.get("timestamp", ""))
            duration = row.get("duration_sec", "").strip()

            relationships.append({
                "source": source_id,
                "type": "CALLED",
                "target": target_id,
                "confidence": 0.95,
                "doc_id": doc_id,
                "timestamp": timestamp,
                "duration": int(duration) if duration.isdigit() else None,
                "evidence": f"Call record: {caller} -> {receiver}, {duration}s, {timestamp}",
            })
    return relationships


def extract_relationships_from_bank(csv_path: str, entity_id_lookup: dict):
    """
    Every bank transfer row -> one TRANSACTED_WITH relationship,
    account-to-account.
    """
    relationships = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            sender = row.get("sender_acct", "").strip()
            receiver = row.get("receiver_acct", "").strip()
            source_id = entity_id_lookup.get(sender)
            target_id = entity_id_lookup.get(receiver)
            if not source_id or not target_id:
                continue

            doc_id = _normalize_doc_id(row.get("doc_id", "BANK"))
            timestamp = _to_iso_timestamp(row.get("timestamp", ""))
            amount = row.get("amount", "").strip()

            relationships.append({
                "source": source_id,
                "type": "TRANSACTED_WITH",
                "target": target_id,
                "confidence": 0.95,
                "doc_id": doc_id,
                "timestamp": timestamp,
                "amount": float(amount) if amount else None,
                "evidence": f"Bank transfer: {sender} -> {receiver}, Rs.{amount}, {timestamp}",
            })
    return relationships


# =====================================================================
# CONTRACT-COMPLIANT OUTPUT FORMATTING
# =====================================================================

CONTRACT_TYPE_MAP = {
    "PERSON": "Person",
    "PHONE": "Phone",
    "LOCATION": "Location",
    "VEHICLE": "Vehicle",
    "ORG": "Organization",
    "ACCOUNT": "Account",
}

CONTRACT_ID_PREFIXES = {
    "PERSON": "P",
    "PHONE": "PH",
    "LOCATION": "LOC",
    "VEHICLE": "VEH",
    "ORG": "ORG",
    "ACCOUNT": "ACC",
}

ALLOWED_RELATIONSHIP_TYPES = {
    "CALLED", "TRANSACTED_WITH", "PRESENT_AT", "OWNS_VEHICLE", "MEMBER_OF"
}

# Fragile best-effort vehicle-type extraction: looks for a descriptive
# phrase ("grey Hyundai Creta", "Toyota Innova") immediately preceding
# "bearing registration ..." in the same sentence as a plate number.
# Falls back to "Unknown" if no such phrase is found — this is a known
# limitation (only catches this specific FIR phrasing pattern).
VEHICLE_TYPE_PATTERN = re.compile(
    r"\b((?:[a-z]+\s)?[A-Z][a-zA-Z]*(?:\s+[A-Za-z]+){0,3})\s+bearing\s+registration"
)
DETERMINER_STRIP = re.compile(r"^(a|an|the)\s+", re.IGNORECASE)


def extract_vehicle_type(full_text: str, plate: str) -> str:
    """Best-effort extraction of vehicle type/description near a plate
    mention. Returns 'Unknown' if no descriptive phrase is found."""
    for sent in re.split(r"(?<=[.!?])\s+", full_text):
        if plate in sent:
            m = VEHICLE_TYPE_PATTERN.search(sent)
            if m:
                return DETERMINER_STRIP.sub("", m.group(1)).strip()
    return "Unknown"


def build_contract_entities(deduped_entities, doc_texts: dict):
    """
    Converts our internal deduplicated entity list into the exact
    contract schema: Title Case types, correct ID prefixes, and
    type-specific required fields.

    doc_texts: dict of doc_id -> full raw text, needed for vehicle-type
    lookup (searches the original sentence the plate appeared in).
    """
    contract_entities = []
    type_counters = {}

    for e in deduped_entities:
        internal_type = e["type"]
        contract_type = CONTRACT_TYPE_MAP.get(internal_type)
        if not contract_type:
            continue  # ACCOUNT has no contract type yet -- flag separately

        prefix = CONTRACT_ID_PREFIXES[internal_type]
        type_counters[prefix] = type_counters.get(prefix, 0) + 1
        entity_id = f"{prefix}{type_counters[prefix]:03d}"

        record = {
            "id": entity_id,
            "type": contract_type,
            "source_doc": e["mentioned_in"][0],  # first doc it appeared in
        }

        if contract_type == "Person":
            record["name"] = e["name"]
            record["aliases"] = []
        elif contract_type == "Phone":
            record["number"] = e["name"]
        elif contract_type == "Location":
            record["name"] = e["name"]
            record["latitude"] = None   # TODO: needs geocoding step (unowned)
            record["longitude"] = None  # TODO: needs geocoding step (unowned)
        elif contract_type == "Vehicle":
            record["registration_number"] = e["name"]
            # Search across all docs this plate was mentioned in
            vtype = "Unknown"
            for doc_id in e["mentioned_in"]:
                text = doc_texts.get(doc_id, "")
                vtype = extract_vehicle_type(text, e["name"])
                if vtype != "Unknown":
                    break
            record["vehicle_type"] = vtype  # best-effort; may be "Unknown"
        elif contract_type == "Organization":
            record["name"] = e["name"]
        elif contract_type == "Account":
            record["account_number"] = e["name"]

        contract_entities.append(record)

    return contract_entities


def build_contract_id_lookup(contract_entities):
    """name -> contract id lookup, for wiring relationships to the new IDs."""
    lookup = {}
    for e in contract_entities:
        name_field = (e.get("name") or e.get("number")
                      or e.get("registration_number") or e.get("account_number"))
        if name_field:
            lookup[name_field] = e["id"]
    return lookup


def build_contract_relationships(all_relationships, contract_id_lookup):
    """
    Converts internal relationships into contract format: renames
    doc_id -> source_doc, adds evidence text, enforces the 5 allowed
    types, and fills type-specific required fields (with None + a
    flag where we genuinely don't have the data from free text).
    """
    contract_rels = []
    for r in all_relationships:
        if r["type"] not in ALLOWED_RELATIONSHIP_TYPES:
            continue

        rel = {
            "source": r["source"],
            "target": r["target"],
            "type": r["type"],
            "confidence": r["confidence"],
            "source_doc": r["doc_id"],
            "evidence": r.get("evidence"),
        }

        # Type-specific required fields. Use the REAL value if the
        # relationship already carries one (e.g. CSV-derived CALLED/
        # TRANSACTED_WITH rows have actual timestamp/duration/amount) --
        # only fall back to None when it's genuinely unavailable (typical
        # for text-derived relationships, which don't reliably state an
        # exact timestamp in FIR prose).
        if r["type"] == "CALLED":
            rel["timestamp"] = r.get("timestamp")
            rel["duration"] = r.get("duration")
        elif r["type"] == "TRANSACTED_WITH":
            rel["timestamp"] = r.get("timestamp")
            rel["amount"] = r.get("amount")
        elif r["type"] == "PRESENT_AT":
            rel["timestamp"] = r.get("timestamp")
        elif r["type"] == "OWNS_VEHICLE":
            rel["timestamp"] = r.get("timestamp")
        elif r["type"] == "MEMBER_OF":
            rel["timestamp"] = r.get("timestamp")
            rel["role"] = r.get("role") 

        contract_rels.append(rel)

    return contract_rels


def validate_no_dangling_references(entities, relationships):
    """
    Enforces the contract's most important rule: every relationship's
    source/target must exist in the entities list. Returns (valid_rels,
    dropped_rels) so nothing gets silently lost -- dropped ones are
    reported, not swallowed.
    """
    valid_ids = {e["id"] for e in entities}
    valid_rels, dropped_rels = [], []

    for r in relationships:
        if r["source"] in valid_ids and r["target"] in valid_ids:
            valid_rels.append(r)
        else:
            dropped_rels.append(r)

    return valid_rels, dropped_rels


if __name__ == "__main__":
    files = [
        ("data/raw/fir_101.txt", "FIR_101"),
        ("data/raw/fir_102.txt", "FIR_102"),
        ("data/raw/fir_103.txt", "FIR_103"),
    ]

    all_entities = []
    for filepath, doc_id in files:
        print(f"\n--- Extracting from {doc_id} ({filepath}) ---")
        try:
            entities = load_and_extract(filepath, doc_id)
        except FileNotFoundError:
            print(f"  File not found, skipping: {filepath}")
            continue

        for e in entities:
            print(f"  [{e['type']:8}] {e['name']}")

        all_entities.extend(entities)

    print(f"\nTotal entities extracted (before dedup): {len(all_entities)}")

    deduped = deduplicate_entities(all_entities)
    print(f"Unique entities after dedup: {len(deduped)}")
    print("\n--- Deduplicated entities ---")
    for e in deduped:
        docs = ", ".join(e["mentioned_in"])
        print(f"  [{e['id']:6}] ({e['type']:8}) {e['name']:30} -- in: {docs}")

    # --- relationship extraction from FIR text ---
    entity_id_lookup = build_entity_id_lookup(deduped)

    all_relationships = []
    for filepath, doc_id in files:
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                text = f.read()
        except FileNotFoundError:
            continue
        rels = extract_relationships_from_text(text, doc_id, entity_id_lookup)
        all_relationships.extend(rels)

    print(f"\n--- Relationships extracted from text: {len(all_relationships)} ---")
    for r in all_relationships:
        print(f"  {r['source']} --{r['type']}--> {r['target']}  "
              f"(confidence={r['confidence']}, doc={r['doc_id']})")

    #--CSV entities + relationships (CDR calls, bank transfers) ---
    csv_files = {
        "cdr": "data/raw/cdr.csv",
        "bank": "data/raw/bank_transfers.csv",
    }

    csv_entities = []
    if os.path.exists(csv_files["cdr"]):
        csv_entities.extend(extract_entities_from_cdr(csv_files["cdr"]))
    # if os.path.exists(csv_files["bank"]):
    #     csv_entities.extend(extract_entities_from_bank(csv_files["bank"]))

    all_entities = [e for e in all_entities if e["type"] != "ACCOUNT"]

    if csv_entities:
        print(f"\n--- CSV entities found: {len(csv_entities)} (before merge/dedup) ---")
        # Re-run dedup across FIR-derived + CSV-derived entities together,
        # so a phone/account already seen in FIR text merges with its CSV
        # mention instead of creating a duplicate.
        all_entities_combined = all_entities + csv_entities
        deduped = deduplicate_entities(all_entities_combined)
        entity_id_lookup = build_entity_id_lookup(deduped)
        print(f"Unique entities after merging CSV data: {len(deduped)}")

    csv_relationships = []
    if os.path.exists(csv_files["cdr"]):
        csv_relationships.extend(extract_relationships_from_cdr(csv_files["cdr"], entity_id_lookup))
    # if os.path.exists(csv_files["bank"]):
    #     csv_relationships.extend(extract_relationships_from_bank(csv_files["bank"], entity_id_lookup))

    print(f"\n--- Relationships extracted from CSVs: {len(csv_relationships)} ---")
    for r in csv_relationships[:10]:  # preview first 10, full list goes in the final JSON
        print(f"  {r['source']} --{r['type']}--> {r['target']}  "
              f"(confidence={r['confidence']}, doc={r['doc_id']})")
    if len(csv_relationships) > 10:
        print(f"  ... and {len(csv_relationships) - 10} more")

    all_relationships = all_relationships + csv_relationships

    print("\n" + "=" * 70)
    print("=" * 70)

    # --- convert to contract-compliant output ---
    doc_texts = {}
    for filepath, doc_id in files:
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                doc_texts[doc_id] = f.read()
        except FileNotFoundError:
            continue

    contract_entities = build_contract_entities(deduped, doc_texts)
    contract_id_lookup = build_contract_id_lookup(contract_entities)

    # Remap relationship source/target from our internal IDs to contract IDs
    # (internal IDs used entity name as the join key, so we look up by name)
    internal_id_to_name = {e["id"]: e["name"] for e in deduped}
    remapped_relationships = []
    remap_dropped = []
    for r in all_relationships:
        source_name = internal_id_to_name.get(r["source"])
        target_name = internal_id_to_name.get(r["target"])
        source_contract_id = contract_id_lookup.get(source_name)
        target_contract_id = contract_id_lookup.get(target_name)
        if source_contract_id and target_contract_id:
            remapped_relationships.append({**r, "source": source_contract_id, "target": target_contract_id})
        else:
            remap_dropped.append(r)  # never drop silently -- always log it

    if remap_dropped:
        print(f"\n!!! {len(remap_dropped)} relationships DROPPED during contract ID remap "
              f"(source/target entity not found in contract export) !!!")
        for d in remap_dropped[:5]:
            print(f"  DROPPED: {d['source']} --{d['type']}--> {d['target']} (doc={d.get('doc_id')})")
        if len(remap_dropped) > 5:
            print(f"  ... and {len(remap_dropped) - 5} more")

    contract_relationships = build_contract_relationships(
        remapped_relationships, contract_id_lookup
    )

    valid_rels, dropped_rels = validate_no_dangling_references(contract_entities, contract_relationships)

    print(f"\n--- Contract validation ---")
    print(f"Entities: {len(contract_entities)}")
    print(f"Valid relationships: {len(valid_rels)}")
    if dropped_rels:
        print(f"DROPPED (dangling reference) relationships: {len(dropped_rels)}")
        for d in dropped_rels:
            print(f"  DROPPED: {d}")

    import json
    output = {"entities": contract_entities, "relationships": valid_rels}
    with open("output_contract.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    print("\nWrote output_contract.json")