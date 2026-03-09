"""
app.py — sim-world-lite Sionna backend (FastAPI)
================================================
Usage:
  cd backend
  uvicorn app:app --port 8000 --reload

Endpoints
---------
GET  /ping               → health check
POST /api/simulate       → generate ISS / TSS / ISS+CFAR map
                           body: SimulateRequest (JSON)
                           response: StreamingResponse (image/png)
"""

import asyncio
import io
import logging
import os
import pathlib
from concurrent.futures import ProcessPoolExecutor
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sim-world-lite")

# ---------------------------------------------------------------------------
# Paths  (resolve relative to this file's location, which is /backend/)
# ---------------------------------------------------------------------------
_BACKEND_DIR = pathlib.Path(__file__).parent
_PROJECT_ROOT = _BACKEND_DIR.parent
_PUBLIC_MAPS_DIR = _PROJECT_ROOT / "public" / "maps"
_SCENES_DIR = _PROJECT_ROOT / "public" / "scenes"

_PUBLIC_MAPS_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title="sim-world-lite Sionna API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated images as static files
app.mount(
    "/maps",
    StaticFiles(directory=str(_PUBLIC_MAPS_DIR), html=False),
    name="maps",
)


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------

class DeviceIn(BaseModel):
    name: str
    role: str  # "tx" | "rx" | "jammer"
    x: float
    y: float
    z: float
    power_dbm: Optional[float] = Field(default=None)


class SimulateRequest(BaseModel):
    scene: str = "ntpu"
    map_type: str = Field(default="iss", pattern="^(iss|tss|cfar)$")
    # Sionna solver parameters (optional, with sensible defaults)
    cell_size: float = Field(default=4.0, gt=0)
    samples_per_tx: int = Field(default=1_000_000, ge=10_000)
    devices: List[DeviceIn]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/ping")
def ping():
    return {"status": "ok"}


@app.post("/api/simulate")
async def simulate(req: SimulateRequest):
    """
    Run Sionna RadioMapSolver for the requested scene + device configuration
    and stream back the resulting PNG image.
    """
    scene_xml = _SCENES_DIR / req.scene.upper() / f"{req.scene.upper()}.xml"
    if not scene_xml.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Scene XML not found: {scene_xml}",
        )

    output_dir = str(_PUBLIC_MAPS_DIR / req.scene.lower())
    os.makedirs(output_dir, exist_ok=True)

    devices_dicts = [
        {
            "name": d.name,
            "role": d.role,
            "x": d.x,
            "y": d.y,
            "z": d.z,
            **({"power_dbm": d.power_dbm} if d.power_dbm is not None else {}),
        }
        for d in req.devices
    ]

    logger.info(
        "Simulation request: scene=%s, map_type=%s, devices=%d",
        req.scene, req.map_type, len(devices_dicts),
    )

    try:
        # Run blocking Sionna computation in a thread pool to avoid blocking the
        # event loop.  ProcessPoolExecutor would be safer for TF/GPU isolation.
        loop = asyncio.get_event_loop()
        from sionna_service_lite import generate_maps

        out_path: str = await loop.run_in_executor(
            None,
            _run_generate_maps,
            str(scene_xml),
            devices_dicts,
            output_dir,
            req.scene,
            req.map_type,
            req.cell_size,
            req.samples_per_tx,
        )
    except Exception as exc:
        logger.exception("Simulation failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    # Stream the image back
    with open(out_path, "rb") as f:
        image_bytes = f.read()

    return StreamingResponse(
        io.BytesIO(image_bytes),
        media_type="image/png",
        headers={"Content-Disposition": f'inline; filename="{req.map_type}_map.png"'},
    )


def _run_generate_maps(
    scene_xml: str,
    devices: list,
    output_dir: str,
    scene_name: str,
    map_type: str,
    cell_size: float,
    samples_per_tx: int,
) -> str:
    """Synchronous wrapper called inside executor."""
    from sionna_service_lite import generate_maps

    return generate_maps(
        scene_xml_path=scene_xml,
        devices=devices,
        output_dir=output_dir,
        scene_name=scene_name,
        map_type=map_type,
        cell_size=cell_size,
        samples_per_tx=samples_per_tx,
    )
