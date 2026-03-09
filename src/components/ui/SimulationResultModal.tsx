import React, { useEffect } from 'react';
import type { MapType } from '../../types/device';
import { MAP_TYPE_LABELS } from '../../types/device';

interface SimulationResultModalProps {
  imageUrl: string;
  mapType: MapType;
  onClose: () => void;
}

export function SimulationResultModal({
  imageUrl,
  mapType,
  onClose,
}: SimulationResultModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="sim-modal__overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sim-modal__content">
        <div className="sim-modal__header">
          <span className="sim-modal__title">{MAP_TYPE_LABELS[mapType]}</span>
          <button className="sim-modal__close" onClick={onClose} aria-label="關閉">
            ✕
          </button>
        </div>
        <div className="sim-modal__body">
          <img
            src={imageUrl}
            alt={MAP_TYPE_LABELS[mapType]}
            className="sim-modal__image"
          />
        </div>
        <div className="sim-modal__footer">
          <a
            href={imageUrl}
            download={`${mapType}_map.png`}
            className="sim-modal__download"
          >
            ⬇ 下載圖片
          </a>
          <button className="sim-modal__btn-close" onClick={onClose}>
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
