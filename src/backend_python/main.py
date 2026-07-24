"""
FastAPI Backend Server for Google Earth Engine Disaster Hazard Web GIS
Provides endpoints for GEE Map Tile rendering (clipped) and Zonal Statistics calculation.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging

from gee_service import GEEDisasterService

app = FastAPI(
    title="MapBiomas / Web GIS GEE Disaster Hazard API",
    description="FastAPI service interfacing with Google Earth Engine for hazard raster clipping and zonal statistics.",
    version="1.0.0"
)

# CORS configuration for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize GEE Service
gee_service = GEEDisasterService()


class MapLayerRequest(BaseModel):
    hazardType: str = "flood"
    geometry: Optional[Dict[str, Any]] = None


class ZonalStatsRequest(BaseModel):
    districtId: str
    hazardType: str = "flood"
    geometry: Dict[str, Any]
    scaleMeters: Optional[int] = 30


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "GEE Disaster Hazard Web GIS API",
        "gee_initialized": gee_service.initialized
    }


@app.post("/get-map-layer")
def get_map_layer(payload: MapLayerRequest):
    """
    Accepts an optional GeoJSON geometry (the clicked administrative boundary).
    Loads a GEE Image, applies color palette, clips the image if geometry is provided,
    and returns map tile URL (MapID / tile fetcher pattern).
    """
    try:
        result = gee_service.get_map_tile_url(
            hazard_type=payload.hazardType,
            geometry_geojson=payload.geometry
        )
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        logging.error(f"Error generating map layer: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/get-statistics")
def get_statistics(payload: ZonalStatsRequest):
    """
    Uses reduceRegion to calculate total area in hectares per hazard class specifically
    for the clicked administrative geometry, returning JSON data for the charts.
    """
    try:
        stats = gee_service.compute_zonal_statistics(
            hazard_type=payload.hazardType,
            geometry_geojson=payload.geometry,
            scale=payload.scaleMeters or 30
        )
        return {
            "status": "success",
            "districtId": payload.districtId,
            "data": stats
        }
    except Exception as e:
        logging.error(f"Error computing zonal statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
