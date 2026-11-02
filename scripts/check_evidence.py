#!/usr/bin/env python3
"""Check that every researched tenant row is backed by a verbatim, saved, address-matched quote.

    python3 scripts/check_evidence.py [--baseline <git-ref>]

data/evidence.csv columns:
  building_id, name, start_year, match_basis, address_in_quote, quote, raw_file, url

match_basis:
  address   - address_in_quote must appear in quote AND equal (number + street) one of the
              building's addresses in data/buildings.geojson. Near misses (1311 vs 1316) fail.
  lineage   - the quote must contain the name of another tenant already on the same building
              (e.g. "took over the former Vescio's space"). Put that anchor name in address_in_quote.

Rules enforced:
  - raw_file exists (absolute, or relative to the job dir in $DINKY_RAW_ROOT) and contains the
    quote verbatim (whitespace/case/quote-mark normalized).
  - every tenants.csv row whose confidence is not 'placeholder' and that is new or changed versus
    the baseline commit has at least one evidence row (same building_id + name).
  - 'exact' start_precision requires the start_year digits to appear in the quote.
Exit 0 = clean, 1 = problems (printed).
"""
import csv, html, json, os, re, subprocess, sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
RAW_ROOT = Path(os.environ.get("DINKY_RAW_ROOT", Path.home() / "data/jobs/dinkytown"))


def norm(s: str) -> str:
    s = html.unescape(s).lower().replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = s.replace("–", "-").replace("—", "-").replace("&amp;", "&")
    return re.sub(r"\s+", " ", s).strip()


ORDINALS = {w: f"{i}{'th' if 10 <= i % 100 <= 20 else {1: 'st', 2: 'nd', 3: 'rd'}.get(i % 10, 'th')}" for i, w in enumerate(
    "first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth thirteenth "
    "fourteenth fifteenth sixteenth seventeenth eighteenth nineteenth twentieth".split(), 1)}
STREET = {"avenue": "ave", "av": "ave", "street": "st", "southeast": "se", "s.e.": "se", "s.e": "se"}


def addr_key(a: str):
    a = norm(re.sub(r"\(.*?\)", "", a)).replace(".", "").replace(",", "")
    a = " ".join(ORDINALS.get(t, t) for t in a.split())
    # Pre-1930s Minneapolis directories write streets as "1315 SE 4th" (= 1315 4th St SE) and
    # avenues as "14th av SE". A bare "<num> SE <nth>" with no type is therefore a street.
    m = re.fullmatch(r"(\d+)(?:-\d+)?\s+s\s?e\s+(\d+)(?:st|nd|rd|th)", a)
    if m:
        return (m.group(1), m.group(2), "st")
    toks = [STREET.get(t, t) for t in a.split()]
    toks = [t for t in toks if t not in ("se", "minneapolis", "mn")]
    m = re.match(r"(\d+)(?:-\d+)?\s+(\d+)(?:st|nd|rd|th)?\s+(ave|st)", " ".join(toks))
    return (m.group(1), m.group(2), m.group(3)) if m else None


# Reviewed name variants accepted as lineage anchors: (building_id, variant as written) -> tenant name.
# Only a human reviewer adds entries here.
ANCHOR_ALIASES = {
    ("b-327-14th", "gray's drug"): "Gray's Campus Drug",
    ("b-327-14th", "gray's drugs"): "Gray's Campus Drug",
}


def main():
    baseline = "e2f31c7"
    if "--baseline" in sys.argv:
        baseline = sys.argv[sys.argv.index("--baseline") + 1]
    probs = []
    bld = {f["properties"]["id"]: f["properties"] for f in json.load(open(REPO / "data/buildings.geojson"))["features"]}
    tenants = list(csv.DictReader(open(REPO / "data/tenants.csv")))
    ev_path = REPO / "data/evidence.csv"
    evidence = list(csv.DictReader(open(ev_path))) if ev_path.exists() else []

    for i, e in enumerate(evidence, 2):
        tag = f"evidence.csv:{i} ({e['building_id']} / {e['name']})"
        b = bld.get(e["building_id"])
        if not b:
            probs.append(f"{tag}: unknown building_id"); continue
        rf = Path(e["raw_file"]).expanduser()
        rf = rf if rf.is_absolute() else RAW_ROOT / rf
        if not rf.exists():
            probs.append(f"{tag}: raw_file not found: {rf}"); continue
        text = rf.read_text(errors="ignore")
        if rf.suffix.lower() in (".html", ".htm", ".xml"):  # OCR .txt may contain stray '<'
            text = re.sub(r"<[^>]+>", " ", text)
        raw = norm(text)
        q = norm(e["quote"])
        if len(q) < 15:
            probs.append(f"{tag}: quote too short to verify")
        elif q not in raw:
            probs.append(f"{tag}: quote NOT found verbatim in {rf.name}")
        if e["match_basis"] == "address":
            if norm(e["address_in_quote"]) not in q:
                probs.append(f"{tag}: address_in_quote not inside quote")
            k = addr_key(e["address_in_quote"])
            if not k or k not in {addr_key(a) for a in b["addresses"]}:
                probs.append(f"{tag}: address '{e['address_in_quote']}' != building {b['addresses']} (exact match required)")
        elif e["match_basis"] == "lineage":
            others = {norm(t["name"]) for t in tenants if t["building_id"] == e["building_id"] and t["name"] != e["name"]}
            anchor = norm(e["address_in_quote"])
            target = norm(ANCHOR_ALIASES.get((e["building_id"], anchor), e["address_in_quote"]))
            if target not in others or anchor not in q:
                probs.append(f"{tag}: lineage anchor '{e['address_in_quote']}' must be an existing tenant of this building and appear in quote")
        else:
            probs.append(f"{tag}: match_basis must be 'address' or 'lineage'")

    try:
        old = subprocess.run(["git", "-C", str(REPO), "show", f"{baseline}:data/tenants.csv"],
                             capture_output=True, text=True, check=True).stdout
        old_rows = {tuple(r.values()) for r in csv.DictReader(old.splitlines())}
    except subprocess.CalledProcessError:
        old_rows = set()
    have = {(e["building_id"], e["name"]) for e in evidence}
    for t in tenants:
        if t["confidence"] == "placeholder" or tuple(t.values()) in old_rows:
            continue
        if (t["building_id"], t["name"]) not in have:
            probs.append(f"tenants.csv: new/changed row lacks evidence: {t['building_id']} / {t['name']}")
        if t["start_precision"] == "exact":
            qs = [e["quote"] for e in evidence if (e["building_id"], e["name"]) == (t["building_id"], t["name"])]
            if not any(t["start_year"] in q for q in qs):
                probs.append(f"tenants.csv: {t['building_id']} / {t['name']} marked exact but {t['start_year']} not in any quote")

    for p in probs:
        print("FAIL", p)
    print(f"evidence: {len(evidence)} rows, {len(probs)} problems")
    sys.exit(1 if probs else 0)


if __name__ == "__main__":
    main()
