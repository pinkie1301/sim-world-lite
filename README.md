# Omni Scope

Interactive 3D Spatial Visualization — 可多場景切換的 3D 互動空間視覺化平台，支援 UAV 無人機自動飛行與手動操控，並整合 Sionna RT 無線通道模擬（ISS / TSS / CFAR 地圖生成）。

---

## 目錄 / Table of Contents

- [繁體中文](#繁體中文)
  - [簡介](#簡介)
  - [快速開始](#快速開始)
    - [環境需求](#環境需求)
    - [安裝 Git LFS](#安裝-git-lfs)
    - [安裝與執行](#安裝與執行)
    - [啟動後端](#啟動後端sionna-計算服務)
    - [可用指令](#可用指令)
  - [專案結構](#專案結構)
  - [技術架構](#技術架構)
    - [渲染管線](#渲染管線)
    - [核心技術棧](#核心技術棧)
    - [Sionna 地圖模組](#sionna-地圖模組)
    - [裝置設定面板](#裝置設定面板)
    - [UAV 飛行系統](#uav-飛行系統)
    - [場景系統](#場景系統)
    - [設定檔](#設定檔--ntpuconfigts)
    - [星空背景](#星空背景--starfieldtsx)
  - [互動操作](#互動操作)
    - [3D 場景操控](#3d-場景操控)
    - [左側裝置面板](#左側裝置面板)
    - [右上角地圖生成](#右上角地圖生成)
    - [上方控制面板](#上方控制面板)
  - [開發注意事項](#開發注意事項)
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
    - [Core Tech Stack](#core-tech-stack)
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

---

# 繁體中文

## 簡介

Omni Scope 是一個基於 Three.js 的 3D 互動場景視覺化專案，以國立臺北大學（NTPU）校園為預設場景，搭配 UAV（無人機）模型，提供即時的 3D 場景瀏覽、場景切換與無人機飛行操控。

本專案整合了 **Sionna RT** 無線通道模擬功能，可生成 ISS（干擾信號強度）、TSS（總信號強度）與 ISS+CFAR（干擾峰值檢測）熱力地圖，並透過左側裝置面板動態設定發射器（TX）、接收器（RX）與干擾源（Jammer）的位置與功率。

技術架構採用 **React + TypeScript + Vite**，透過 **React Three Fiber** 將 Three.js 整合進 React 生態系，實現宣告式的 3D 場景管理。後端採用最小化的 **FastAPI（Python）** 服務，運行 Sionna 射線追蹤計算。

## 快速開始

### 環境需求

- **Git LFS** — 本專案使用 Git LFS 管理 3D 模型檔案（`.glb`），必須先安裝才能正確 clone
- **Node.js** >= 18
- **npm** >= 9
- **Python** >= 3.10（後端 Sionna 服務，GPU 計算需要 CUDA 環境）

### 安裝 Git LFS

3D 模型檔案（共約 17.7 MB）透過 Git LFS 儲存，未安裝 LFS 直接 clone 只會拿到 pointer 檔案，場景將無法載入。

```bash
# macOS
brew install git-lfs

# Ubuntu / Debian
sudo apt install git-lfs

# Windows（已內建於 Git for Windows，若未啟用則執行）
git lfs install
```

安裝後執行一次 `git lfs install` 啟用，之後 clone 即會自動下載 LFS 檔案：

```bash
git clone <repo-url>
```

若已經 clone 但缺少 LFS 檔案，可補拉：

```bash
git lfs pull
```

### 安裝與執行

```bash
# 1. 安裝依賴
npm install

# 2. 啟動開發伺服器（預設 http://localhost:3000）
npm run dev

# 3. 建置生產版本
npm run build

# 4. 預覽生產版本
npm run preview
```

### 啟動後端（Sionna 計算服務）

Sionna 地圖生成功能需要額外啟動 Python 後端（port 8000）。前端透過 Vite proxy 自動轉發 `/api` 請求。

```bash
# 進入後端目錄
cd backend

# 建立 Python 虛擬環境（建議）
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# 安裝依賴（需要 CUDA GPU 環境以執行 Sionna RT）
pip install -r requirements.txt

# 啟動後端（開發模式，自動重載）
uvicorn app:app --port 8000 --reload
```

> **注意**：後端僅在使用地圖生成功能時才需要啟動。若只使用 3D 場景瀏覽與 UAV 操控，純前端即可運作。

### 可用指令

| 指令 | 說明 |
|---|---|
| `npm run dev` | 啟動 Vite 開發伺服器（HMR 熱更新） |
| `npm run build` | TypeScript 型別檢查 + Vite 生產建置 |
| `npm run preview` | 本地預覽 `dist/` 建置產物 |
| `npm run lint` | 執行 TypeScript 型別檢查（不輸出檔案） |

## 專案結構

```
omni-scope/
├── index.html                  # HTML 入口，載入 /src/main.tsx
├── package.json                # 專案設定與依賴管理
├── tsconfig.json               # TypeScript 設定（noEmit，僅型別檢查）
├── vite.config.ts              # Vite 建置設定（alias、dev server、proxy to :8000）
│
├── backend/                    # Python FastAPI 後端（Sionna 計算服務）
│   ├── app.py                  # FastAPI 主體：POST /api/simulate 端點、靜態地圖服務
│   ├── sionna_service_lite.py  # Sionna RT 計算核心：ISS / TSS / CFAR 地圖生成
│   └── requirements.txt        # Python 依賴（sionna, tensorflow, scipy 等）
│
├── public/                     # 靜態資源（Vite 直接複製到 dist/）
│   ├── models/
│   │   ├── jam.glb             # Jam 干擾源 3D 模型
│   │   ├── tower.glb           # Tower 發射塔 3D 模型
│   │   └── uav.glb             # UAV 無人機 3D 模型（含骨架動畫，9.9 MB）
│   ├── maps/
│   │   └── ntpu/               # NTPU 場景生成的地圖圖片（後端寫入）
│   │       ├── iss_map.png
│   │       ├── tss_map.png
│   │       └── cfar_map.png
│   └── scenes/
│       └── NTPU/               # NTPU 場景資源資料夾
│           ├── NTPU.glb        # 國立臺北大學校園 3D 場景模型（7.8 MB）
│           ├── NTPU.xml        # Sionna RT 場景幾何描述（Mitsuba XML）
│           └── mesh/           # Sionna 所需的建物 PLY 網格檔案
│
├── src/
│   ├── main.tsx                # 應用程式入口：掛載 React 到 DOM
│   ├── App.tsx                 # 根元件：狀態管理、UI 面板組合、Modal 控制
│   │
│   ├── types/
│   │   └── device.ts           # Device、DeviceRole、MapType 型別定義
│   │
│   ├── store/
│   │   └── useDeviceStore.ts   # Zustand store：TX / RX / Jammer 裝置狀態
│   │
│   ├── services/
│   │   └── simulationApi.ts    # generateMap()：呼叫後端 API，回傳 Blob URL
│   │
│   ├── config/
│   │   ├── ntpu.config.ts      # NTPU 場景設定（地理座標、模型路徑、相機參數）
│   │   └── scenes.ts           # 場景定義檔（SceneId、SCENES 陣列）
│   │
│   ├── hooks/
│   │   └── useManualControl.ts # UAV 手動方向狀態管理 hook
│   │
│   ├── styles/
│   │   └── main.scss           # 全域樣式（CSS reset、DevicePanel、SimPanel、Modal）
│   │
│   └── components/
│       ├── scene/              # 3D 場景元件
│       │   ├── MainScene.tsx   # 主場景容器（從 DeviceStore 動態讀取裝置位置）
│       │   ├── NTPUScene.tsx   # NTPU 校園模型載入與材質處理
│       │   ├── UAVFlight.tsx   # UAV 飛行核心元件（自動/手動飛行、骨架動畫）
│       │   ├── UAVPathVisualization.tsx  # UAV 飛行軌跡 3D 視覺化
│       │   ├── Jam.tsx         # Jam 干擾源模型載入
│       │   └── Tower.tsx       # Tower 發射塔（TX）模型載入
│       │
│       └── ui/                 # UI 元件
│           ├── DevicePanel.tsx      # 左側固定 sidebar（TX / RX / Jammer 設定）
│           ├── SimulationPanel.tsx  # 右上角地圖生成面板（下拉選單 + 生成按鈕）
│           ├── SimulationResultModal.tsx  # 結果彈出視窗（地圖圖片 + 下載）
│           ├── SceneSelector.tsx    # 場景切換下拉選單
│           ├── UAVControlPanel.tsx  # UAV 控制面板
│           └── Starfield.tsx        # CSS 星空背景動畫
│
└── dist/                       # 建置輸出（.gitignore 忽略）
```

## 技術架構

### 渲染管線

```
index.html
  → src/main.tsx              React 掛載點
    → App.tsx                 根元件（UAV 狀態 + 場景 ID + Modal 控制）
      ├── DevicePanel         左側固定 sidebar（TX / RX / Jammer 裝置設定）
      ├── SceneSelector       場景切換下拉選單
      ├── UAVControlPanel     UAV 操控面板
      ├── SimulationPanel     右上角地圖生成面板（下拉選單 → POST /api/simulate）
      ├── SimulationResultModal  計算完成後彈出的地圖顯示視窗
      └── MainScene.tsx       Canvas + 相機 + 燈光 + 場景組合
            ├── Starfield       CSS 星空背景（純 CSS animation，零 JS 開銷）
            ├── NTPUScene       校園 3D 模型（依 sceneId 條件渲染）
            ├── UAVFlight       UAV 無人機（GLB + SkeletonUtils + useFrame 每幀運算）
            ├── UAVPathVisualization  飛行軌跡線 + 起終點標記 + 脈動位置球
            ├── Jam × N         干擾源模型（動態，依 DeviceStore jammer 列表渲染）
            └── Tower × N       發射塔模型（動態，依 DeviceStore tx 列表渲染）
```

**後端資料流**：

```
前端 SimulationPanel
  → POST /api/simulate { scene, map_type, devices[] }
    → Vite proxy → FastAPI (port 8000)
      → sionna_service_lite.generate_maps()
        → Sionna RT RadioMapSolver（GPU 射線追蹤）
        → scipy CFAR 峰值檢測（map_type=cfar）
        → matplotlib 繪圖 → PNG
      → StreamingResponse (image/png)
  → 前端接收 Blob → URL.createObjectURL() → SimulationResultModal 顯示
  → 同時寫入 public/maps/{scene}/{map_type}_map.png
```

### 核心技術棧

| 技術 | 版本 | 用途 |
|---|---|---|
| **React** | 19.2 | UI 框架 |
| **TypeScript** | 5.9 | 型別安全 |
| **Vite** | 7.1 | 開發伺服器與建置工具 |
| **Three.js** | 0.180 | WebGL 3D 渲染引擎 |
| **React Three Fiber** | 9.4 | Three.js 的 React 宣告式封裝 |
| **Drei** | 10.7 | R3F 常用工具集（OrbitControls、PerspectiveCamera、useGLTF 等） |
| **Zustand** | latest | 前端全域狀態管理（裝置設定） |
| **Sass** | 1.93 | CSS 預處理器 |
| **FastAPI** | ≥0.111 | Python 後端框架（Sionna 計算服務） |
| **Sionna RT** | ≥0.1 | GPU 射線追蹤無線通道模擬 |
| **TensorFlow** | ≥2.15 | Sionna 計算後端 |
| **scipy / scikit-image** | latest | 高斯平滑、CFAR 峰值檢測 |
| **matplotlib** | ≥3.8 | 地圖 PNG 繪製 |

### Sionna 地圖模組

`backend/sionna_service_lite.py` 是從 sim-world 主專案萃取的無線通道計算核心，去除所有資料庫依賴，改以請求體中的設備列表直接計算。

#### 支援的地圖類型

| 類型 | 說明 | 色彩映射 |
|---|---|---|
| `iss` | 干擾信號強度（Interference Signal Strength） | hot |
| `tss` | 總信號強度（Total Signal Strength） | viridis |
| `cfar` | ISS 熱力圖 + 2D-CFAR 干擾峰值標記疊加 | hot + 青色 `×` 標記 |

#### 計算流程

1. 接收來自前端的裝置列表（Three.js 座標）
2. 座標轉換：Three.js `[x, y_height, z]` → Sionna RT `[x, -z, y_height]`（Z-up 右手系統）
3. 載入 Sionna XML 場景幾何體
4. 建立 Transmitter（TX + Jammer）、Receiver（RX/UAV）
5. RadioMapSolver 執行 GPU 射線追蹤，計算各 cell 的接收功率（RSS）
6. 分離 desired TX / Jammer 的 RSS：
   - `ISS = Σ RSS[jammer]`（干擾功率）
   - `TSS = Σ RSS[all]`（總功率）
7. 高斯平滑（`scipy.ndimage.gaussian_filter`）
8. CFAR 峰值檢測（`skimage.feature.peak_local_max` 或 sliding-window fallback）
9. matplotlib 繪圖，疊加 TX / RX / Jammer / CFAR 峰值標記
10. 寫入 `public/maps/{scene}/` 並以 StreamingResponse 回傳

#### 地圖輸出目錄

每個場景的地圖圖片儲存於獨立子資料夾，便於未來擴充新場景：

```
public/maps/
├── ntpu/
│   ├── iss_map.png
│   ├── tss_map.png
│   └── cfar_map.png
└── {future_scene}/
    └── ...
```

### 裝置設定面板

`DevicePanel.tsx`（左側固定 sidebar）使用 **Zustand**（`useDeviceStore`）管理裝置狀態，修改即時同步至 3D 場景中的 Tower / Jam 模型位置。

| 區段 | 說明 | 預設值 |
|---|---|---|
| **TX（發射器）** | 可新增多個，對應 Tower 模型，有功率欄位 | tx-0: [150, 0, 150], 20 dBm |
| **RX（UAV）** | 唯一一個，對應 UAV 初始位置，無功率欄位 | rx-0: [0, 40, 0] |
| **Jammer（干擾源）** | 可新增多個，對應 Jam 模型，有功率欄位 | jam-0: [-150, 0, -150], 10 dBm |

每個裝置提供：名稱輸入、X / Y / Z 座標輸入（Three.js 單位，公尺）、功率（dBm，TX/Jammer 限定）。

### UAV 飛行系統

`UAVFlight.tsx` 是 UAV 的核心元件，包含完整的飛行物理、動畫與手動控制邏輯。

#### 自動飛行模式（5 種）

| 模式 | 路徑類型 | 速度因子 | 擾動強度 |
|------|----------|----------|----------|
| `zigzag`（預設） | Z 字形掃描 | 0.7× | 低（0.1） |
| `cruise` | Bézier 曲線 | 1.0× | 低（0.2） |
| `hover` | Bézier 曲線 | 0.6× | 中（0.4） |
| `agile` | Bézier 曲線 | 1.5× | 低（0.1） |
| `explore` | Bézier 曲線 | 0.8× | 中（0.3） |

**物理模型**：每幀計算速度加速/減速平滑、慣性補正、2 秒週期性亂流擾動。

#### 手動控制（12 種方向指令）

`up` / `down` / `left` / `right` / `ascend` / `descend` /
`left-up` / `right-up` / `left-down` / `right-down` / `rotate-left` / `rotate-right`

#### 3D 骨架動畫

- 載入 `uav.glb` 中的 `hover` AnimationClip
- 使用 `THREE.AnimationMixer` 驅動骨架動畫
- 啟用時補正 Y 軸偏移（`HOVER_ANIMATION_Y_OFFSET = -1.28`）
- 使用 `SkeletonUtils.clone()` 確保骨架獨立

#### 飛行軌跡視覺化（`UAVPathVisualization.tsx`）

- 以 `THREE.BufferGeometry` 繪製彩色飛行軌跡線（頂點著色）
- 起點顯示綠色錐形標記、終點顯示紅色錐形標記
- 當前位置顯示脈動的白色球體（`useFrame` sine 波縮放）
- 最多保留 1000 個路徑點

### 場景系統

場景定義集中在 `src/config/scenes.ts`：

```typescript
export type SceneId = 'ntpu'; // 擴充時加入新 id

export const SCENES: SceneDef[] = [
  { id: 'ntpu', label: '臺北大學 NTPU', description: 'National Taipei University' },
  // 在此加入新場景...
];
```

`MainScene.tsx` 根據 `sceneId` 條件渲染對應場景：

```tsx
{sceneId === 'ntpu' && <NTPUScene />}
// {sceneId === 'yourScene' && <YourSceneComponent />}
```

**新增場景步驟**：
1. 在 `scenes.ts` 的 `SceneId` union 加入新 id
2. 在 `SCENES` 陣列加入對應的 label / description
3. 建立場景元件（參考 `NTPUScene.tsx`）
4. 在 `MainScene.tsx` 加入條件渲染分支

### 設定檔 — `ntpu.config.ts`

```typescript
{
  observer: { name, latitude, longitude, altitude },  // 觀測站地理座標
  scene:    { modelPath, position, scale, rotation },  // 校園模型設定
  uav:      { modelPath },                             // UAV 模型路徑
  jam:      { modelPath },                             // 干擾源模型路徑
  tower:    { modelPath },                             // 發射塔模型路徑
  camera:   { initialPosition, fov, near, far },       // 相機參數
}
```

### 星空背景 — `Starfield.tsx`

- 生成 180 顆隨機分布的星星
- 使用純 **CSS `@keyframes` animation** 處理閃爍效果
- 不使用任何 JS 計時器或 React state 更新，零效能開銷
- 置於 Canvas 後方，透過 `pointer-events: none` 不影響 3D 互動

## 互動操作

### 3D 場景操控

| 操作 | 說明 |
|---|---|
| 滑鼠左鍵拖曳 | 旋轉場景 |
| 滑鼠右鍵拖曳 | 平移場景 |
| 滾輪 | 縮放（距離限制 10 ~ 2000） |

### 左側裝置面板

固定於畫面左側，可設定 TX / RX / Jammer 裝置：

| 操作 | 說明 |
|---|---|
| 名稱輸入 | 修改裝置識別名稱 |
| X / Y / Z 座標輸入 | 即時移動 3D 場景中對應的 Tower / Jam 模型 |
| 功率（dBm）輸入 | 調整發射功率（TX / Jammer），影響 Sionna 計算結果 |
| **+ 新增** 按鈕 | TX / Jammer 可新增多個裝置 |
| **✕** 刪除按鈕 | 移除指定裝置（TX / Jammer） |

### 右上角地圖生成

| 步驟 | 說明 |
|---|---|
| 點擊「🗺 地圖生成」 | 展開下拉選單 |
| 選擇地圖類型 | ISS Map / TSS Map / ISS+CFAR Map |
| 點擊「生成地圖」 | 顯示「Sionna 計算中，請稍候…」spinner |
| 計算完成 | 自動關閉選單，彈出結果視窗顯示地圖圖片 |
| 結果視窗 | 可查看地圖、下載圖片、按 Esc 或點擊背景關閉 |

> **需要後端運行**：Sionna 計算需先啟動 `backend/app.py`（port 8000）。

### 上方控制面板

| 元件 | 功能 |
|---|---|
| **Scene 下拉選單** | 點擊展開，切換不同 3D 場景 |
| **AUTO / MANUAL** | 切換 UAV 自動飛行（ZigZag）與手動控制模式 |
| **ANIM ON / OFF** | 開關 UAV 骨架懸停動畫 |
| **方向鍵（3×3）** | Manual 模式下控制 UAV 平面移動（支援斜向，長按持續移動） |
| **Ascend / Descend** | 控制 UAV 升降（長按持續移動） |
| **Rot L / Rot R** | 控制 UAV 旋轉（長按持續移動） |
| **X / Y / Z** | 即時顯示 UAV 當前座標 |

## 開發注意事項

- `tsconfig.json` 設定 `"noEmit": true`，TypeScript 僅做型別檢查，實際轉譯由 Vite 處理
- `vite.config.ts` 設定 `@` 別名指向 `src/`，同時設定 `/api` proxy 指向 `http://localhost:8000`
- `.glb` 模型放在 `public/` 目錄下，Vite 會在建置時直接複製，不經過打包處理
- UAV 飛行軌跡點數上限為 1000，超過後自動捨棄最舊的點
- 地圖圖片寫入 `public/maps/{scene}/`，git 僅追蹤目錄結構（`.gitkeep`），不追蹤生成的 PNG
- Zustand store（`useDeviceStore`）中的裝置座標為 **Three.js 座標系**（Y-up），後端自動轉換至 Sionna 座標系（Z-up）
- 新增場景時，在 `public/maps/` 建立對應子資料夾（如 `public/maps/new-scene/`）供後端圖片輸出使用

---

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

### Core Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2 | UI framework |
| **TypeScript** | 5.9 | Type safety |
| **Vite** | 7.1 | Dev server & build tool |
| **Three.js** | 0.180 | WebGL 3D rendering engine |
| **React Three Fiber** | 9.4 | Declarative React wrapper for Three.js |
| **Drei** | 10.7 | R3F utility collection (OrbitControls, PerspectiveCamera, useGLTF, etc.) |
| **Zustand** | latest | Global state management (device configuration) |
| **Sass** | 1.93 | CSS preprocessor |
| **FastAPI** | ≥0.111 | Python backend framework (Sionna computation service) |
| **Sionna RT** | ≥0.1 | GPU ray-tracing wireless channel simulation |
| **TensorFlow** | ≥2.15 | Sionna computation backend |
| **scipy / scikit-image** | latest | Gaussian smoothing, CFAR peak detection |
| **matplotlib** | ≥3.8 | Map PNG rendering |

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