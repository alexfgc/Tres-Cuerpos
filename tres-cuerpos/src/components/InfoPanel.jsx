import { BlockMath, InlineMath } from 'react-katex'

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

      <section className="mt-6 rounded-xl border border-white/15 bg-black/25 p-4 md:p-5">
        <h3 className="font-display text-base font-semibold text-white">Fisica y Matematica del CR3BP</h3>

        <p className="mt-3 text-sm leading-relaxed text-white/75">
          Esta simulacion usa el Problema Restringido Circular de los Tres Cuerpos en unidades adimensionales.
          Las masas primarias giran en orbita circular y el tercer cuerpo se considera sin masa, por lo que no
          altera el movimiento de los primarios.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-white/75">
          En el marco rotante, con parametro de masa <InlineMath math="\mu \in (0,\,1)" />, los primarios se
          ubican en <InlineMath math="(-\mu,\,0,\,0)" /> y <InlineMath math="(1-\mu,\,0,\,0)" />. Las
          distancias al satelite son:
        </p>
        <div className="mt-2 overflow-x-auto text-sm text-white/90">
          <BlockMath math="r_1 = \sqrt{(x+\mu)^2 + y^2 + z^2},\quad r_2 = \sqrt{(x-1+\mu)^2 + y^2 + z^2}" />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-white/75">La pseudo-potencial efectiva se define como:</p>
        <div className="mt-2 overflow-x-auto text-sm text-white/90">
          <BlockMath math="\Omega(x,y,z)=\frac{1-\mu}{r_1}+\frac{\mu}{r_2}+\frac{1}{2}(x^2+y^2)" />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-white/75">
          Las ecuaciones de movimiento en el marco rotante (incluyendo terminos de Coriolis) son:
        </p>
        <div className="mt-2 overflow-x-auto text-sm text-white/90">
          <BlockMath math="\ddot{x} - 2\dot{y} = \frac{\partial \Omega}{\partial x},\qquad \ddot{y} + 2\dot{x} = \frac{\partial \Omega}{\partial y},\qquad \ddot{z} = \frac{\partial \Omega}{\partial z}" />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-white/75">
          La constante de Jacobi, usada aqui para verificar estabilidad numerica, es:
        </p>
        <div className="mt-2 overflow-x-auto text-sm text-white/90">
          <BlockMath math="C = 2\Omega(x,y,z) - (\dot{x}^2 + \dot{y}^2 + \dot{z}^2)" />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-white/75">
          Si el integrador conserva bien la dinamica, el valor de <InlineMath math="C" /> se mantiene casi
          constante. Por eso el panel muestra el error relativo de Jacobi durante la integracion RK4.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-white/75">
          Las regiones permitidas por energia (curvas/superficies de Hill) se obtienen al imponer velocidad nula:
        </p>
        <div className="mt-2 overflow-x-auto text-sm text-white/90">
          <BlockMath math="\dot{x}=\dot{y}=\dot{z}=0\ \Rightarrow\ 2\Omega(x,y,z)=C" />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-white/75">
          Los puntos de Lagrange satisfacen equilibrio en el marco rotante:
        </p>
        <div className="mt-2 overflow-x-auto text-sm text-white/90">
          <BlockMath math="\nabla\Omega(x,y,z)=0" />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-white/75">
          En esta app se visualizan <InlineMath math="L_1,\ldots,L_5" /> para estudiar zonas de transferencia,
          equilibrio y sensibilidad dinamica alrededor de orbitas casi periodicas.
        </p>
      </section>
    </section>
  )
}

export default InfoPanel
