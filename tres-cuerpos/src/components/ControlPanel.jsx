import { Play, RotateCcw } from 'lucide-react'

function ControlPanel() {
  return (
    <aside className="rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
      <h2 className="font-display text-lg font-semibold">Controles</h2>
      <p className="mt-1 text-sm text-white/70">
        Base inicial preparada. En la siguiente fase conectamos los sliders al integrador RK4.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className="flex items-center justify-center gap-2 rounded-lg border border-accent/60 bg-accent/15 px-3 py-2 text-sm font-medium transition hover:bg-accent/25"
          type="button"
        >
          <Play size={16} />
          Play
        </button>
        <button
          className="flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/5 px-3 py-2 text-sm font-medium transition hover:bg-white/10"
          type="button"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      <div className="mt-5 space-y-3 text-sm text-white/80">
        <p>Sistema: Sol-Tierra</p>
        <p>mu = 3.04e-6</p>
        <p>Timestep inicial: 0.01</p>
      </div>
    </aside>
  )
}

export default ControlPanel
