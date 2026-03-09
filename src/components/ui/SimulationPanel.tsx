import React, { useState } from 'react';
import { useDeviceStore } from '../../store/useDeviceStore';
import { generateMap } from '../../services/simulationApi';
import type { MapType } from '../../types/device';
import { MAP_TYPE_LABELS } from '../../types/device';

interface SimulationPanelProps {
  sceneId: string;
  onResult: (imageUrl: string, mapType: MapType) => void;
}

const MAP_OPTIONS: MapType[] = ['iss', 'tss', 'cfar'];

export function SimulationPanel({ sceneId, onResult }: SimulationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMap, setSelectedMap] = useState<MapType>('iss');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const devices = useDeviceStore((s) => s.devices);

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    try {
      const url = await generateMap(sceneId, devices, selectedMap);
      onResult(url, selectedMap);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sim-panel">
      {/* Trigger button */}
      <button
        className="sim-panel__trigger"
        onClick={() => setIsOpen((v) => !v)}
        disabled={loading}
      >
        {loading ? '計算中…' : '🗺 地圖生成'}
      </button>

      {/* Dropdown menu */}
      {isOpen && !loading && (
        <div className="sim-panel__dropdown">
          <div className="sim-panel__label">選擇地圖類型</div>
          <select
            className="sim-panel__select"
            value={selectedMap}
            onChange={(e) => setSelectedMap(e.target.value as MapType)}
          >
            {MAP_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {MAP_TYPE_LABELS[m]}
              </option>
            ))}
          </select>

          <button
            className="sim-panel__generate-btn"
            onClick={handleGenerate}
          >
            生成地圖
          </button>

          {error && <div className="sim-panel__error">{error}</div>}
        </div>
      )}

      {/* Loading overlay on button area */}
      {loading && (
        <div className="sim-panel__loading">
          <div className="sim-panel__spinner" />
          <span>Sionna 計算中，請稍候…</span>
        </div>
      )}
    </div>
  );
}
