import { useState, useRef, useEffect } from 'react';
import { SCENES, SceneId } from '../../config/scenes';

interface SceneSelectorProps {
  currentScene: SceneId;
  onSceneChange: (id: SceneId) => void;
}

export function SceneSelector({ currentScene, onSceneChange }: SceneSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 點擊容器外部時關閉
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const current = SCENES.find((s) => s.id === currentScene) ?? SCENES[0];

  return (
    <div ref={containerRef} style={{ position: 'relative', userSelect: 'none' }}>
      {/* 觸發按鈕 */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 12px',
          background: 'rgba(8, 16, 32, 0.82)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${open ? 'rgba(80,160,255,0.6)' : 'rgba(80,160,255,0.25)'}`,
          borderRadius: '10px',
          color: '#c8dff8',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          fontSize: '12px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,60,180,0.25)',
          transition: 'border-color 0.18s',
          whiteSpace: 'nowrap',
          width: '100%',
        }}
      >
        {/* 場景圖示 */}
        <span style={{ fontSize: '14px', lineHeight: 1 }}>🌐</span>
        <span style={{ flex: 1, textAlign: 'left' }}>
          <span style={{ fontSize: '10px', color: '#4a7aaa', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block' }}>
            Scene
          </span>
          <span style={{ fontWeight: 600, color: '#6aafff' }}>{current.label}</span>
        </span>
        {/* 箭頭 */}
        <span style={{
          fontSize: '10px',
          color: '#4a7aaa',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.18s',
          marginLeft: '2px',
        }}>
          ▼
        </span>
      </button>

      {/* 下拉選單 */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'rgba(8, 16, 32, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(80, 160, 255, 0.25)',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,40,160,0.35)',
          zIndex: 200,
        }}>
          {SCENES.map((scene) => {
            const isActive = scene.id === currentScene;
            return (
              <button
                key={scene.id}
                onClick={() => { onSceneChange(scene.id); setOpen(false); }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '9px 12px',
                  background: isActive ? 'rgba(80,160,255,0.18)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(80,160,255,0.1)',
                  color: isActive ? '#6aafff' : '#9ac8f5',
                  fontFamily: "'Segoe UI', system-ui, sans-serif",
                  fontSize: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(80,160,255,0.09)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <span style={{ fontWeight: isActive ? 700 : 400 }}>{scene.label}</span>
                <span style={{ display: 'block', fontSize: '10px', color: '#4a7aaa', marginTop: '1px' }}>
                  {scene.description}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
