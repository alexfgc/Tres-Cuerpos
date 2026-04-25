import { calculateAllLagrangePoints } from '../physics/lagrangePoints.js'

export const PRESETS = {
  JWST_L2: 'JWST_L2',
  TROJAN_L4: 'TROJAN_L4',
  UNSTABLE_L1: 'UNSTABLE_L1',
  CUSTOM: 'CUSTOM',
}

export function getPresetState(presetKey, mu) {
  if (presetKey === PRESETS.JWST_L2) {
    return { x: 1.01, y: 0, z: 0.01, vx: 0, vy: 0.1, vz: 0 }
  }

  if (presetKey === PRESETS.TROJAN_L4) {
    const l4 = calculateAllLagrangePoints(mu).L4
    return {
      x: l4.x + 0.02,
      y: l4.y - 0.01,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
    }
  }

  if (presetKey === PRESETS.UNSTABLE_L1) {
    const l1 = calculateAllLagrangePoints(mu).L1
    return {
      x: l1.x + 0.002,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
    }
  }

  return { x: 1.01, y: 0, z: 0.01, vx: 0, vy: 0.1, vz: 0 }
}
