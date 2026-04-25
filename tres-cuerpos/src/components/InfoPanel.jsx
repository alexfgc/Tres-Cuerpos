function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-white/15 bg-black/20 p-3">
      <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
      <p className="mt-1 font-mono text-sm text-white">{value}</p>
    </div>
  )
}

function jacobiStatus(errorPct) {
  if (errorPct < 0.1) {
    return { label: 'Estable', className: 'text-success' }
  }
  if (errorPct < 1) {
    return { label: 'Atencion', className: 'text-highlight' }
  }
  return { label: 'Inestable', className: 'text-danger' }
}

function InfoPanel({ energy, initialJacobi, jacobi, r1, r2, state, time }) {
  const jacobiError = Math.abs(initialJacobi - jacobi)
  const jacobiErrorPct = initialJacobi === 0 ? 0 : (jacobiError / Math.abs(initialJacobi)) * 100
  const status = jacobiStatus(jacobiErrorPct)

  return (
    <section className="rounded-xl border border-white/20 bg-white/5 p-4">
      <h2 className="font-display text-lg font-semibold">Estado de Simulacion</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/75">
        Integracion RK4 en marcha con trayectoria del satelite en el marco rotante del CR3BP.
      </p>
      <p className="mt-2 text-sm text-white/70">
        Conservacion de Jacobi:{' '}
        <span className={`font-semibold ${status.className}`}>{status.label}</span>
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Metric label="Tiempo" value={time.toFixed(3)} />
        <Metric label="Jacobi C" value={jacobi.toFixed(6)} />
        <Metric label="Error C (%)" value={jacobiErrorPct.toFixed(4)} />
        <Metric label="Energia efectiva" value={energy.toFixed(6)} />
        <Metric label="r1" value={r1.toFixed(6)} />
        <Metric label="r2" value={r2.toFixed(6)} />
        <Metric
          label="Posicion"
          value={`(${state.x.toFixed(3)}, ${state.y.toFixed(3)}, ${state.z.toFixed(3)})`}
        />
      </div>
    </section>
  )
}

export default InfoPanel
