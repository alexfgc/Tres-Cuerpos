import { calculateJacobi, cr3bpDerivatives } from '../src/physics/cr3bp.js'
import { calculateAllLagrangePoints } from '../src/physics/lagrangePoints.js'
import { rk4Step } from '../src/physics/rk4.js'
import { BINARY_SYSTEMS, DEFAULT_STATE } from '../src/utils/constants.js'
import { getPresetState, PRESETS } from '../src/utils/presets.js'

function assertCondition(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function distance2D(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function validateLagrangeOrdering(mu) {
  const points = calculateAllLagrangePoints(mu)
  const m1x = -mu
  const m2x = 1 - mu

  assertCondition(points.L1.x > m1x && points.L1.x < m2x, 'L1 no esta entre M1 y M2')
  assertCondition(points.L2.x > m2x, 'L2 no esta mas alla de M2')
  assertCondition(points.L3.x < m1x, 'L3 no esta al lado opuesto de M1')

  const dM1M2 = Math.abs(m2x - m1x)
  const dM1L4 = distance2D(points.L4, { x: m1x, y: 0 })
  const dM2L4 = distance2D(points.L4, { x: m2x, y: 0 })

  assertCondition(Math.abs(dM1L4 - dM1M2) < 1e-6, 'L4 no forma triangulo equilatero con M1-M2')
  assertCondition(Math.abs(dM2L4 - dM1M2) < 1e-6, 'L4 no forma triangulo equilatero con M2-M1')
}

function validateJacobiConservation(mu) {
  const steps = 6000
  const dt = 0.001

  let t = 0
  let state = { ...DEFAULT_STATE }
  const c0 = calculateJacobi(state, mu)
  let maxAbsError = 0

  for (let i = 0; i < steps; i += 1) {
    state = rk4Step((time, s) => cr3bpDerivatives(time, s, mu), t, state, dt)
    t += dt
    const ci = calculateJacobi(state, mu)
    maxAbsError = Math.max(maxAbsError, Math.abs(ci - c0))
  }

  const relPercent = (maxAbsError / Math.max(Math.abs(c0), 1e-12)) * 100
  assertCondition(relPercent < 0.1, `Error relativo de Jacobi demasiado alto: ${relPercent.toFixed(6)}%`)

  return {
    c0,
    maxAbsError,
    relPercent,
    simulatedTime: t,
    steps,
    dt,
  }
}

function validatePresetOrbit(mu, presetKey, options) {
  const {
    label,
    threshold,
    metric,
    sampleTime = 20,
    dt = 0.001,
  } = options

  let state = { ...getPresetState(presetKey, mu) }
  let t = 0
  const steps = Math.round(sampleTime / dt)
  let maxMetric = 0

  for (let i = 0; i < steps; i += 1) {
    state = rk4Step((time, s) => cr3bpDerivatives(time, s, mu), t, state, dt)
    t += dt
    maxMetric = Math.max(maxMetric, metric(state))
  }

  assertCondition(
    maxMetric <= threshold,
    `${label} excede el umbral esperado: ${maxMetric.toFixed(6)} > ${threshold.toFixed(6)}`,
  )

  return { label, maxMetric, threshold, sampleTime, dt }
}

function runValidation() {
  const mu = BINARY_SYSTEMS.SUN_EARTH.mu

  validateLagrangeOrdering(mu)
  const jacobi = validateJacobiConservation(mu)
  const jwst = validatePresetOrbit(mu, PRESETS.JWST_L2, {
    label: 'JWST L2',
    threshold: 2,
    metric: (state) => Math.hypot(state.x, state.y, state.z),
  })
  const trojan = validatePresetOrbit(mu, PRESETS.TROJAN_L4, {
    label: 'Troyano L4',
    threshold: 0.25,
    metric: (state) => {
      const l4x = 0.5 - mu
      const l4y = Math.sqrt(3) / 2
      return Math.hypot(state.x - l4x, state.y - l4y)
    },
  })

  console.log('Validacion de fisica completada correctamente.')
  console.log(`mu: ${mu}`)
  console.log(`Jacobi inicial: ${jacobi.c0.toFixed(10)}`)
  console.log(`Error abs max: ${jacobi.maxAbsError.toExponential(3)}`)
  console.log(`Error rel max: ${jacobi.relPercent.toFixed(6)}%`) 
  console.log(`Integracion: ${jacobi.steps} pasos, dt=${jacobi.dt}, tiempo=${jacobi.simulatedTime.toFixed(3)}`)
  console.log(`${jwst.label}: excursion maxima ${jwst.maxMetric.toFixed(6)} en ${jwst.sampleTime.toFixed(1)} unidades`)
  console.log(`${trojan.label}: distancia maxima a L4 ${trojan.maxMetric.toFixed(6)} en ${trojan.sampleTime.toFixed(1)} unidades`)
}

try {
  runValidation()
} catch (error) {
  console.error('Validacion fisica fallida:')
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
