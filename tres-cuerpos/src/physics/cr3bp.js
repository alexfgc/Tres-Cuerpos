function safeDistance(value) {
  return Math.max(value, 1e-9)
}

function distances(state, mu) {
  const { x, y, z } = state
  const r1 = safeDistance(Math.sqrt((x + mu) ** 2 + y ** 2 + z ** 2))
  const r2 = safeDistance(Math.sqrt((x - 1 + mu) ** 2 + y ** 2 + z ** 2))
  return { r1, r2 }
}

export function cr3bpDerivatives(_t, state, mu) {
  const { x, y, z, vx, vy, vz } = state
  const { r1, r2 } = distances(state, mu)

  const ax = 2 * vy + x - ((1 - mu) * (x + mu)) / r1 ** 3 - (mu * (x - 1 + mu)) / r2 ** 3
  const ay = -2 * vx + y - ((1 - mu) * y) / r1 ** 3 - (mu * y) / r2 ** 3
  const az = -((1 - mu) * z) / r1 ** 3 - (mu * z) / r2 ** 3

  return { x: vx, y: vy, z: vz, vx: ax, vy: ay, vz: az }
}

export function calculateJacobi(state, mu) {
  const { x, y, vx, vy, vz } = state
  const { r1, r2 } = distances(state, mu)

  const omega = 0.5 * (x ** 2 + y ** 2) + (1 - mu) / r1 + mu / r2
  const speedSquared = vx ** 2 + vy ** 2 + vz ** 2

  return 2 * omega - speedSquared
}

export function calculateEffectivePotential(state, mu) {
  const { x, y } = state
  const { r1, r2 } = distances(state, mu)
  return 0.5 * (x ** 2 + y ** 2) + (1 - mu) / r1 + mu / r2
}
