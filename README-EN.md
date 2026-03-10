# Omni Scope

Interactive 3D Spatial Visualization — 可多場景切換的 3D 互動空間視覺化平台，支援 UAV 無人機自動飛行與手動操控，並整合 Sionna RT 無線通道模擬（ISS / TSS / CFAR 地圖生成）。

---

## 目錄 / Table of Contents

- [English](#english)
  - [Introduction](#introduction)
  - [Quick Start](#quick-start)
    - [Prerequisites](#prerequisites)
    - [Installing Git LFS](#installing-git-lfs)
    - [Installation & Running](#installation--running)
    - [Starting the Backend](#starting-the-backendsionna-computation)
    - [Available Scripts](#available-scripts)
  - [Project Structure](#project-structure)
  - [Technical Architecture](#technical-architecture)
    - [Rendering Pipeline](#rendering-pipeline)
    - [Sionna Map Module](#sionna-map-module)
    - [Device Configuration Panel](#device-configuration-panel)
    - [UAV Flight System](#uav-flight-system)
    - [Scene System](#scene-system)
    - [Configuration](#configuration--ntpuconfigts)
    - [Starfield Background](#starfield-background--starfieldtsx)
  - [Controls](#controls)
    - [3D Scene Navigation](#3d-scene-navigation)
    - [Left Device Panel](#left-device-panel)
    - [Top-Right Map Generation](#top-right-map-generation)
    - [Control Panel](#control-panel)
  - [Development Notes](#development-notes)
# English

## Introduction

Omni Scope is a Three.js-based interactive 3D spatial visualization project. It features multi-scene switching, a UAV (drone) with autonomous flight and manual control, real-time flight path visualization, and integrated **Sionna RT** wireless channel simulation for generating ISS / TSS / CFAR interference maps.

The tech stack uses **React + TypeScript + Vite**, with **React Three Fiber** integrating Three.js into the React ecosystem for declarative 3D scene management. A minimal **FastAPI (Python)** backend runs the Sionna ray-tracing computation.

## Quick Start

### Prerequisites

- **Git LFS** — This project uses Git LFS to manage 3D model files (`.glb`). It must be installed before cloning.
- **Node.js** >= 18
- **npm** >= 9
- **Python** >= 3.10 (for the Sionna backend; CUDA GPU required for ray-tracing)

### Installing Git LFS

The 3D model files (~17.7 MB total) are stored via Git LFS. Without LFS installed, cloning will only download pointer files and the 3D scene will fail to load.

```bash
# macOS
brew install git-lfs

# Ubuntu / Debian
sudo apt install git-lfs

# Windows (bundled with Git for Windows; if not enabled, run:)
git lfs install
```

After installation, run `git lfs install` once to activate, then clone as usual:

```bash
git clone <repo-url>
```

If you already cloned without LFS, pull the missing files:

```bash
git lfs pull
```

### Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (default: http://localhost:3000)
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

### Starting the Backend（Sionna Computation）

The Sionna map generation feature requires a separate Python backend (port 8000). The frontend proxies all `/api` requests via Vite automatically.

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# Install dependencies (CUDA GPU required for Sionna RT)
pip install -r requirements.txt

# Start the backend (with auto-reload)
uvicorn app:app --port 8000 --reload
```

> **Note**: The backend is only required when using the map generation panel. The 3D scene viewer and UAV controls work without it.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server (HMR enabled) |
| `npm run build` | TypeScript type check + Vite production build |
| `npm run preview` | Preview the `dist/` build output locally |
| `npm run lint` | Run TypeScript type checking (no file output) |

## Project Structure

```
omni-scope/
├── index.html                  # HTML entry, loads /src/main.tsx
├── package.json                # Project config & dependency management
├── tsconfig.json               # TypeScript config (noEmit, type-check only)
├── vite.config.ts              # Vite config (alias, dev server, proxy to :8000)
│
├── backend/                    # Python FastAPI backend (Sionna computation)
│   ├── app.py                  # FastAPI: POST /api/simulate endpoint + static map files
│   ├── sionna_service_lite.py  # Sionna RT core: ISS / TSS / CFAR map generation
│   └── requirements.txt        # Python deps (sionna, tensorflow, scipy, etc.)
│
├── public/                     # Static assets (copied directly to dist/ by Vite)
│   ├── models/
│   │   ├── jam.glb             # Jammer 3D model
│   │   ├── tower.glb           # Tower (TX) 3D model
│   │   └── uav.glb             # UAV drone model with skeleton animation (9.9 MB)
│   ├── maps/
│   │   └── ntpu/               # Generated map images for the NTPU scene (written by backend)
│   │       ├── iss_map.png
│   │       ├── tss_map.png
│   │       └── cfar_map.png
│   └── scenes/
│       └── NTPU/               # NTPU scene assets folder
│           ├── NTPU.glb        # NTPU campus 3D scene model (7.8 MB)
│           ├── NTPU.xml        # Sionna RT scene geometry (Mitsuba XML)
│           └── mesh/           # Building PLY mesh files required by Sionna RT
│
├── src/
│   ├── main.tsx                # App entry: mounts React to DOM
│   ├── App.tsx                 # Root component: state management, UI composition, modal control
│   │
│   ├── types/
│   │   └── device.ts           # Device, DeviceRole, MapType type definitions
│   │
│   ├── store/
│   │   └── useDeviceStore.ts   # Zustand store: TX / RX / Jammer device state
│   │
│   ├── services/
│   │   └── simulationApi.ts    # generateMap(): calls backend API, returns Blob URL
│   │
│   ├── config/
│   │   ├── ntpu.config.ts      # NTPU scene config (coordinates, model paths, camera)
│   │   └── scenes.ts           # Scene registry (SceneId type + SCENES array)
│   │
│   ├── hooks/
│   │   └── useManualControl.ts # UAV manual direction state hook
│   │
│   ├── styles/
│   │   └── main.scss           # Global styles (reset, DevicePanel, SimPanel, Modal)
│   │
│   └── components/
│       ├── scene/
│       │   ├── MainScene.tsx   # Main scene container (reads device positions from DeviceStore)
│       │   ├── NTPUScene.tsx   # NTPU campus model loading & material processing
│       │   ├── UAVFlight.tsx   # UAV flight core (auto/manual, skeleton animation, physics)
│       │   ├── UAVPathVisualization.tsx  # 3D flight path trail visualization
│       │   ├── Jam.tsx         # Jammer model loading
│       │   └── Tower.tsx       # Tower (TX) model loading
│       │
│       └── ui/
│           ├── DevicePanel.tsx          # Left sidebar: TX / RX / Jammer device configuration
│           ├── SimulationPanel.tsx      # Top-right: map type selector + generate button
│           ├── SimulationResultModal.tsx  # Result modal: map image + download
│           ├── SceneSelector.tsx        # Scene switching dropdown
│           ├── UAVControlPanel.tsx      # UAV control panel
│           └── Starfield.tsx            # CSS starfield background animation
│
└── dist/                       # Build output (gitignored)
```

## Technical Architecture

### Rendering Pipeline

```
index.html
  → src/main.tsx              React mount point
    → App.tsx                 Root (UAV state + scene ID + modal control)
      ├── DevicePanel         Left sidebar: TX / RX / Jammer device settings
      ├── SceneSelector       Scene switching dropdown
      ├── UAVControlPanel     UAV control panel
      ├── SimulationPanel     Top-right: map type selector → POST /api/simulate
      ├── SimulationResultModal  Map display modal after computation
      └── MainScene.tsx       Canvas + camera + lights + composition
            ├── Starfield       CSS starfield (pure CSS animation, zero JS overhead)
            ├── NTPUScene       Campus model (conditionally rendered by sceneId)
            ├── UAVFlight       UAV drone (GLB + SkeletonUtils + useFrame per-frame logic)
            ├── UAVPathVisualization  Path trail + start/end markers + pulsing ball
            ├── Jam × N         Jammer models (dynamic, driven by DeviceStore)
            └── Tower × N       Tower models (dynamic, driven by DeviceStore)
```

**Backend data flow**:

```
Frontend SimulationPanel
  → POST /api/simulate { scene, map_type, devices[] }
    → Vite proxy → FastAPI (port 8000)
      → sionna_service_lite.generate_maps()
        → Sionna RT RadioMapSolver (GPU ray tracing)
        → scipy CFAR peak detection (map_type=cfar)
        → matplotlib rendering → PNG
      → StreamingResponse (image/png)
  → Frontend receives Blob → URL.createObjectURL() → SimulationResultModal
  → Also written to public/maps/{scene}/{map_type}_map.png
```


### Sionna Map Module

`backend/sionna_service_lite.py` is the wireless channel computation core extracted from the sim-world main project, with all database dependencies removed — devices are passed directly as a list in the request body.

#### Supported Map Types

| Type | Description | Color map |
|---|---|---|
| `iss` | Interference Signal Strength | hot |
| `tss` | Total Signal Strength | viridis |
| `cfar` | ISS heatmap + 2D-CFAR interference peak markers | hot + cyan `×` markers |

#### Computation Pipeline

1. Receive device list from frontend (Three.js coordinates)
2. Coordinate conversion: Three.js `[x, y_height, z]` → Sionna RT `[x, -z, y_height]` (Z-up right-hand system)
3. Load Sionna XML scene geometry
4. Place Transmitters (TX + Jammer) and Receiver (RX/UAV)
5. RadioMapSolver performs GPU ray tracing, computing received power (RSS) per cell
6. Separate desired TX / Jammer RSS:
   - `ISS = Σ RSS[jammer]` (interference power)
   - `TSS = Σ RSS[all]` (total power)
7. Gaussian smoothing (`scipy.ndimage.gaussian_filter`)
8. CFAR peak detection (`skimage.feature.peak_local_max` or sliding-window fallback)
9. matplotlib rendering with TX / RX / Jammer / CFAR peak markers
10. Write to `public/maps/{scene}/` and return as StreamingResponse

#### Map Output Directory

Each scene's maps are stored in their own subfolder, making it easy to add new scenes in the future:

```
public/maps/
├── ntpu/
│   ├── iss_map.png
│   ├── tss_map.png
│   └── cfar_map.png
└── {future_scene}/
    └── ...
```

### Device Configuration Panel

`DevicePanel.tsx` (left sidebar) uses **Zustand** (`useDeviceStore`) to manage device state. Changes are immediately reflected in the 3D scene (Tower / Jam model positions).

| Section | Description | Defaults |
|---|---|---|
| **TX (Transmitter)** | Multiple allowed; mapped to Tower models; power field included | tx-0: [150, 0, 150], 20 dBm |
| **RX (UAV)** | Exactly one; sets UAV initial position; no power field | rx-0: [0, 40, 0] |
| **Jammer** | Multiple allowed; mapped to Jam models; power field included | jam-0: [-150, 0, -150], 10 dBm |
| **Three.js** | 0.180 | WebGL 3D rendering engine |
| **React Three Fiber** | 9.4 | Declarative React wrapper for Three.js |
| **Drei** | 10.7 | R3F utility collection (OrbitControls, PerspectiveCamera, useGLTF, etc.) |
| **Sass** | 1.93 | CSS preprocessor |

### UAV Flight System

`UAVFlight.tsx` is the UAV core component, containing full flight physics, animation, and manual control logic.

#### Automatic Flight Modes (5 modes)

| Mode | Path Type | Speed Factor | Turbulence |
|------|-----------|--------------|------------|
| `zigzag` (default) | Z-pattern scan | 0.7× | Low (0.1) |
| `cruise` | Bézier curve | 1.0× | Low (0.2) |
| `hover` | Bézier curve | 0.6× | Medium (0.4) |
| `agile` | Bézier curve | 1.5× | Low (0.1) |
| `explore` | Bézier curve | 0.8× | Medium (0.3) |

**Physics model**: Per-frame velocity smoothing with acceleration/deceleration, inertia correction, and 2-second periodic turbulence.

#### Manual Control (12 directions)

`up` / `down` / `left` / `right` / `ascend` / `descend` /
`left-up` / `right-up` / `left-down` / `right-down` / `rotate-left` / `rotate-right`

#### Skeleton Animation

- Loads the `hover` AnimationClip from `uav.glb`
- Driven by `THREE.AnimationMixer` via `useFrame`
- Y-axis offset correction when active (`HOVER_ANIMATION_Y_OFFSET = -1.28`)
- `SkeletonUtils.clone()` ensures independent skeleton per instance

#### Flight Path Visualization (`UAVPathVisualization.tsx`)

- Colored path line rendered with `THREE.BufferGeometry` (vertex colors)
- Green cone marker at start, red cone at end
- Pulsing white sphere at current position (sine-wave scale via `useFrame`)
- Rolling window capped at 1000 path points

### Scene System

Scenes are defined in `src/config/scenes.ts`:

```typescript
export type SceneId = 'ntpu'; // add new IDs here

export const SCENES: SceneDef[] = [
  { id: 'ntpu', label: 'NTPU Campus', description: 'National Taipei University' },
  // add new scenes here...
];
```

`MainScene.tsx` renders scenes conditionally based on `sceneId`:

```tsx
{sceneId === 'ntpu' && <NTPUScene />}
// {sceneId === 'yourScene' && <YourSceneComponent />}
```

**To add a new scene**:
1. Add the new `id` to the `SceneId` union in `scenes.ts`
2. Add the entry to the `SCENES` array (label + description)
3. Create the scene component (see `NTPUScene.tsx` as reference)
4. Add the conditional render branch in `MainScene.tsx`

### Configuration — `ntpu.config.ts`

```typescript
{
  observer: { name, latitude, longitude, altitude },  // Observer geographic coordinates
  scene:    { modelPath, position, scale, rotation },  // Campus model settings
  uav:      { modelPath },                             // UAV model path
  jam:      { modelPath },                             // Jammer model path
  tower:    { modelPath },                             // Tower model path
  camera:   { initialPosition, fov, near, far },       // Camera parameters
}
```

### Starfield Background — `Starfield.tsx`

- Generates 180 randomly distributed stars
- Pure **CSS `@keyframes` animation** for twinkling — no JS timers or React state updates
- Positioned behind the Canvas with `pointer-events: none`

## Controls

### 3D Scene Navigation

| Input | Action |
|---|---|
| Left-click drag | Rotate the scene |
| Right-click drag | Pan the scene |
| Scroll wheel | Zoom in/out (distance clamped to 10–2000) |

### Top-Left Control Panel

| Element | Function |
|---|---|
| **Scene dropdown** | Click to expand; select a different 3D scene |
| **AUTO / MANUAL** | Toggle between auto ZigZag flight and manual control |
| **ANIM ON / OFF** | Toggle UAV skeleton hover animation |
| **D-pad (3×3)** | Move UAV in Manual mode — diagonals supported, hold for continuous movement |
| **Ascend / Descend** | Move UAV up/down — hold for continuous movement |
| **Rot L / Rot R** | Rotate UAV — hold for continuous movement |
| **X / Y / Z** | Real-time UAV position coordinates |

## Development Notes

- `tsconfig.json` sets `"noEmit": true` — TypeScript only type-checks; transpilation is handled by Vite
- `vite.config.ts` configures the `@` alias pointing to `src/`, enabling imports like `@/config/...`
- `.glb` models are placed in `public/` — Vite copies them directly to the build output without bundling
- The UAV flight path is capped at 1000 points; older points are discarded once the limit is reached