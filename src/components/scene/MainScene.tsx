import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import { NTPUScene } from './NTPUScene';
import UAVFlight, { UAVManualDirection } from './UAVFlight';
import UAVPathVisualization, { UAVPathPoint } from './UAVPathVisualization';
import { Jam } from './Jam';
import { Tower } from './Tower';
import { NTPU_CONFIG } from '@/config/ntpu.config';
import { SceneId, getScene } from '@/config/scenes';
import { Starfield } from '../ui/Starfield';
import { ACESFilmicToneMapping } from 'three';
import { useDeviceStore } from '@/store/useDeviceStore';

const UAV_SCALE: [number, number, number] = [10, 10, 10];
const UAV_FALLBACK_POSITION: [number, number, number] = [0, 40, 0];

export interface MainSceneProps {
  auto: boolean;
  manualDirection: UAVManualDirection;
  onManualMoveDone: () => void;
  uavAnimation: boolean;
  onPositionUpdate: (position: [number, number, number]) => void;
  sceneId: SceneId;
}

// 3D 場景中的載入提示
function Loader({ label }: { label: string }) {
  return (
    <Html center>
      <div style={{
        color: 'white',
        fontSize: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '20px 40px',
        borderRadius: '8px',
      }}>
        Loading {label}...
      </div>
    </Html>
  );
}

const SHOW_DEBUG = false; // 設為 true 可顯示調試網格

export function MainScene({
  auto,
  manualDirection,
  onManualMoveDone,
  uavAnimation,
  onPositionUpdate,
  sceneId,
}: MainSceneProps) {
  const sceneDef = getScene(sceneId);

  // Read device positions from global store
  const devices = useDeviceStore((s) => s.devices);
  const txDevices     = devices.filter((d) => d.role === 'tx');
  const jammerDevices = devices.filter((d) => d.role === 'jammer');
  const rxDevice      = devices.find((d) => d.role === 'rx');

  const uavInitialPosition: [number, number, number] = rxDevice
    ? [rxDevice.x, rxDevice.y, rxDevice.z]
    : UAV_FALLBACK_POSITION;

  const [pathPoints, setPathPoints] = useState<UAVPathPoint[]>([]);
  const [currentUAVPosition, setCurrentUAVPosition] = useState<[number, number, number]>(uavInitialPosition);

  const handlePositionUpdate = (pos: [number, number, number]) => {
    setCurrentUAVPosition(pos);
    setPathPoints((prev) => {
      const newPoint: UAVPathPoint = {
        x: pos[0],
        y: pos[1],
        z: pos[2],
        timestamp: Date.now(),
        color: 'rgba(100, 200, 255, 1)',
      };
      const next = [...prev, newPoint];
      return next.length > 1000 ? next.slice(-1000) : next;
    });
    onPositionUpdate(pos);
  };
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
        overflow: 'hidden',
      }}
    >
      <Starfield starCount={180} />

      <Canvas
        shadows
        gl={{
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          alpha: true,
          powerPreference: 'high-performance',
          antialias: true,
        }}
      >
        {/* 相機 */}
        <PerspectiveCamera
          makeDefault
          position={NTPU_CONFIG.camera.initialPosition}
          fov={NTPU_CONFIG.camera.fov}
          near={NTPU_CONFIG.camera.near}
          far={NTPU_CONFIG.camera.far}
        />

        {/* 軌道控制 */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={2000}
          maxPolarAngle={Math.PI / 2}
        />

        {/* 燈光 - 主光源位於正上方中央 */}
        <hemisphereLight args={[0xffffff, 0x444444, 1.0]} />
        <ambientLight intensity={1} />
        <directionalLight
          castShadow
          position={[0, 50, 0]}
          intensity={1.5}
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-near={1}
          shadow-camera-far={1000}
          shadow-camera-top={500}
          shadow-camera-bottom={-500}
          shadow-camera-left={500}
          shadow-camera-right={-500}
          shadow-bias={-0.0004}
          shadow-radius={8}
        />

        {/* 場景模型 */}
        <Suspense fallback={<Loader label={sceneDef.label} />}>
          {sceneId === 'ntpu' && <NTPUScene />}
        </Suspense>

        {/* UAV 飛行元件 */}
        <Suspense fallback={null}>
          <UAVFlight
            position={uavInitialPosition}
            scale={UAV_SCALE}
            auto={auto}
            manualDirection={manualDirection}
            onManualMoveDone={onManualMoveDone}
            onPositionUpdate={handlePositionUpdate}
            uavAnimation={uavAnimation}
          />
        </Suspense>

        {/* UAV 飛行軌跡 */}
        <UAVPathVisualization
          pathPoints={pathPoints}
          currentPosition={currentUAVPosition}
        />

        {/* Jammer 干擾源模型（動態，來自 DeviceStore） */}
        {jammerDevices.map((d) => (
          <Suspense key={d.id} fallback={null}>
            <Jam position={[d.x, d.y, d.z]} scale={0.01} />
          </Suspense>
        ))}

        {/* Tower 發射塔模型（動態，來自 DeviceStore） */}
        {txDevices.map((d) => (
          <Suspense key={d.id} fallback={null}>
            <Tower position={[d.x, d.y, d.z]} scale={0.1} />
          </Suspense>
        ))}

        {/* 網格輔助線（僅調試時顯示） */}
        {SHOW_DEBUG && (
          <>
            <gridHelper args={[1000, 50, '#888888', '#444444']} />
            <axesHelper args={[100]} />
          </>
        )}
      </Canvas>
    </div>
  );
}
