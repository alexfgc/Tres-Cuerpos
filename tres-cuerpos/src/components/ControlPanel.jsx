import { Pause, Play, RotateCcw } from 'lucide-react'
import PresetSelector from './PresetSelector'

function Slider({ disabled, formatValue = (value) => value.toFixed(3), label, max, min, onChange, step, value }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-white/70">
        <span>{label}</span>
        <span className="font-mono text-white/90">{formatValue(value)}</span>
      </div>
      <input
        className="w-full accent-accent disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
    </label>
  )
}

function ControlPanel({
  binarySystems,
  canEditInitialState,
  dt,
  initialState,
  isRunning,
  mu,
  onChangeDt,
  onChangeSimulationSpeed,
  onChangeInitialState,
  onChangeShowLagrange,
  onChangeShowHillCurves,
  onChangeShowTrajectory,
  onChangeTrajectoryLimit,
  onLoadPreset,
  onPlayPause,
  onReset,
  onSystemChange,
  presets,
  selectedPreset,
  selectedSystemKey,
  showHillCurves,
  showLagrange,
  trajectoryLimit,
  simulationSpeed,
  showTrajectory,
}) {
  const buttonLabel = isRunning ? 'Pausar' : 'Play'

  return (
    <aside className="max-h-[72vh] overflow-y-auto rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
      <h2 className="font-display text-lg font-semibold">Controles</h2>
      <p className="mt-1 text-sm text-white/70">Control inicial de condiciones para integrar la orbita.</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className="flex items-center justify-center gap-2 rounded-lg border border-accent/60 bg-accent/15 px-3 py-2 text-sm font-medium transition hover:bg-accent/25"
          onClick={onPlayPause}
          type="button"
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {buttonLabel}
        </button>
        <button
          className="flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/5 px-3 py-2 text-sm font-medium transition hover:bg-white/10"
          onClick={onReset}
          type="button"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      <div className="mt-5 space-y-2 text-sm text-white/80">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-white/70">Sistema binario</span>
          <select
            className="w-full rounded-lg border border-white/30 bg-black/50 px-3 py-2 text-sm text-white"
            onChange={(event) => onSystemChange(event.target.value)}
            value={selectedSystemKey}
          >
            {Object.entries(binarySystems).map(([key, system]) => (
              <option key={key} value={key}>
                {system.label}
              </option>
            ))}
          </select>
        </label>
        <p>mu = {mu.toExponential(4)}</p>
        <p>Edicion {canEditInitialState ? 'habilitada' : 'bloqueada durante simulacion'}</p>
      </div>

      <PresetSelector
        onLoadPreset={onLoadPreset}
        presets={presets}
        selectedPreset={selectedPreset}
      />

      <div className="mt-5 space-y-3">
        <Slider
          disabled={!canEditInitialState}
          label="Posicion X"
          max={2}
          min={-2}
          onChange={(value) => onChangeInitialState('x', value)}
          step={0.01}
          value={initialState.x}
        />
        <Slider
          disabled={!canEditInitialState}
          label="Posicion Y"
          max={2}
          min={-2}
          onChange={(value) => onChangeInitialState('y', value)}
          step={0.01}
          value={initialState.y}
        />
        <Slider
          disabled={!canEditInitialState}
          label="Posicion Z"
          max={2}
          min={-2}
          onChange={(value) => onChangeInitialState('z', value)}
          step={0.01}
          value={initialState.z}
        />
      </div>

      <div className="mt-5 space-y-3">
        <Slider
          disabled={!canEditInitialState}
          label="Velocidad VX"
          max={2}
          min={-2}
          onChange={(value) => onChangeInitialState('vx', value)}
          step={0.01}
          value={initialState.vx}
        />
        <Slider
          disabled={!canEditInitialState}
          label="Velocidad VY"
          max={2}
          min={-2}
          onChange={(value) => onChangeInitialState('vy', value)}
          step={0.01}
          value={initialState.vy}
        />
        <Slider
          disabled={!canEditInitialState}
          label="Velocidad VZ"
          max={2}
          min={-2}
          onChange={(value) => onChangeInitialState('vz', value)}
          step={0.01}
          value={initialState.vz}
        />
      </div>

      <div className="mt-5">
        <Slider
          disabled={false}
          label="Timestep"
          max={0.1}
          min={0.001}
          onChange={onChangeDt}
          step={0.001}
          value={dt}
        />
      </div>

      <div className="mt-5">
        <Slider
          disabled={false}
          label="Velocidad animacion"
          max={100}
          min={1}
          onChange={onChangeSimulationSpeed}
          step={1}
          value={simulationSpeed}
        />
      </div>

      <div className="mt-5 space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            checked={showLagrange}
            className="accent-accent"
            onChange={(event) => onChangeShowLagrange(event.target.checked)}
            type="checkbox"
          />
          Mostrar puntos de Lagrange
        </label>
        <label className="flex items-center gap-2">
          <input
            checked={showTrajectory}
            className="accent-accent"
            onChange={(event) => onChangeShowTrajectory(event.target.checked)}
            type="checkbox"
          />
          Mostrar trayectoria
        </label>
        <label className="flex items-center gap-2">
          <input
            checked={showHillCurves}
            className="accent-accent"
            onChange={(event) => onChangeShowHillCurves(event.target.checked)}
            type="checkbox"
          />
          Mostrar curvas de Hill
        </label>
      </div>

      <div className="mt-5">
        <Slider
          disabled={false}
          formatValue={(value) => String(Math.round(value))}
          label="Limite muestras"
          max={20000}
          min={500}
          onChange={onChangeTrajectoryLimit}
          step={100}
          value={trajectoryLimit}
        />
      </div>
    </aside>
  )
}

export default ControlPanel
