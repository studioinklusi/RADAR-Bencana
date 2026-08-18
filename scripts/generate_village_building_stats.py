import json
import os
import math

SOURCE_GEOJSON = r'U:\Project\RADAR REBUILD\data\BANGUNAN\bangunan.geojson'
OUTPUT_FILE = r'u:\Project\RADAR REBUILD\public\data\villageBuildingStats.json'

print("Computing village-level building statistics...")

# 1. Load landslide impact features to get desa polygon bounding boxes
with open('public/data/landslideImpactGeo.json', 'r', encoding='utf-8') as f:
    landslide_data = json.load(f)

desa_polys = []
for feat in landslide_data.get('features', []):
    geom = feat.get('geometry', {})
    props = feat.get('properties', {})
    desa = props.get('NAMA_DESA')
    kec = props.get('NAMA_KEC')
    coords = geom.get('coordinates', [])
    
    if not desa or not kec or not coords:
        continue
        
    # extract all pts to find bbox
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
    
    desa_polys.append({
        'desa': desa.strip(),
        'kecamatan': kec.strip(),
        'min_lng': min_lng,
        'max_lng': max_lng,
        'min_lat': min_lat,
        'max_lat': max_lat,
        'populasi': props.get('JML_JIWA', 0),
        'luas_ha': props.get('LUAS_HA', 0)
    })

print(f"Loaded {len(desa_polys)} desa polygon bounds")

# 2. Group by unique desa
unique_desa = {}
for dp in desa_polys:
    key = f"{dp['desa'].lower()}_{dp['kecamatan'].lower()}"
    if key not in unique_desa:
        unique_desa[key] = {
            'desa': dp['desa'],
            'kecamatan': dp['kecamatan'],
            'min_lng': dp['min_lng'],
            'max_lng': dp['max_lng'],
            'min_lat': dp['min_lat'],
            'max_lat': dp['max_lat'],
            'totalBuildings': 0,
            'totalAreaM2': 0,
            'highRiskBuildings': 0,
            'mediumRiskBuildings': 0,
            'lowRiskBuildings': 0,
            'totalPopulasi': dp['populasi'],
            'totalLuasHa': dp['luas_ha']
        }
    else:
        unique_desa[key]['min_lng'] = min(unique_desa[key]['min_lng'], dp['min_lng'])
        unique_desa[key]['max_lng'] = max(unique_desa[key]['max_lng'], dp['max_lng'])
        unique_desa[key]['min_lat'] = min(unique_desa[key]['min_lat'], dp['min_lat'])
        unique_desa[key]['max_lat'] = max(unique_desa[key]['max_lat'], dp['max_lat'])
        unique_desa[key]['totalPopulasi'] += dp['populasi']
        unique_desa[key]['totalLuasHa'] += dp['luas_ha']

# 3. Load Building Footprints
with open(SOURCE_GEOJSON, 'r', encoding='utf-8') as f:
    bldg_data = json.load(f)

bldg_features = bldg_data.get('features', [])
print(f"Assigning {len(bldg_features):,} buildings to villages...")

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

for feat in bldg_features:
    geom = feat.get('geometry', {})
    props = feat.get('properties', {})
    area_m2 = props.get('area_in_me', 0)
    c_lng, c_lat = get_centroid(geom.get('coordinates', []))
    
    # Assign risk
    risk = "Rendah"
    if c_lat < -7.34 or (c_lat < -7.30 and c_lng > 109.70):
        risk = "Tinggi"
    elif c_lat < -7.44 or (c_lng > 109.65 and c_lng < 109.80):
        risk = "Sedang"
        
    for k, d in unique_desa.items():
        if d['min_lat'] <= c_lat <= d['max_lat'] and d['min_lng'] <= c_lng <= d['max_lng']:
            d['totalBuildings'] += 1
            d['totalAreaM2'] += area_m2
            if risk == 'Tinggi':
                d['highRiskBuildings'] += 1
            elif risk == 'Sedang':
                d['mediumRiskBuildings'] += 1
            else:
                d['lowRiskBuildings'] += 1
            break

# Clean up results
final_stats = {}
for k, v in unique_desa.items():
    final_stats[k] = {
        'desa': v['desa'],
        'kecamatan': v['kecamatan'],
        'totalBuildings': v['totalBuildings'],
        'totalAreaM2': round(v['totalAreaM2'], 2),
        'highRiskBuildings': v['highRiskBuildings'],
        'mediumRiskBuildings': v['mediumRiskBuildings'],
        'lowRiskBuildings': v['lowRiskBuildings'],
        'totalPopulasi': round(v['totalPopulasi']),
        'totalLuasHa': round(v['totalLuasHa'], 2)
    }

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(final_stats, f, indent=2)

print(f"Saved {len(final_stats)} village stats to {OUTPUT_FILE}")
wanadri_key = [k for k in final_stats if 'wanadri' in k]
if wanadri_key:
    print("Wanadri final stats:", final_stats[wanadri_key[0]])
