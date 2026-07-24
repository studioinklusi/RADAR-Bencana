"""
Google Earth Engine (GEE) Service Module for Disaster Hazard Mapping
Handles GEE initialization, Image asset loading, geometry clipping, and zonal statistics via reduceRegion.
"""

import os
import json
import logging
from typing import Optional, Dict, Any, List

# Try importing ee, fallback gracefully if not installed in local environment
try:
    import ee
    GEE_AVAILABLE = True
except ImportError:
    GEE_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("GEEService")


class GEEDisasterService:
    def __init__(self, service_account: Optional[str] = None, key_file: Optional[str] = None):
        self.initialized = False
        self._init_gee(service_account, key_file)

    def _init_gee(self, service_account: Optional[str], key_file: Optional[str]):
        """Initialize Google Earth Engine API using Service Account or default credentials."""
        if not GEE_AVAILABLE:
            logger.warning("Google Earth Engine ('ee') Python library is not installed.")
            return

        try:
            if service_account and key_file and os.path.exists(key_file):
                logger.info(f"Initializing GEE with Service Account: {service_account}")
                credentials = ee.ServiceAccountCredentials(service_account, key_file)
                ee.Initialize(credentials)
            else:
                logger.info("Initializing GEE with default application credentials / high-volume project...")
                try:
                    ee.Initialize(project=os.getenv("GEE_PROJECT_ID", "ee-disaster-hazard-mapping"))
                except Exception:
                    ee.Authenticate()
                    ee.Initialize()
            self.initialized = True
            logger.info("GEE successfully initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize GEE: {str(e)}")
            self.initialized = False

    def get_hazard_image(self, hazard_type: str = "flood") -> Any:
        """
        Loads a hazard raster dataset from GEE Assets or standard datasets.
        In production, replace asset IDs with your custom .tif Asset paths.
        """
        if not self.initialized:
            raise RuntimeError("GEE is not initialized")

        if hazard_type == "flood":
            # Example: JRC Global Surface Water or Sentinel-1 SAR Flood Inundation Model
            water = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select("occurrence")
            dem = ee.Image("USGS/SRTMGL1_003")
            # Classify into hazard levels: 0=Low, 1=Medium, 2=High, 3=Extreme
            hazard = ee.Image(0) \
                .where(water.gt(20).And(dem.lt(100)), 1) \
                .where(water.gt(50).And(dem.lt(50)), 2) \
                .where(water.gt(80).And(dem.lt(20)), 3)
            return hazard.rename("hazard_class")

        elif hazard_type == "landslide":
            # Slope calculated from DEM + precipitation index
            dem = ee.Image("USGS/SRTMGL1_003")
            slope = ee.Terrain.slope(dem)
            hazard = ee.Image(0) \
                .where(slope.gt(15), 1) \
                .where(slope.gt(25), 2) \
                .where(slope.gt(35), 3)
            return hazard.rename("hazard_class")

        elif hazard_type == "wildfire":
            # FIRMS Fire points or Sentinel-2 Canopy Dryness (NDVI)
            s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") \
                .filterDate("2024-06-01", "2024-09-01") \
                .median()
            ndvi = s2.normalizedDifference(["B8", "B4"])
            hazard = ee.Image(0) \
                .where(ndvi.lt(0.4), 1) \
                .where(ndvi.lt(0.25), 2) \
                .where(ndvi.lt(0.15), 3)
            return hazard.rename("hazard_class")

        else:
            # Custom Asset fallback placeholder
            # Custom Asset: ee.Image("projects/your-gee-project/assets/your_hazard_raster")
            asset_path = f"projects/gee-disaster-mapping/assets/{hazard_type}_raster"
            return ee.Image(asset_path).select(0).rename("hazard_class")

    def get_map_tile_url(self, hazard_type: str, geometry_geojson: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Clips the hazard image to administrative geometry (if provided) and gets map tile URL (MapID).
        """
        image = self.get_hazard_image(hazard_type)

        if geometry_geojson:
            ee_geometry = ee.Geometry(geometry_geojson)
            image = image.clip(ee_geometry)

        # Palette for Low (0), Medium (1), High (2), Extreme (3)
        vis_params = {
            "min": 0,
            "max": 3,
            "palette": ["93c5fd", "3b82f6", "1d4ed8", "1e1b4b"]  # Flood palette default
        }

        map_id_dict = image.getMapId(vis_params)

        return {
            "mapId": map_id_dict["mapid"],
            "tileUrlPattern": map_id_dict["tile_fetcher"].url_format,
            "hazardType": hazard_type,
            "isClipped": geometry_geojson is not None
        }

    def compute_zonal_statistics(self, hazard_type: str, geometry_geojson: Dict[str, Any], scale: int = 30) -> Dict[str, Any]:
        """
        Uses reduceRegion to compute total area in hectares per hazard class inside the clicked polygon.
        """
        image = self.get_hazard_image(hazard_type)
        ee_geometry = ee.Geometry(geometry_geojson)

        # Pixel area image in square meters (1 pixel = scale * scale m2)
        pixel_area = ee.Image.pixelArea()

        # Combine hazard class with pixel area
        hazard_with_area = image.addBands(pixel_area)

        # Grouped reduceRegion
        stats = hazard_with_area.reduceRegion(
            reducer=ee.Reducer.sum().group(
                groupField=0,
                groupName="hazard_class"
            ),
            geometry=ee_geometry,
            scale=scale,
            maxPixels=1e9
        )

        raw_groups = stats.get("groups").getInfo()

        # Convert area in m2 to hectares (1 ha = 10,000 m2)
        hectares_by_class = {0: 0.0, 1: 0.0, 2: 0.0, 3: 0.0}
        total_ha = 0.0

        for group in raw_groups:
            cls_id = int(group.get("hazard_class", 0))
            area_m2 = float(group.get("sum", 0.0))
            area_ha = round(area_m2 / 10000.0, 2)
            hectares_by_class[cls_id] = area_ha
            total_ha += area_ha

        low_ha = hectares_by_class.get(0, 0.0)
        medium_ha = hectares_by_class.get(1, 0.0)
        high_ha = hectares_by_class.get(2, 0.0)
        extreme_ha = hectares_by_class.get(3, 0.0)

        # Calculate percentages
        denom = total_ha if total_ha > 0 else 1.0
        return {
            "totalAreaHa": round(total_ha, 2),
            "lowRiskHa": round(low_ha, 2),
            "mediumRiskHa": round(medium_ha, 2),
            "highRiskHa": round(high_ha + extreme_ha, 2),
            "lowRiskPct": round((low_ha / denom) * 100, 1),
            "mediumRiskPct": round((medium_ha / denom) * 100, 1),
            "highRiskPct": round(((high_ha + extreme_ha) / denom) * 100, 1),
            "scaleMeters": scale,
            "geeReducerUsed": "reduceRegion(sum.group)"
        }
