import type { Device, MapType } from '../types/device';

export interface SimulateRequest {
  scene: string;
  map_type: MapType;
  devices: Array<{
    name: string;
    role: 'tx' | 'rx' | 'jammer';
    x: number;
    y: number;
    z: number;
    power_dbm?: number;
  }>;
}

/**
 * Call the Sionna backend to generate a map image.
 * Returns a Blob URL that can be used as an <img> src.
 * Throws on network or server error.
 */
export async function generateMap(
  scene: string,
  devices: Device[],
  mapType: MapType,
): Promise<string> {
  const body: SimulateRequest = {
    scene,
    map_type: mapType,
    devices: devices.map((d) => ({
      name: d.name,
      role: d.role,
      x: d.x,
      y: d.y,
      z: d.z,
      ...(d.powerDbm !== undefined ? { power_dbm: d.powerDbm } : {}),
    })),
  };

  const res = await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`後端錯誤 ${res.status}: ${text}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
