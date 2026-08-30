# Data Contract for Person 1 (Extraction)

This spec defines the exact format extraction output (entities +
relationships) needs to follow, so it plugs directly into Neo4j
(Person 2), analytics (Person 3), and the backend (Person 4) without
needing fixes downstream.

## 1. Entity types — exact strings (Title Case)

```
Person, Phone, Location, Vehicle, Organization
```

Not `PERSON`, `person` — only this exact Title Case form matches
Person 4's Pydantic schema.

## 2. Required fields per entity

Every entity needs: `id` (unique, e.g. `P001`, `PH001`, `LOC001`)

| Type | Required fields |
|---|---|
| Person | `name`, `aliases` (list, can be empty) |
| Phone | `number` |
| Location | `name`, `latitude`, `longitude` |
| Vehicle | `registration_number`, `vehicle_type` |
| Organization | `name` |

## 3. Most important rule: no dangling references

**If any relationship references an entity ID (as source or target),
that entity's full record must exist in the `entities` list.**

This broke in an earlier real sample — relationships referenced `P002`,
`P003`, `P004`, but those entities were never defined. As a result, 4 out
of 5 relationships got silently dropped downstream (data loss in
analytics/API). **Every extraction batch must be complete — don't send a
partial entity list.**

## 4. Relationship types — only these 5 are allowed

```
CALLED, TRANSACTED_WITH, PRESENT_AT, OWNS_VEHICLE, MEMBER_OF
```

Not `ASSOCIATED_WITH` — this is not in Person 4's official schema. If a
generic association needs to be captured, use the closest of the 5
official types, or raise it with the team to get a new type added.

## 5. Required fields per relationship type

| Type | Required |
|---|---|
| `CALLED` | `timestamp`, `duration` (seconds) |
| `TRANSACTED_WITH` | `timestamp`, `amount` |
| `PRESENT_AT` | `timestamp` |
| `OWNS_VEHICLE` | `timestamp` |
| `MEMBER_OF` | `role`, `timestamp` |

Every relationship should always include: `source_doc` (which document
it came from), `confidence` (0.0–1.0)

## 6. `evidence` field — include this as much as possible

Fill the `evidence` field on relationships with the original excerpt of
text, e.g.:
```json
"evidence": "Suspect Rahul called Sameer for 3 minutes from Old Delhi."
```
This feeds directly into the investigator-facing evidence trail feature —
without it, the system can only show a number, not the "why" behind it.

## 7. Timestamps

ISO format, trailing `Z` is fine:
```
2026-08-20T14:32:00Z
```

## 8. Case identification — current working assumption

There's no separate `case_id` field. **We're currently treating any
`FIR`-pattern match in `source_doc` (e.g. `FIR_102`) as a case marker** —
everything else (`CDR_*`, `FIN_*`, `MCA_*`, `RTO_*`) is treated as
supporting evidence, not a distinct case.

**Needs confirmation**: if an entity is tied to a case only through
CDR/financial data (with no FIR record directly naming them), they'll
currently be undercounted on the cross-case risk signal. If that
scenario is expected in the data, flag it — the logic will need updating.

## Quick checklist before sending a batch

- [ ] Every entity's `id` is unique
- [ ] Entity types are Title Case (`Person`, not `PERSON`)
- [ ] Every relationship's source/target exists in the `entities` list
- [ ] Relationship type is one of the 5 official types (no `ASSOCIATED_WITH`)
- [ ] Timestamps are in ISO format
- [ ] `evidence` text field is populated (where available)
- [ ] `source_doc` naming is consistent (`FIR_*` = case marker)
