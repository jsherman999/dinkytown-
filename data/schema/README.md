# Data schema (draft)

Source-of-truth files live here as CSV and GeoJSON and are compiled into one bundle
by the `build-data` script (to be written). See `PLAN.md` section 4 for the model.

Planned files:

- `buildings.geojson` — one feature per building; properties per `Building`.
- `building_variants.geojson` — optional altered footprints/heights with `start_year`/`end_year`.
- `tenants.csv` — `building_id,unit,name,category,start_year,end_year,start_precision,confidence,source_ids`
- `features.geojson` — streets, streetcar tracks, rail, greenway, parks with `start_year`/`end_year`.
- `photos.csv` — `id,building_id,year,year_precision,url,thumbnail,credit,rights,source_ids`
- `sources.csv` — `id,type,citation,url,sheet_or_page,retrieved_at`
- `keyframes.json` — list of 5-year keyframe years with a curated confidence note each.
