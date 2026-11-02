# Dinkytown Through Time: agent rules

Read GATHERING.md and ASSESSMENT.md before doing research. Data lives in `data/`; see README.md.

## Data integrity (non-negotiable)
- **Never fabricate.** No invented tenant names, dates, or address matches. Unknown stays
  `placeholder`. A previous session invented "Bill's Place 1930-1949" and had to revert it.
- **Exact address match required** to put a business on a building. 1311 vs 1316 fails; 1327-29
  is not 1315. Mapping by category or vibe ("there was probably a bar here") is not allowed.
- **Save before you cite.** Every source page used goes to the job's `raw/` folder as text first;
  every new named tenant gets a row in `data/evidence.csv` with a verbatim quote from that saved
  file. `exact` precision only when the year is literally in the quote; otherwise `circa`.
- Confidence: `high` = primary record with address+year; `medium` = reliable secondary source
  with address and decade; `low` = name+address but vague dates. Each `source_ids` entry must exist
  in `data/sources.csv` (add new sources with url + retrieved_at).
- Local-model (`local_*`) output is a draft. It may find candidates; only a verbatim quote that
  passes the checker makes a row.

## Validate after every data edit
```bash
npm run data                       # schema, ids, overlapping intervals
npm test                           # 12+ tests
python3 scripts/check_evidence.py  # quotes verbatim in raw files, exact address matches
```
All three must pass before a change counts as done.
