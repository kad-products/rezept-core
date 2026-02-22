# Architectural Decision Records (ADRs)

We're going to follow the MADR spec since it seems like less decisions for me to make about what to put in these. Overkill for sure but oh well. 

- `File naming:` NNNN-kebab-case-title.md with a zero-padded sequential number (e.g. 0001-choose-database.md). Store them in docs/decisions/.
- `Status flow:` Proposed → Accepted. If a later ADR overrides one, mark the old one Superseded by ADR-XXXX rather than deleting it — the history is the point.
- `One decision per file` — keep scope tight.