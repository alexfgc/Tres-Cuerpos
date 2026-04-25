export const BINARY_SYSTEMS = {
  SUN_EARTH: {
    label: 'Sol-Tierra',
    mu: 3.04e-6,
  },
  EARTH_MOON: {
    label: 'Tierra-Luna',
    mu: 0.0121,
  },
  PLUTO_CHARON: {
    label: 'Pluton-Caronte',
    mu: 0.1089,
  },
}

export const DEFAULT_SYSTEM_KEY = 'SUN_EARTH'
export const DEFAULT_MU = BINARY_SYSTEMS.SUN_EARTH.mu
export const DEFAULT_DT = 0.01

export const DEFAULT_STATE = {
  x: 1.01,
  y: 0,
  z: 0.01,
  vx: 0,
  vy: 0.1,
  vz: 0,
}
