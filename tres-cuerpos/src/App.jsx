import { Suspense, lazy, useCallback, useMemo, useState } from 'react'
import ControlPanel from './components/ControlPanel'
import InfoPanel from './components/InfoPanel'
import { calculateJacobi, calculateEffectivePotential } from './physics/cr3bp'
import { BINARY_SYSTEMS, DEFAULT_DT, DEFAULT_SYSTEM_KEY } from './utils/constants'
import { getPresetState, PRESETS } from './utils/presets'

const Scene3D = lazy(() => import('./components/Scene3D'))

function App() {
  const [systemKey, setSystemKey] = useState(DEFAULT_SYSTEM_KEY)
  const mu = BINARY_SYSTEMS[systemKey].mu

  const [initialState, setInitialState] = useState(
    getPresetState(PRESETS.JWST_L2, BINARY_SYSTEMS[DEFAULT_SYSTEM_KEY].mu),
  )
  const [isRunning, setIsRunning] = useState(false)
  const [activePreset, setActivePreset] = useState(PRESETS.JWST_L2)
  const [dt, setDt] = useState(DEFAULT_DT)
  const [simulationSpeed, setSimulationSpeed] = useState(10)
  const [showLagrange, setShowLagrange] = useState(true)
  const [showTrajectory, setShowTrajectory] = useState(true)
  const [showHillCurves, setShowHillCurves] = useState(false)
  const [trajectoryLimit, setTrajectoryLimit] = useState(5000)
  const [resetConfig, setResetConfig] = useState({ id: 0, smooth: false })
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

  return (
    <main className="min-h-screen bg-space-black text-primary">
      <header className="border-b border-white/20 px-6 py-4 md:px-8">
        <h1 className="font-display text-2xl font-semibold tracking-wide md:text-3xl">
          Problema de los Tres Cuerpos
        </h1>
        <p className="mt-1 text-sm text-white/70 md:text-base">
          Simulador 3D del CR3BP y puntos de Lagrange
        </p>
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
          onSystemChange={handleSystemChange}
          presets={PRESETS}
          selectedPreset={activePreset}
          selectedSystemKey={systemKey}
          showHillCurves={showHillCurves}
          showLagrange={showLagrange}
          simulationSpeed={simulationSpeed}
          showTrajectory={showTrajectory}
        />
        <Suspense
          fallback={
            <div className="flex h-[60vh] min-h-[420px] items-center justify-center rounded-xl border border-white/20 bg-black/30 md:h-[72vh]">
              <p className="text-sm text-white/70">Inicializando escena 3D...</p>
            </div>
          }
        >
          <Scene3D
            dt={dt}
            initialState={initialState}
            isRunning={isRunning}
            mu={mu}
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
        </Suspense>
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
