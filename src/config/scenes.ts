export type SceneId = 'ntpu';
// 未來新增場景時在此 union 加上新 id，例如：'ntpu' | 'nycu' | 'poto'

export interface SceneDef {
  id: SceneId;
  label: string;
  description: string;
}

export const SCENES: SceneDef[] = [
  { id: 'ntpu', label: '臺北大學 NTPU', description: 'National Taipei University' },
];

export function getScene(id: SceneId): SceneDef {
  return SCENES.find((s) => s.id === id) ?? SCENES[0];
}
