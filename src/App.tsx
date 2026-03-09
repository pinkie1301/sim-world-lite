import { useState, useCallback } from 'react';
import { MainScene } from './components/scene/MainScene';
import { UAVControlPanel } from './components/ui/UAVControlPanel';
import { SceneSelector } from './components/ui/SceneSelector';
import { DevicePanel } from './components/ui/DevicePanel';
import { SimulationPanel } from './components/ui/SimulationPanel';
import { SimulationResultModal } from './components/ui/SimulationResultModal';
import { useManualControl, ManualDirection } from './hooks/useManualControl';
import { SceneId } from './config/scenes';
import type { MapType } from './types/device';

export function App() {
  const [auto, setAuto] = useState(false);
  const [uavAnimation, setUavAnimation] = useState(false);
  const [uavPosition, setUavPosition] = useState<[number, number, number]>([0, 40, 0]);
  const [sceneId, setSceneId] = useState<SceneId>('ntpu');

  // Simulation result modal state
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [modalMapType, setModalMapType] = useState<MapType>('iss');

  const { manualDirection, handleManualControl, resetManualControl } = useManualControl();

  const handleManualMoveDone = useCallback(() => {
    resetManualControl();
  }, [resetManualControl]);

  const handlePositionUpdate = useCallback((pos: [number, number, number]) => {
    setUavPosition(pos);
  }, []);

  const handleToggleAuto = useCallback(() => {
    setAuto((prev) => !prev);
    resetManualControl();
  }, [resetManualControl]);

  const handleSimResult = useCallback((url: string, mapType: MapType) => {
    setModalImageUrl(url);
    setModalMapType(mapType);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (modalImageUrl) {
      URL.revokeObjectURL(modalImageUrl);
    }
    setModalImageUrl(null);
  }, [modalImageUrl]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Left sidebar: Device configuration */}
      <DevicePanel />

      <MainScene
        auto={auto}
        manualDirection={manualDirection}
        onManualMoveDone={handleManualMoveDone}
        uavAnimation={uavAnimation}
        onPositionUpdate={handlePositionUpdate}
        sceneId={sceneId}
      />

      {/* Top-left UI panel: SceneSelector + UAVControlPanel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '290px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '236px',
      }}>
        <SceneSelector currentScene={sceneId} onSceneChange={setSceneId} />
        <UAVControlPanel
          auto={auto}
          uavAnimation={uavAnimation}
          uavPosition={uavPosition}
          onToggleAuto={handleToggleAuto}
          onToggleAnimation={() => setUavAnimation((prev) => !prev)}
          onManualControl={handleManualControl}
        />
      </div>

      {/* Top-right: Simulation map generation */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 100,
      }}>
        <SimulationPanel sceneId={sceneId} onResult={handleSimResult} />
      </div>

      {/* Result modal */}
      {modalImageUrl && (
        <SimulationResultModal
          imageUrl={modalImageUrl}
          mapType={modalMapType}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
