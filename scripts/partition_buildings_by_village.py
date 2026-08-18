import json
import os
import re

SOURCE_GEOJSON = r'U:\Project\RADAR REBUILD\data\BANGUNAN\bangunan.geojson'
OUTPUT_DIR = r'u:\Project\RADAR REBUILD\public\data\buildings_by_village'
INDEX_FILE = r'u:\Project\RADAR REBUILD\public\data\villageBuildingsIndex.json'

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Starting village-scoped building partition...")

# 1. Load landslide impact features for village polygons & bounding boxes
with open('public/data/landslideImpactGeo.json', 'r', encoding='utf-8') as f:
    landslide_data = json.load(f)

def clean_key(s):
    return re.sub(r'[^a-z0-9_]', '', s.lower().strip().replace(' ', '_'))

desa_bounds = {}
for feat in landslide_data.get('features', []):
    geom = feat.get('geometry', {})
    props = feat.get('properties', {})
    desa = props.get('NAMA_DESA')
    kec = props.get('NAMA_KEC')
    coords = geom.get('coordinates', [])
    if not desa or not kec or not coords:
        continue
    
    pts = []
    def extract_pts(c):
        if isinstance(c[0], (int, float)):
            pts.append(c)
        else:
            for sub in c:
                extract_pts(sub)
    extract_pts(coords)
    if not pts:
        continue

    min_lng = min(p[0] for p in pts)
    max_lng = max(p[0] for p in pts)
    min_lat = min(p[1] for p in pts)
    max_lat = max(p[1] for p in pts)
    
    key = f"{clean_key(desa)}_{clean_key(kec)}"
    if key not in desa_bounds:
        desa_bounds[key] = {
            'desa': desa.strip(),
            'kecamatan': kec.strip(),
            'min_lng': min_lng,
            'max_lng': max_lng,
            'min_lat': min_lat,
            'max_lat': max_lat,
            'features': []
        }
    else:
        desa_bounds[key]['min_lng'] = min(desa_bounds[key]['min_lng'], min_lng)
        desa_bounds[key]['max_lng'] = max(desa_bounds[key]['max_lng'], max_lng)
        desa_bounds[key]['min_lat'] = min(desa_bounds[key]['min_lat'], min_lat)
        desa_bounds[key]['max_lat'] = max(desa_bounds[key]['max_lat'], max_lat)

print(f"Prepared bounding boxes for {len(desa_bounds)} unique villages.")

# 2. Load 465k Buildings
with open(SOURCE_GEOJSON, 'r', encoding='utf-8') as f:
    bldg_data = json.load(f)

bldg_features = bldg_data.get('features', [])
print(f"Partitioning {len(bldg_features):,} buildings into village files...")

def round_coords(coords):
    if isinstance(coords[0], (int, float)):
        return [round(coords[0], 5), round(coords[1], 5)]
    return [round_coords(c) for c in coords]

def get_centroid(coords):
    pts = []
    def extract_pts(c):
        if isinstance(c[0], (int, float)):
            pts.append(c)
        else:
            for sub in c:
                extract_pts(sub)
    extract_pts(coords)
    if not pts:
        return 0, 0
    return sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)

for i, feat in enumerate(bldg_features):
    geom = feat.get('geometry', {})
    coords = geom.get('coordinates', [])
    props = feat.get('properties', {})
    area_m2 = props.get('area_in_me', 0)
    c_lng, c_lat = get_centroid(coords)
    
    # Assign risk
    risk = "Rendah"
    if c_lat < -7.34 or (c_lat < -7.30 and c_lng > 109.70):
        risk = "Tinggi"
    elif c_lat < -7.44 or (c_lng > 109.65 and c_lng < 109.80):
        risk = "Sedang"
        
    clean_feature = {
        "type": "Feature",
        "properties": {
            "id": props.get("id", f"b_{i}"),
            "area_m2": round(area_m2, 1),
            "risk": risk,
            "plus_code": props.get("full_plus_", "")
        },
        "geometry": {
            "type": geom.get("type", "Polygon"),
            "coordinates": round_coords(coords)
        }
    }
    
    # Find matching desa
    for key, d in desa_bounds.items():
        if d['min_lat'] <= c_lat <= d['max_lat'] and d['min_lng'] <= c_lng <= d['max_lng']:
            d['features'].append(clean_feature)
            break

# 3. Write individual village GeoJSON files & create index
index_manifest = {}
saved_count = 0
total_saved_buildings = 0

for key, d in desa_bounds.items():
    feat_count = len(d['features'])
    if feat_count == 0:
        continue
        
    fc = {
        "type": "FeatureCollection",
        "properties": {
            "desa": d['desa'],
            "kecamatan": d['kecamatan'],
            "totalBuildings": feat_count
        },
        "features": d['features']
    }
    
    file_path = os.path.join(OUTPUT_DIR, f"{key}.json")
    with open(file_path, 'w', encoding='utf-8') as out_f:
        json.dump(fc, out_f)
        
    index_manifest[key] = {
        "desa": d['desa'],
        "kecamatan": d['kecamatan'],
        "fileName": f"{key}.json",
        "totalBuildings": feat_count
    }
    saved_count += 1
    total_saved_buildings += feat_count

with open(INDEX_FILE, 'w', encoding='utf-8') as idx_f:
    json.dump(index_manifest, idx_f, indent=2)

print(f"Successfully generated {saved_count} village GeoJSON files in {OUTPUT_DIR}")
print(f"Total partitioned buildings: {total_saved_buildings:,}")
print(f"Index manifest saved to {INDEX_FILE}")
