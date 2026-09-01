"""
backend/app/services/constants.py
Single source of truth for entity and relationship type definitions.
Aligned with backend/app/schemas.py contracts and Abhidha's extraction output.
"""

# --- Canonical Entity Types (Title Case) ---
ENTITY_TYPES: set[str] = {
    "Person",
    "Phone",
    "Location",
    "Vehicle",
    "Organization",
    "Account",
}

# Normalization mapping to accept casing variants and raw extraction labels
_TYPE_NORMALIZE: dict[str, str] = {
    "PERSON": "Person",
    "Person": "Person",
    "PHONE": "Phone",
    "Phone": "Phone",
    "LOCATION": "Location",
    "Location": "Location",
    "VEHICLE": "Vehicle",
    "Vehicle": "Vehicle",
    "ORGANIZATION": "Organization",
    "Organization": "Organization",
    "ORG": "Organization",
    "ACCOUNT": "Account",
    "Account": "Account",
}


def normalize_entity_type(raw_type: str) -> str:
    """
    Maps casing variants to official Title Case names.
    Unknown types pass through unchanged.
    """
    return _TYPE_NORMALIZE.get(raw_type.strip(), raw_type)


# --- Canonical Relationship Types ---
OFFICIAL_EDGE_TYPES: set[str] = {
    "CALLED",
    "TRANSACTED_WITH",
    "PRESENT_AT",
    "OWNS_VEHICLE",
    "MEMBER_OF",
}

# Used internally by analytics engines (e.g. Louvain) but stripped before API serialization
INTERNAL_ONLY_EDGE_TYPES: set[str] = {"ASSOCIATED_WITH"}

EDGE_TYPES: set[str] = OFFICIAL_EDGE_TYPES | INTERNAL_ONLY_EDGE_TYPES

# --- Graph Data Schema Constraints ---
REQUIRED_PERSON_NODE_FIELDS = {
    "case_ids": "list[str] -- list of case identifiers for cross-case scoring",
}

REQUIRED_EDGE_FIELDS = {
    "CALLED": ["timestamp"],
    "TRANSACTED_WITH": ["amount", "timestamp"],
    "PRESENT_AT": ["timestamp"],
}
