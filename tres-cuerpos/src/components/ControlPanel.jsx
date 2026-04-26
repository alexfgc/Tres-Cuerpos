import { Pause, Play, RotateCcw } from 'lucide-react'
import PresetSelector from './PresetSelector'

function Slider({
  disabled,
  formatValue = (value) => {
    const normalized = Math.abs(value) < 1e-9 ? 0 : value
    return normalized.toFixed(3)
  },
  helpText,
  label,
  max,
  min,
  onChange,
  step,
  value,
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-white/70">
        <span title={helpText}>{label}</span>
        <span className="font-mono text-white/90">{formatValue(value)}</span>
      </div>
      <input
        className="w-full accent-accent disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        max={max}
        min={min}
        onChange={(event) => {
          const nextValue = Number(event.target.value)
          const zeroInRange = min <= 0 && max >= 0
          const snapThreshold = Math.max(step / 2, 1e-9)
          const normalized = zeroInRange && Math.abs(nextValue) <= snapThreshold
            ? 0
            : nextValue
          onChange(normalized)
        }}
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
  onSystemChange,
  onChangeDt,
  onChangeSimulationSpeed,
  onChangeInitialState,
  onChangeShowLagrange,
  onChangeShowHillCurves,
  onChangeShowTrajectory,
  onChangeTrajectoryLimit,
  onLoadPreset,
  onReset,
  onCopyShareLink,
  onPlayPause,
  presets,
  selectedPreset,
  selectedSystemKey,
  showHillCurves,
  showLagrange,
  trajectoryLimit,
  simulationSpeed,
  showTrajectory,
  shareStatus,
}) {
  const buttonLabel = isRunning ? 'Pausar' : 'Play'

  return (
    <aside className="max-h-[72vh] overflow-y-auto rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
      <h2 className="font-display text-lg font-semibold">Controles</h2>
      <p className="mt-1 text-sm text-white/70">Control inicial de condiciones para integrar la orbita.</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className="flex items-center justify-center gap-2 rounded-lg border border-accent/60 bg-accent/15 px-3 py-2 text-sm font-medium transition hover:bg-accent/25"
          title={isRunning ? 'Pausa la simulacion y conserva el estado actual.' : 'Inicia la integracion RK4.'}
          onClick={onPlayPause}
          type="button"
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {buttonLabel}
        </button>
        <button
          className="flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/5 px-3 py-2 text-sm font-medium transition hover:bg-white/10"
          title="Vuelve al estado inicial del preset o de los sliders manuales."
          onClick={onReset}
          type="button"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      <button
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/5 px-3 py-2 text-sm font-medium transition hover:bg-white/10"
        title="Copia un enlace reproducible con la configuracion actual de la simulacion."
        onClick={onCopyShareLink}
        type="button"
      >
        Compartir config
      </button>
      {shareStatus ? <p className="mt-2 text-xs text-white/60">{shareStatus}</p> : null}
      <div className="mt-5 space-y-2 text-sm text-white/80">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-white/70">Sistema binario</span>
          <select
            className="w-full rounded-lg border border-white/30 bg-black/50 px-3 py-2 text-sm text-white"
            title="Cambia la masa reducida y recoloca los cuerpos primarios en la escena."
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
          helpText="Coordenada X inicial del tercer cuerpo en el marco rotante."
          label="Posicion X"
          max={2}
          min={-2}
          onChange={(value) => onChangeInitialState('x', value)}
          step={0.01}
          value={initialState.x}
        />
        <Slider
          disabled={!canEditInitialState}
          helpText="Coordenada Y inicial del tercer cuerpo en el marco rotante."
          label="Posicion Y"
          max={2}
          min={-2}
          onChange={(value) => onChangeInitialState('y', value)}
          step={0.01}
          value={initialState.y}
        />
        <Slider
          disabled={!canEditInitialState}
          helpText="Coordenada Z inicial del tercer cuerpo."
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
          helpText="Velocidad inicial en X del tercer cuerpo."
          label="Velocidad VX"
          max={2}
          min={-2}
          onChange={(value) => onChangeInitialState('vx', value)}
          step={0.01}
          value={initialState.vx}
        />
        <Slider
          disabled={!canEditInitialState}
          helpText="Velocidad inicial en Y del tercer cuerpo."
          label="Velocidad VY"
          max={2}
          min={-2}
          onChange={(value) => onChangeInitialState('vy', value)}
          step={0.01}
          value={initialState.vy}
        />
        <Slider
          disabled={!canEditInitialState}
          helpText="Velocidad inicial en Z del tercer cuerpo."
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
          helpText="Paso base del integrador RK4. Valores pequenos mejoran estabilidad pero cuestan mas CPU."
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
          helpText="Multiplicador visual del avance por frame; no cambia el parametro fisico dt."
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
            title="Muestra u oculta los cinco puntos de Lagrange."
            onChange={(event) => onChangeShowLagrange(event.target.checked)}
            type="checkbox"
          />
          Mostrar puntos de Lagrange
        </label>
        <label className="flex items-center gap-2">
          <input
            checked={showTrajectory}
            className="accent-accent"
            title="Muestra u oculta la trayectoria acumulada."
            onChange={(event) => onChangeShowTrajectory(event.target.checked)}
            type="checkbox"
          />
          Mostrar trayectoria
        </label>
        <label className="flex items-center gap-2">
          <input
            checked={showHillCurves}
            className="accent-accent"
            title="Muestra una aproximacion visual de las curvas de Hill."
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
          helpText="Cantidad maxima de puntos conservados en la trayectoria."
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
