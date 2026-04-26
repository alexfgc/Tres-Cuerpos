import { useCallback, useMemo, useState } from 'react'
import ControlPanel from './components/ControlPanel'
import InfoPanel from './components/InfoPanel'
import Scene3D from './components/Scene3D'
import { calculateJacobi, calculateEffectivePotential } from './physics/cr3bp'
import {
  BINARY_SYSTEMS,
  DEFAULT_DT,
  DEFAULT_SIMULATION_SPEED,
  DEFAULT_SYSTEM_KEY,
  DEFAULT_TRAJECTORY_LIMIT,
} from './utils/constants'
import { getPresetState, PRESETS } from './utils/presets'

function parseNumber(value, fallback) {
  if (value == null) return fallback
  if (typeof value === 'string' && value.trim() === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function isPresetKey(value) {
  return Object.values(PRESETS).includes(value)
}

function getInitialConfigFromUrl() {
  if (typeof window === 'undefined') {
    return {
      activePreset: PRESETS.JWST_L2,
      dt: DEFAULT_DT,
      initialState: getPresetState(PRESETS.JWST_L2, BINARY_SYSTEMS[DEFAULT_SYSTEM_KEY].mu),
      selectedSystemKey: DEFAULT_SYSTEM_KEY,
      showHillCurves: false,
      showLagrange: true,
      showTrajectory: true,
      simulationSpeed: DEFAULT_SIMULATION_SPEED,
      trajectoryLimit: DEFAULT_TRAJECTORY_LIMIT,
    }
  }

  const params = new URLSearchParams(window.location.search)
  const selectedSystemKey = BINARY_SYSTEMS[params.get('system')] ? params.get('system') : DEFAULT_SYSTEM_KEY
  const mu = BINARY_SYSTEMS[selectedSystemKey].mu
  const presetValue = params.get('preset')
  const activePreset = isPresetKey(presetValue) ? presetValue : PRESETS.JWST_L2

  const initialState = activePreset === PRESETS.CUSTOM
    ? {
        x: parseNumber(params.get('x'), 1.01),
        y: parseNumber(params.get('y'), 0),
        z: parseNumber(params.get('z'), 0.01),
        vx: parseNumber(params.get('vx'), 0),
        vy: parseNumber(params.get('vy'), 0.1),
        vz: parseNumber(params.get('vz'), 0),
      }
    : getPresetState(activePreset, mu)

  return {
    activePreset,
    dt: parseNumber(params.get('dt'), DEFAULT_DT),
    initialState,
    selectedSystemKey,
    showHillCurves: params.get('showHillCurves') === 'true',
    showLagrange: params.get('showLagrange') !== 'false',
    showTrajectory: params.get('showTrajectory') !== 'false',
    simulationSpeed: parseNumber(params.get('speed'), DEFAULT_SIMULATION_SPEED),
    trajectoryLimit: parseNumber(params.get('trajectoryLimit'), DEFAULT_TRAJECTORY_LIMIT),
  }
}

function App() {
  const [initialConfig] = useState(() => getInitialConfigFromUrl())
  const [systemKey, setSystemKey] = useState(initialConfig.selectedSystemKey)
  const mu = BINARY_SYSTEMS[systemKey].mu

  const [initialState, setInitialState] = useState(initialConfig.initialState)
  const [isRunning, setIsRunning] = useState(false)
  const [activePreset, setActivePreset] = useState(initialConfig.activePreset)
  const [dt, setDt] = useState(initialConfig.dt)
  const [simulationSpeed, setSimulationSpeed] = useState(initialConfig.simulationSpeed)
  const [showLagrange, setShowLagrange] = useState(initialConfig.showLagrange)
  const [showTrajectory, setShowTrajectory] = useState(initialConfig.showTrajectory)
  const [showHillCurves, setShowHillCurves] = useState(initialConfig.showHillCurves)
  const [trajectoryLimit, setTrajectoryLimit] = useState(initialConfig.trajectoryLimit)
  const [resetConfig, setResetConfig] = useState({ id: 0, smooth: false })
  const [shareStatus, setShareStatus] = useState('')
  const [telemetry, setTelemetry] = useState({
    time: 0,
    state: initialState,
    jacobi: calculateJacobi(initialState, mu),
    r1: 0,
    r2: 0,
  })
  const canEditInitialState = !isRunning

  const initialJacobi = useMemo(
    () => calculateJacobi(initialState, mu),
    [initialState, mu],
  )

  const currentEnergy = useMemo(
    () => 0.5 * (telemetry.state.vx ** 2 + telemetry.state.vy ** 2 + telemetry.state.vz ** 2) -
      calculateEffectivePotential(telemetry.state, mu),
    [telemetry.state, mu],
  )

  const handlePlayPause = () => {
    setIsRunning((running) => !running)
  }

  const handleReset = () => {
    const resetTelemetry = {
      time: 0,
      state: initialState,
      jacobi: calculateJacobi(initialState, mu),
      r1: 0,
      r2: 0,
    }

    setIsRunning(false)
    setResetConfig((current) => ({ id: current.id + 1, smooth: false }))
    setTelemetry(resetTelemetry)
  }

  const handleInitialStateChange = (key, value) => {
    if (!canEditInitialState) return
    setInitialState((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleSystemChange = (nextSystemKey) => {
    const nextMu = BINARY_SYSTEMS[nextSystemKey].mu
    const nextState = getPresetState(PRESETS.JWST_L2, nextMu)

    const resetTelemetry = {
      time: 0,
      state: nextState,
      jacobi: calculateJacobi(nextState, nextMu),
      r1: 0,
      r2: 0,
    }

    setIsRunning(false)
    setActivePreset(PRESETS.JWST_L2)
    setSystemKey(nextSystemKey)
    setInitialState(nextState)
    setResetConfig((current) => ({ id: current.id + 1, smooth: true }))
    setTelemetry(resetTelemetry)
  }

  const handlePresetLoad = (presetKey) => {
    if (presetKey === PRESETS.CUSTOM) {
      setIsRunning(false)
      setActivePreset(PRESETS.CUSTOM)
      return
    }

    const nextState = getPresetState(presetKey, mu)
    const resetTelemetry = {
      time: 0,
      state: nextState,
      jacobi: calculateJacobi(nextState, mu),
      r1: 0,
      r2: 0,
    }

    setIsRunning(false)
    setActivePreset(presetKey)
    setInitialState(nextState)
    setResetConfig((current) => ({ id: current.id + 1, smooth: true }))
    setTelemetry(resetTelemetry)
  }

  const handleTelemetry = useCallback((nextTelemetry) => {
    setTelemetry(nextTelemetry)
  }, [])

  const buildShareUrl = () => {
    const params = new URLSearchParams()
    params.set('system', systemKey)
    params.set('preset', activePreset)
    params.set('dt', String(dt))
    params.set('speed', String(simulationSpeed))
    params.set('trajectoryLimit', String(trajectoryLimit))
    params.set('showLagrange', String(showLagrange))
    params.set('showTrajectory', String(showTrajectory))
    params.set('showHillCurves', String(showHillCurves))
    params.set('x', String(initialState.x))
    params.set('y', String(initialState.y))
    params.set('z', String(initialState.z))
    params.set('vx', String(initialState.vx))
    params.set('vy', String(initialState.vy))
    params.set('vz', String(initialState.vz))
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`
  }

  const handleCopyShareLink = async () => {
    const shareUrl = buildShareUrl()
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareStatus('Enlace copiado')
    } catch {
      setShareStatus(shareUrl)
    }
  }

  return (
    <main className="min-h-screen bg-space-black text-primary">
      <header className="border-b border-white/20 px-6 py-4 md:px-8">
        <h1 className="font-display text-2xl font-semibold tracking-wide md:text-3xl">
          Problema de los Tres Cuerpos
        </h1>
        <p className="mt-1 text-sm text-white/70 md:text-base">
          Simulador 3D del CR3BP y puntos de Lagrange
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <section className="rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/90">
              Resumen tecnico
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              La pagina simula el Problema Restringido Circular de los Tres Cuerpos en el marco rotante,
              integrando la ecuacion de movimiento del tercer cuerpo con RK4. Se visualizan dos masas
              primarias en sistemas binarios seleccionables, la trayectoria del satelite, los cinco puntos de
              Lagrange, una aproximacion de las curvas de Hill y el estado numerico de la integracion,
              incluyendo constante de Jacobi, energia efectiva y distancias a cada primario.
            </p>
          </section>
          <section className="rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/90">
              Explicacion simple
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Aqui ves como se mueve un objeto pequeno entre dos cuerpos grandes que se atraen entre si,
              como una nave entre un planeta y su luna. La simulacion te deja cambiar la situacion inicial,
              ver hacia donde se va el objeto y descubrir algunos lugares especiales donde las fuerzas se
              compensan o donde la trayectoria se vuelve mas delicada e inestable.
            </p>
          </section>
        </div>
      </header>

      <section className="grid gap-4 p-4 md:grid-cols-[320px_minmax(0,1fr)] md:p-6">
        <ControlPanel
          binarySystems={BINARY_SYSTEMS}
          canEditInitialState={canEditInitialState}
          dt={dt}
          initialState={initialState}
          isRunning={isRunning}
          mu={mu}
          onChangeDt={setDt}
          onChangeSimulationSpeed={setSimulationSpeed}
          onChangeInitialState={handleInitialStateChange}
          onChangeShowLagrange={setShowLagrange}
          onChangeShowTrajectory={setShowTrajectory}
          onChangeShowHillCurves={setShowHillCurves}
          onChangeTrajectoryLimit={setTrajectoryLimit}
          trajectoryLimit={trajectoryLimit}
          onLoadPreset={handlePresetLoad}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onCopyShareLink={handleCopyShareLink}
          onSystemChange={handleSystemChange}
          presets={PRESETS}
          selectedPreset={activePreset}
          selectedSystemKey={systemKey}
          showHillCurves={showHillCurves}
          showLagrange={showLagrange}
          simulationSpeed={simulationSpeed}
          showTrajectory={showTrajectory}
          shareStatus={shareStatus}
        />
        <Scene3D
          dt={dt}
          initialState={initialState}
          isRunning={isRunning}
          mu={mu}
          systemKey={systemKey}
          onTelemetry={handleTelemetry}
          resetConfig={resetConfig}
          simulationSpeed={simulationSpeed}
          showLagrange={showLagrange}
          showTrajectory={showTrajectory}
          showHillCurves={showHillCurves}
          trajectoryLimit={trajectoryLimit}
          hillJacobi={initialJacobi}
          transitionDurationMs={500}
        />
      </section>

      <section className="px-4 pb-6 md:px-6">
        <InfoPanel
          initialJacobi={initialJacobi}
          jacobi={telemetry.jacobi}
          energy={currentEnergy}
          r1={telemetry.r1}
          r2={telemetry.r2}
          state={telemetry.state}
          time={telemetry.time}
        />
      </section>
    </main>
  )
}

export default App
