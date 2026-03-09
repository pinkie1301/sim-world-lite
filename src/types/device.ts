export type DeviceRole = 'tx' | 'rx' | 'jammer';

export interface Device {
  id: string;
  name: string;
  role: DeviceRole;
  /** Three.js X (east) */
  x: number;
  /** Three.js Y (height) */
  y: number;
  /** Three.js Z (south) */
  z: number;
  /** Transmit power in dBm — only relevant for tx/jammer */
  powerDbm?: number;
}

export type MapType = 'iss' | 'tss' | 'cfar';

export const MAP_TYPE_LABELS: Record<MapType, string> = {
  iss: 'ISS Map',
  tss: 'TSS Map',
  cfar: 'ISS+CFAR Map',
};
