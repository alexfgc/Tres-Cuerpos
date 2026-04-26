import katex from 'katex'

function InlineLatex({ math }) {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: false,
  })

  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

function BlockLatex({ math }) {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: true,
  })

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

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

        <article className="mt-4 space-y-6 text-sm leading-relaxed text-white/75">
          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">Lo que ya sabes: el problema de dos cuerpos</h4>
            <p>
              Tienes dos masas <InlineLatex math={'M_1'} /> y <InlineLatex math={'M_2'} /> interactuando exclusivamente por gravedad.
              La fuerza gravitatoria sobre <InlineLatex math={'M_2'} /> debida a <InlineLatex math={'M_1'} /> es:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\vec{F}_{12} = -\\frac{G M_1 M_2}{r^2}\\,\\hat{r}'} />
            </div>
            <p>
              Este problema tiene <strong>solución exacta y analítica</strong>: las órbitas de Kepler (elipses, parábolas, hipérbolas).
              Es posible escribir <InlineLatex math={'r(t)'} /> y <InlineLatex math={'\\theta(t)'} /> con fórmulas cerradas.
              Existen tres integrales de movimiento conservadas: energía total, módulo del momento angular y el vector de Laplace-Runge-Lenz.
            </p>
            <p>
              La razón por la que funciona es que dos cuerpos siempre se pueden reducir a <strong>un único cuerpo de masa reducida</strong>
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\mu_\\text{red} = \\frac{M_1 M_2}{M_1 + M_2}'} />
            </div>
            <p>
              orbitando un centro fijo. El problema de 6 grados de libertad colapsa así a uno de solo 1.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">Añades un tercer cuerpo — y todo se rompe</h4>
            <p>Al introducir una tercera masa <InlineLatex math={'m'} />, la ecuación de movimiento es:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'m\\ddot{\\vec{r}} = -\\frac{GmM_1}{r_1^3}\\,\\vec{r}_1 - \\frac{GmM_2}{r_2^3}\\,\\vec{r}_2'} />
            </div>
            <p>
              donde <InlineLatex math={'\\vec{r}_1'} /> y <InlineLatex math={'\\vec{r}_2'} /> son los vectores desde cada masa principal hacia <InlineLatex math={'m'} />.
            </p>
            <p>
              El sistema completo tiene <strong>18 grados de libertad</strong> (posición y velocidad de las tres masas). Solo se conocen 10 integrales de movimiento: energía total, 3 componentes de momento lineal, 3 de momento angular y 3 del movimiento del centro de masas. Para resolverlo completamente necesitarías 18.
            </p>
            <p>
              <strong>Poincaré demostró en 1890 que no existe ninguna integral adicional de carácter analítico.</strong> El sistema es no integrable en general y las órbitas pueden ser caóticas: dos condiciones iniciales separadas <InlineLatex math={'10^{-10}'} /> unidades divergen exponencialmente con el tiempo.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">La simplificación clave: el CR3BP</h4>
            <p>
              El simulador no resuelve el problema general sino una versión específica denominada <strong>Problema Restringido Circular de los Tres Cuerpos</strong> (en inglés, <em>Circular Restricted Three-Body Problem</em>, CR3BP), que introduce tres suposiciones:
            </p>
            <ol className="space-y-2 pl-5">
              <li><strong>Masa despreciable:</strong> <InlineLatex math={'m \\ll M_1, M_2'} />. El satélite (JWST, asteroide, sonda...) no perturba a los cuerpos principales, que orbitan como si <InlineLatex math={'m'} /> no existiera.</li>
              <li><strong>Órbitas circulares:</strong> <InlineLatex math={'M_1'} /> y <InlineLatex math={'M_2'} /> orbitan su centro de masas en círculos perfectos con velocidad angular constante <InlineLatex math={'\\omega'} />.</li>
              <li><strong>Normalización de unidades:</strong> se elige el sistema de unidades tal que la distancia <InlineLatex math={'M_1'} />-<InlineLatex math={'M_2'} /> sea <InlineLatex math={'1'} />, <InlineLatex math={'\\omega = 1'} /> y <InlineLatex math={'G(M_1 + M_2) = 1'} />.</li>
            </ol>
            <p>
              Con estas hipótesis, todo el sistema queda parametrizado por un único número, el <strong>parámetro de masa reducida</strong>:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\mu = \\frac{M_2}{M_1 + M_2}'} />
            </div>
            <p>
              Las posiciones de los cuerpos principales en el <strong>sistema rotante</strong> son siempre:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'M_1 \\;\\text{en}\\; (-\\mu,\\; 0,\\; 0),\\qquad M_2 \\;\\text{en}\\; (1-\\mu,\\; 0,\\; 0)'} />
            </div>
            <p>Algunos valores representativos:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\begin{array}{lc}\\text{Sistema} & \\mu\\\\\\hline\\text{Sol--Tierra} & 3.04 \\times 10^{-6}\\\\\\text{Tierra--Luna} & 0.0121\\\\\\text{Plutón--Caronte} & 0.1089\\end{array}'} />
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">Por qué cambiamos al marco rotante</h4>
            <p>
              En el marco inercial de laboratorio, <InlineLatex math={'M_1'} /> y <InlineLatex math={'M_2'} /> se mueven.
              Es más conveniente trabajar en el marco <em>co-rotante</em> donde están fijos, girando con ellos a velocidad angular <InlineLatex math={'\\vec{\\omega} = \\omega\\hat{z}'} />.
            </p>
            <p>
              Sin embargo, al cambiar a un sistema de referencia no inercial aparecen <strong>fuerzas ficticias</strong>.
              Si <InlineLatex math={'\\ddot{\\vec{r}}_\\text{iner}'} /> es la aceleración en el marco inercial y <InlineLatex math={'\\ddot{\\vec{r}}_\\text{rot}'} /> la del marco rotante:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\ddot{\\vec{r}}_\\text{iner} = \\ddot{\\vec{r}}_\\text{rot} + 2\\,\\vec{\\omega}\\times\\dot{\\vec{r}}_\\text{rot} + \\vec{\\omega}\\times(\\vec{\\omega}\\times\\vec{r})'} />
            </div>
            <p>Pasando los términos extra al lado izquierdo, el observador rotante “ve”:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'m\\ddot{\\vec{r}}_\\text{rot} = \\vec{F}_\\text{grav} \\underbrace{-\\,2m\\,\\vec{\\omega}\\times\\dot{\\vec{r}}}_{\\text{Coriolis}} \\underbrace{-\\,m\\,\\vec{\\omega}\\times(\\vec{\\omega}\\times\\vec{r})}_{\\text{centrífuga}}'} />
            </div>
            <ul className="space-y-2 pl-5">
              <li><strong>Fuerza centrífuga:</strong> depende solo de la posición, apunta radialmente hacia afuera del eje de rotación. Equivale al término <InlineLatex math={'-m\\omega^2\\rho\\,\\hat{\\rho}'} /> con <InlineLatex math={'\\rho = \\sqrt{x^2+y^2}'} />.</li>
              <li><strong>Fuerza de Coriolis:</strong> proporcional a <InlineLatex math={'\\dot{\\vec{r}}'} /> en el marco rotante. <strong>No realiza trabajo</strong> (es perpendicular a la velocidad) pero curva las trayectorias. Es la responsable de que los huracanes giren.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">Las ecuaciones de movimiento del CR3BP</h4>
            <p>
              Expandiendo en componentes cartesianas con <InlineLatex math={'\\omega = 1'} />, y definiendo las distancias del satélite a cada masa principal:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'r_1 = \\sqrt{(x+\\mu)^2 + y^2 + z^2}\\qquad r_2 = \\sqrt{(x-1+\\mu)^2 + y^2 + z^2}'} />
            </div>
            <p>las ecuaciones de movimiento son:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\ddot{x} - 2\\dot{y} = x - \\frac{(1-\\mu)(x+\\mu)}{r_1^3} - \\frac{\\mu(x-1+\\mu)}{r_2^3}\\\\\\ddot{y} + 2\\dot{x} = y - \\frac{(1-\\mu)\\,y}{r_1^3} - \\frac{\\mu\\,y}{r_2^3}\\\\\\ddot{z} = -\\frac{(1-\\mu)\\,z}{r_1^3} - \\frac{\\mu\\,z}{r_2^3}'} />
            </div>
            <p>
              Los términos <InlineLatex math={'-2\\dot{y}'} /> y <InlineLatex math={'+2\\dot{x}'} /> son la <strong>aceleración de Coriolis</strong>. Los términos <InlineLatex math={'x'} /> e <InlineLatex math={'y'} /> en el lado derecho provienen de la fuerza centrífuga. El resto son los términos puramente gravitatorios.
            </p>
            <p>
              Para usar el paquete <InlineLatex math={'empheq'} /> añade al preámbulo: <InlineLatex math={'\\usepackage{empheq}'} />. Si no lo tienes disponible, sustituye por <InlineLatex math={'align'} /> estándar.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">El potencial efectivo U</h4>
            <p>
              El lado derecho de las ecuaciones anteriores puede escribirse como el gradiente de una función escalar.
              Se define el <strong>potencial efectivo</strong>:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'U(x,y,z)= -\\left[\\frac{1-\\mu}{r_1} + \\frac{\\mu}{r_2} + \\frac{1}{2}(x^2+y^2)\\right]'} />
            </div>
            <p>Los tres términos tienen interpretación física directa:</p>
            <ul className="space-y-2 pl-5">
              <li><InlineLatex math={'-(1-\\mu)/r_1'} />: potencial gravitatorio de <InlineLatex math={'M_1'} />.</li>
              <li><InlineLatex math={'-\\mu/r_2'} />: potencial gravitatorio de <InlineLatex math={'M_2'} />.</li>
              <li><InlineLatex math={'-\\frac{1}{2}(x^2+y^2)'} />: potencial centrífugo, equivalente a <InlineLatex math={'-\\frac{1}{2}\\omega^2\\rho^2'} />.</li>
            </ul>
            <p>Las ecuaciones de movimiento se reescriben compactamente:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\ddot{x} - 2\\dot{y} = \\frac{\\partial U}{\\partial x},\\qquad \\ddot{y} + 2\\dot{x} = \\frac{\\partial U}{\\partial y},\\qquad \\ddot{z} = \\frac{\\partial U}{\\partial z}'} />
            </div>
            <p>
              Los <strong>puntos críticos</strong> de <InlineLatex math={'U'} />, es decir los puntos donde <InlineLatex math={'\\nabla U = \\vec{0}'} />, son exactamente los <strong>puntos de Lagrange</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">Los Puntos de Lagrange como puntos críticos de U</h4>
            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">L4 y L5 — solución analítica exacta</h5>
            <p>
              En el plano <InlineLatex math={'z = 0'} />, la condición <InlineLatex math={'\\partial U / \\partial y = 0'} /> con <InlineLatex math={'y \\neq 0'} /> exige:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'y\\left(1 - \\frac{1-\\mu}{r_1^3} - \\frac{\\mu}{r_2^3}\\right) = 0'} />
            </div>
            <p>
              La solución no trivial requiere <InlineLatex math={'r_1 = r_2 = 1'} />: el satélite está exactamente a la misma distancia de ambas masas principales que ellas entre sí, formando <strong>triángulos equiláteros</strong>. Esto da:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'L_4:\left(\\frac{1}{2}-\\mu,\\; \\frac{\\sqrt{3}}{2},\\; 0\\right),\\qquad L_5:\left(\\frac{1}{2}-\\mu,\\; -\\frac{\\sqrt{3}}{2},\\; 0\\right)'} />
            </div>
            <p>Son los puntos donde orbitan los <em>asteroides Troyanos de Júpiter</em>, estables durante miles de millones de años.</p>

            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">L1, L2, L3 — Newton-Raphson</h5>
            <p>
              Sobre el eje <InlineLatex math={'x'} /> (<InlineLatex math={'y = z = 0'} />), la condición <InlineLatex math={'\\partial U / \\partial x = 0'} /> produce:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'x - \\frac{(1-\\mu)(x+\\mu)}{|x+\\mu|^3} - \\frac{\\mu(x-1+\\mu)}{|x-1+\\mu|^3} = 0'} />
            </div>
            <p>
              Esta es efectivamente una <strong>ecuación de quinto grado</strong> en <InlineLatex math={'x'} /> que no tiene solución analítica en general.
              Se resuelve numéricamente con el método de Newton-Raphson:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={"x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}"} />
            </div>
            <p>usando distintos puntos de inicio para localizar cada uno de los tres puntos colineales.</p>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">La Constante de Jacobi — la única integral de movimiento</h4>
            <p>
              Multiplicamos la ecuación anterior por <InlineLatex math={'\\dot{x}'} />, la ecuación de <InlineLatex math={'y'} /> por <InlineLatex math={'\\dot{y}'} /> y la ecuación de <InlineLatex math={'z'} /> por <InlineLatex math={'\\dot{z}'} />, y las sumamos. Los términos de Coriolis se cancelan exactamente:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\dot{x}(-2\\dot{y}) + \\dot{y}(+2\\dot{x}) = 0'} />
            </div>
            <p>
              El resultado es:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\dot{x}\\ddot{x} + \\dot{y}\\ddot{y} + \\dot{z}\\ddot{z} = \\dot{x}\\frac{\\partial U}{\\partial x} + \\dot{y}\\frac{\\partial U}{\\partial y} + \\dot{z}\\frac{\\partial U}{\\partial z} = \\frac{dU}{dt}'} />
            </div>
            <p>El lado izquierdo es <InlineLatex math={'\\dfrac{d}{dt}\\!\\left(\\dfrac{v^2}{2}\\right)'} />. Integrando en el tiempo:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\frac{v^2}{2} = U + \\text{cte}\\qquad \\Longrightarrow \\qquad \\boxed{C_J = -2U(x,y,z) - v^2}'} />
            </div>
            <p>
              <InlineLatex math={'C_J'} /> se denomina <strong>constante de Jacobi</strong> y es la <em>única</em> integral de movimiento conservada en el CR3BP (Poincaré demostró que no puede haber más).
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">Curvas de Hill (Superficies de Velocidad Cero)</h4>
            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">La restricción geométrica</h5>
            <p>
              Despejando <InlineLatex math={'v^2'} /> de la constante de Jacobi:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'v^2 = -2U(x,y,z) - C_J'} />
            </div>
            <p>
              Como <InlineLatex math={'v^2 \\geq 0'} /> siempre, el satélite solo puede habitar las regiones donde <InlineLatex math={'-2U(x,y,z) \\geq C_J'} />.
            </p>

            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">La frontera: velocidad cero</h5>
            <p>La superficie donde <InlineLatex math={'v^2 = 0'} /> exactamente define la frontera entre las regiones accesibles e inaccesibles:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'-2U(x,y,z) = C_J'} />
            </div>
            <p>
              Estas superficies (curvas en el plano <InlineLatex math={'z=0'} />) se denominan <strong>Curvas de Hill</strong> o <strong>Superficies de Velocidad Cero</strong>. En la frontera el satélite llega con velocidad cero y no puede cruzarla porque al otro lado necesitaría <InlineLatex math={'v^2 < 0'} />, físicamente imposible. Es una <strong>barrera energética</strong>, no una barrera física.
            </p>

            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">El valor de -2U en los puntos de Lagrange</h5>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'-2U = \\frac{2(1-\\mu)}{r_1} + \\frac{2\\mu}{r_2} + x^2 + y^2'} />
            </div>
            <p>
              Evaluando en los cinco puntos de Lagrange se obtienen sus valores de energía, ordenados como:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'C_{J,L_1} > C_{J,L_2} > C_{J,L_3} > C_{J,L_4} = C_{J,L_5}'} />
            </div>
            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Interpretación cualitativa</h5>
            <p>
              Para un valor de <InlineLatex math={'C_J'} /> mayor que <InlineLatex math={'C_{J,L_1}'} />, las curvas de Hill encierran completamente al satélite alrededor de <InlineLatex math={'M_2'} />: no puede escapar. A medida que <InlineLatex math={'C_J'} /> decrece, las curvas se abren primero en <InlineLatex math={'L_1'} /> (permitiendo tránsito hacia <InlineLatex math={'M_1'} />), luego en <InlineLatex math={'L_2'} /> (permitiendo escapar del sistema) y finalmente en <InlineLatex math={'L_3'} />. Las <strong>misiones a los puntos de Lagrange</strong> (como el JWST en <InlineLatex math={'L_2'} /> del sistema Sol--Tierra) explotan precisamente esta estructura de estabilidad.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">Por qué se necesita RK4 y no integración simple. Runge-Kutta 4 — de la intuición a la fórmula</h4>
            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">El problema a resolver</h5>
            <p>
              El CR3BP no tiene solución analítica. Las ecuaciones anteriores son un sistema de <strong>6 EDOs de primer orden</strong> acopladas:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\frac{d\\mathbf{y}}{dt} = \\mathbf{f}(t, \\mathbf{y}),\\qquad \\mathbf{y} = (x,\\; y,\\; z,\\; v_x,\\; v_y,\\; v_z)^\\top'} />
            </div>
            <p>
              Dado el estado inicial <InlineLatex math={'\\mathbf{y}_0'} />, se avanza paso a paso: dado <InlineLatex math={'\\mathbf{y}_n'} /> en el instante <InlineLatex math={'t_n'} />, calcular <InlineLatex math={'\\mathbf{y}_{n+1}'} /> en <InlineLatex math={'t_{n+1} = t_n + \\Delta t'} />.
            </p>

            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Método de Euler (primera aproximación)</h5>
            <p>
              Usar la pendiente al inicio del intervalo:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\mathbf{y}_{n+1} = \\mathbf{y}_n + \\Delta t\\, \\mathbf{f}(t_n, \\mathbf{y}_n)'} />
            </div>
            <p>
              El error global es <InlineLatex math={'O(\\Delta t)'} />: si el paso se reduce a la mitad, el error solo se reduce a la mitad.
            </p>

            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Regla del Trapecio e integración de Simpson</h5>
            <p>
              La idea central de los métodos de Runge-Kutta es mejorar la aproximación <strong>muestreando la pendiente en varios puntos del intervalo</strong>.
            </p>
            <p>La <strong>regla del trapecio</strong> usa dos puntos:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\int_a^b f(x)\\,dx \\approx \\frac{b-a}{2}\\bigl[f(a) + f(b)\\bigr]'} />
            </div>
            <p>con error <InlineLatex math={'O(\\Delta t^2)'} />.</p>
            <p>
              La <strong>regla de Simpson</strong> añade un punto intermedio <InlineLatex math={'m = (a+b)/2'} /> y ajusta una parábola:
            </p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\int_a^b f(x)\\,dx \\approx \\frac{b-a}{6}\\bigl[f(a) + 4\\,f(m) + f(b)\\bigr]'} />
            </div>
            <p>
              con error <InlineLatex math={'O(\\Delta t^4)'} />. Los pesos <InlineLatex math={'1, 4, 1'} /> reflejan que el punto central tiene mayor peso porque la parábola pasa exactamente por los tres puntos.
            </p>

            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Runge-Kutta 4: cuatro muestras de pendiente</h5>
            <p>
              RK4 traslada la idea de Simpson a EDOs. Como la función <InlineLatex math={'f'} /> depende de <InlineLatex math={'y'} /> (que cambia durante el intervalo), se necesitan <strong>dos muestras en el punto medio</strong> en lugar de una, de ahí los pesos <InlineLatex math={'1, 2, 2, 1'} /> en lugar de <InlineLatex math={'1, 4, 1'} />.
            </p>
            <p>Las cuatro pendientes (“coeficientes de Runge-Kutta”) son:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'k_1 = \\mathbf{f}(t_n,\\; \\mathbf{y}_n)\\\\k_2 = \\mathbf{f}(t_n + \\tfrac{\\Delta t}{2},\\; \\mathbf{y}_n + \\tfrac{\\Delta t}{2}\\,k_1)\\\\k_3 = \\mathbf{f}(t_n + \\tfrac{\\Delta t}{2},\\; \\mathbf{y}_n + \\tfrac{\\Delta t}{2}\\,k_2)\\\\k_4 = \\mathbf{f}(t_n + \\Delta t,\\; \\mathbf{y}_n + \\Delta t\\,k_3)'} />
            </div>
            <p>El paso completo es el <strong>promedio ponderado</strong>:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\mathbf{y}_{n+1} = \\mathbf{y}_n + \\frac{\\Delta t}{6}\\bigl(k_1 + 2k_2 + 2k_3 + k_4\\bigr)'} />
            </div>

            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Comparación de errores</h5>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\begin{array}{lcc}\\text{Método} & \\text{Error por paso} & \\text{Error global}\\\\\\hline\\text{Euler} & O(\\Delta t^2) & O(\\Delta t)\\\\\\text{Trapecio} & O(\\Delta t^3) & O(\\Delta t^2)\\\\\\textbf{RK4} & O(\\Delta t^5) & O(\\Delta t^4)\\end{array}'} />
            </div>
            <p>
              Si el paso se reduce a la mitad, el error de RK4 cae por un factor <InlineLatex math={'2^4 = 16'} />, frente al factor <InlineLatex math={'2'} /> del método de Euler.
            </p>

            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Aplicación al CR3BP</h5>
            <p>
              Cada paso de simulación llama a la función de derivadas <InlineLatex math={'cr3bpDerivatives'} /> exactamente <strong>cuatro veces</strong> (una por cada <InlineLatex math={'k_i'} />), con el vector de estado <InlineLatex math={'\\mathbf{y} = (x, y, z, v_x, v_y, v_z)^\\top'} />. Gracias al error de cuarto orden, la constante de Jacobi <InlineLatex math={'C_J'} /> se conserva con un error relativo inferior al <InlineLatex math={'0.1\\,\\%'} /> a lo largo de toda la simulación.
            </p>
          </section>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-white/15 bg-black/25 p-4 md:p-5">
        <h3 className="font-display text-base font-semibold text-white">De la fisica al codigo</h3>

        <article className="mt-4 space-y-6 text-sm leading-relaxed text-white/75">
          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">El principio fundamental: discretizar el tiempo</h4>
            <p>
              Las ecuaciones del CR3BP son <strong>ecuaciones diferenciales continuas</strong>: describen cómo cambia el estado del satélite en cada instante infinitesimal. Un ordenador no puede operar con infinitos; necesita saltar de un instante al siguiente en pasos discretos de tamaño <InlineLatex math={'\\Delta t'} />.
            </p>
            <p>
              La pregunta central del simulador es: dado el estado del satélite en el instante <InlineLatex math={'t_n'} />, ¿cómo se calcula el estado en <InlineLatex math={'t_{n+1} = t_n + \\Delta t'} />?
            </p>
            <p>Toda la cadena de archivos de código es la respuesta a esa pregunta.</p>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">El vector de estado: la física comprimida en 6 números</h4>
            <p>
              Las ecuaciones del CR3BP son de <strong>segundo orden</strong> (contienen <InlineLatex math={'\\ddot{x}'} />, <InlineLatex math={'\\ddot{y}'} />, <InlineLatex math={'\\ddot{z}'} />). Para aplicar RK4, que opera sobre sistemas de primer orden, se introduce el truco estándar de convertir las velocidades en variables independientes.
            </p>
            <p>Se define el <strong>vector de estado</strong>:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\mathbf{y} = (x,\\; y,\\; z,\\; v_x,\\; v_y,\\; v_z)^\\top'} />
            </div>
            <p>Con él, el sistema de segundo orden se reescribe como:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\frac{d\\mathbf{y}}{dt} = \\mathbf{f}(t, \\mathbf{y}) = \\begin{pmatrix}v_x \\\\ v_y \\\\ v_z \\\\ a_x(x,y,z,v_x,v_y) \\\\ a_y(x,y,z,v_x,v_y) \\\\ a_z(x,y,z)\\end{pmatrix}'} />
            </div>
            <p>donde las aceleraciones son las ecuaciones del CR3BP derivadas en la sección anterior. En el código, el vector de estado se representa como un objeto JavaScript:</p>
            <pre className="overflow-x-auto rounded-lg border border-white/15 bg-black/35 p-3 text-xs text-white/90"><code>{`state = {
  x, y, z,    // posicion en el marco rotante
  vx, vy, vz  // velocidad en el marco rotante
}`}</code></pre>
            <p>
              El estado es <strong>todo lo que se necesita</strong> para determinar la evolución futura del satélite. Dos satélites con el mismo estado en <InlineLatex math={'t_0'} /> seguirán exactamente la misma trayectoria: el sistema es determinista.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">El núcleo físico: cr3bpDerivatives</h4>
            <p>El archivo src/physics/cr3bp.js contiene la función que implementa directamente las ecuaciones del CR3BP. Cada línea tiene correspondencia exacta con la física:</p>
            <pre className="overflow-x-auto rounded-lg border border-white/15 bg-black/35 p-3 text-xs text-white/90"><code>{`function cr3bpDerivatives(t, state, mu) {
  const {x, y, z, vx, vy, vz} = state;

  // Distancias a cada masa principal
  const r1 = Math.sqrt((x + mu)**2 + y**2 + z**2);
  const r2 = Math.sqrt((x - 1 + mu)**2 + y**2 + z**2);

  // Aceleraciones: ecuaciones completas del CR3BP
  const ax = 2*vy + x - (1-mu)*(x+mu)/r1**3 - mu*(x-1+mu)/r2**3;
  const ay = -2*vx + y - (1-mu)*y/r1**3 - mu*y/r2**3;
  const az = -(1-mu)*z/r1**3 - mu*z/r2**3;

  // Derivada del estado = (velocidades, aceleraciones)
  return {x: vx, y: vy, z: vz, vx: ax, vy: ay, vz: az};
}`}</code></pre>
            <p>La correspondencia entre física y código es directa y sin aproximaciones:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\begin{array}{ll}\\text{Ecuación física} & \\text{Línea de código}\\\\\\hline r_1 = \\sqrt{(x+\\mu)^2 + y^2 + z^2} & \\texttt{Math.sqrt((x + mu)**2 + y**2 + z**2)}\\\\ \\ddot{x} = 2\\dot{y} + x - \\frac{(1-\\mu)(x+\\mu)}{r_1^3} - \\frac{\\mu(x-1+\\mu)}{r_2^3} & \\texttt{ax = 2*vy + x - (1-mu)*(x+mu)/r1**3 - ...}\\\\ \\ddot{y} = -2\\dot{x} + y - \\frac{(1-\\mu)y}{r_1^3} - \\frac{\\mu y}{r_2^3} & \\texttt{ay = -2*vx + y - (1-mu)*y/r1**3 - ...}\\\\ \\ddot{z} = -\\frac{(1-\\mu)z}{r_1^3} - \\frac{\\mu z}{r_2^3} & \\texttt{az = -(1-mu)*z/r1**3 - mu*z/r2**3}\\end{array}'} />
            </div>
            <p>
              Los términos <InlineLatex math={'+2*vy'} /> en <InlineLatex math={'ax'} /> y <InlineLatex math={'-2*vx'} /> en <InlineLatex math={'ay'} /> son la <strong>aceleración de Coriolis</strong> en el marco rotante. Si se omitieran, las trayectorias serían físicamente incorrectas aunque el integrador fuera perfecto.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">El integrador: rk4Step</h4>
            <p>El archivo src/physics/rk4.js implementa el integrador. Es <strong>completamente genérico</strong>: no sabe nada del CR3BP. Recibe cualquier función de derivadas y avanza el estado:</p>
            <pre className="overflow-x-auto rounded-lg border border-white/15 bg-black/35 p-3 text-xs text-white/90"><code>{`export function rk4Step(derivativeFunc, t, state, dt) {
  const k1 = derivativeFunc(t, state);
  const k2 = derivativeFunc(t + dt/2, add(state, scale(k1, dt/2)));
  const k3 = derivativeFunc(t + dt/2, add(state, scale(k2, dt/2)));
  const k4 = derivativeFunc(t + dt,   add(state, scale(k3, dt)));

  return add(state, scale(
    add(k1, add(scale(add(k2, k3), 2), k4)),
    dt/6
  ));
}`}</code></pre>
            <p>Las funciones auxiliares add y scale operan componente a componente sobre el objeto de estado. Por ejemplo:</p>
            <pre className="overflow-x-auto rounded-lg border border-white/15 bg-black/35 p-3 text-xs text-white/90"><code>{`// scale multiplica cada componente por un escalar
scale({x:1, y:2, vx:3, ...}, 0.5)
//  => {x:0.5, y:1, vx:1.5, ...}

// add suma componente a componente
add({x:1, vx:2, ...}, {x:3, vx:4, ...})
//  => {x:4, vx:6, ...}`}</code></pre>
            <p>La conexión entre los dos archivos ocurre en el loop de animación dentro de Scene3D.jsx:</p>
            <pre className="overflow-x-auto rounded-lg border border-white/15 bg-black/35 p-3 text-xs text-white/90"><code>{`// En cada frame, si la simulacion esta corriendo:
satelliteState = rk4Step(
  (t, state) => cr3bpDerivatives(t, state, mu),
  time,
  satelliteState,
  dt
);`}</code></pre>
            <p>
              rk4Step llama a cr3bpDerivatives exactamente <strong>4 veces</strong> por frame, una por cada <InlineLatex math={'k_i'} />. Cada llamada evalúa las ecuaciones completas del CR3BP con el estado intermedio correspondiente, tal como exige el esquema RK4.
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">Los Puntos de Lagrange: analítico vs. numérico</h4>
            <p>El archivo src/physics/lagrangePoints.js implementa las dos estrategias que la teoría dicta para cada tipo de punto:</p>

            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">L4 y L5 --- fórmula exacta</h5>
            <p>La solución analítica <InlineLatex math={'r_1 = r_2 = 1'} /> se traduce directamente a código sin ninguna aproximación:</p>
            <pre className="overflow-x-auto rounded-lg border border-white/15 bg-black/35 p-3 text-xs text-white/90"><code>{`export function calculateL4L5(mu) {
  const x = 0.5 - mu;
  const y = Math.sqrt(3) / 2;
  return {
    L4: { x,  y,  z: 0 },
    L5: { x,  y: -y, z: 0 }
  };
}`}</code></pre>

            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">L1, L2, L3 --- Newton-Raphson</h5>
            <p>La condición <InlineLatex math={'\\partial U/\\partial x = 0'} /> sobre el eje <InlineLatex math={'x'} /> produce una ecuación de quinto grado sin solución analítica. Se resuelve numéricamente con Newton-Raphson:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={"x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}"} />
            </div>
            <pre className="overflow-x-auto rounded-lg border border-white/15 bg-black/35 p-3 text-xs text-white/90"><code>{`function newtonRaphson(f, df, x0, tolerance, maxIter) { ... }

function calculateL1(mu) { /* punto de inicio entre M1 y M2 */ }
function calculateL2(mu) { /* punto de inicio mas alla de M2 */ }
function calculateL3(mu) { /* punto de inicio lado opuesto */  }`}</code></pre>
            <p>El punto de inicio difiere para cada uno porque la ecuación de quinto grado tiene tres raíces reales separadas y es necesario apuntar al vecindario de cada una para que el método converja al punto correcto.</p>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">La validación: por qué el simulador no es una invención</h4>
            <p>Un simulador físico válido se distingue de una animación arbitraria en que sus resultados concuerdan con las predicciones de la teoría analítica dentro del error numérico esperado. El simulador aplica tres niveles de validación independientes, todos documentados en TASKS.md.</p>

            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Nivel 1 --- Conservación de la Constante de Jacobi</h5>
            <p>La teoría garantiza que <InlineLatex math={'C_J = -2U - v^2'} /> es <strong>exactamente constante</strong> a lo largo de cualquier trayectoria real del CR3BP. El simulador la calcula en tiempo real:</p>
            <pre className="overflow-x-auto rounded-lg border border-white/15 bg-black/35 p-3 text-xs text-white/90"><code>{`export function calculateJacobi(state, mu) {
  const {x, y, z, vx, vy, vz} = state;

  const r1 = Math.sqrt((x + mu)**2 + y**2 + z**2);
  const r2 = Math.sqrt((x - 1 + mu)**2 + y**2 + z**2);

  const U = -((1-mu)/r1 + mu/r2 + 0.5*(x**2 + y**2));
  const v2 = vx**2 + vy**2 + vz**2;

  return -2*U - v2;
}`}</code></pre>
            <p>
              Si el integrador fuera incorrecto, <InlineLatex math={'C_J'} /> derivaría con el tiempo de forma sistemática y detectable.
              El archivo scripts/validate-physics.mjs verificó esta conservación antes del despliegue, con el resultado: “Conservación de Jacobi: error <InlineLatex math={'< 0.1\,\%'} />”.
            </p>
            <p>El <InlineLatex math={'0.1\\,\\%'} /> no es un error del modelo físico sino el <strong>error numérico inevitable de RK4</strong> con el <InlineLatex math={'\\Delta t'} /> elegido, completamente esperado y aceptable para visualización interactiva.</p>

            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Nivel 2 --- Posiciones de los Puntos de Lagrange vs. referencias</h5>
            <p>Las posiciones calculadas por Newton-Raphson se cotejaron contra valores publicados en la literatura de mecánica celeste. Para el sistema Sol-Tierra (<InlineLatex math={'\\mu = 3.04 \\times 10^{-6}'} />), los valores de referencia son:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\begin{array}{lcc}\\text{Punto} & \\text{Posición }x\\text{ (unidades norm.)} & \\text{Interpretación física}\\\\\\hline L_1 & \\approx 0.9900 & \\text{Entre Sol y Tierra}\\\\ L_2 & \\approx 1.0100 & \\text{Detrás de la Tierra}\\\\ L_3 & \\approx -1.0000 & \\text{Lado opuesto al Sol}\\end{array}'} />
            </div>
            <p>Un error en el Newton-Raphson produciría puntos desplazados respecto a las posiciones físicamente estables, detectable visualmente porque el satélite no permanecería cerca de ellos.</p>

            <h5 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Nivel 3 --- Verificación geométrica de L4 y L5</h5>
            <p>La solución analítica exige <InlineLatex math={'r_1 = r_2 = 1'} /> en <InlineLatex math={'L_4'} /> y <InlineLatex math={'L_5'} />. Basta calcular numéricamente ambas distancias y verificar que valen exactamente 1. Es una comprobación algebraica trivial pero definitiva, sin margen para errores de redondeo significativos.</p>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">El mapa completo: de la ecuación diferencial a los píxeles</h4>
            <p>La siguiente tabla resume la cadena completa desde la física continua hasta la representación visual:</p>
            <div className="overflow-x-auto text-white/90">
              <BlockLatex math={'\\begin{array}{ll}\\textbf{Física (continua)} & \\textbf{Código (discreto)}\\\\\\hline \\text{Ecuaciones del CR3BP }\\ddot{x} - 2\\dot{y} = \\partial U/\\partial x & \\texttt{cr3bpDerivatives(t, state, mu)}\\\\ \\text{Vector de estado }\\mathbf{y} = (x,y,z,v_x,v_y,v_z)^\\top & \\texttt{state = \\{x, y, z, vx, vy, vz\\}}\\\\ \\text{Integrador RK4 }\\mathbf{y}_{n+1} = \\mathbf{y}_n + \\frac{\\Delta t}{6}(\\cdots) & \\texttt{rk4Step(...)}\\text{ llamado en cada frame}\\\\ \\text{Constante de Jacobi }C_J = -2U - v^2 = \\text{cte} & \\texttt{calculateJacobi(state, mu), error }<0.1\\,\\%\\\\ L_4,L_5\\text{: fórmula exacta} & \\texttt{calculateL4L5(mu)}\\\\ L_1,L_2,L_3\\text{: ec. de quinto grado} & \\texttt{newtonRaphson(...)}\\text{ validado vs. papers}\\\\ \\text{Posición }(x,y,z)\\text{ en unidades normalizadas} & \\texttt{satellite.position.set(state.x, state.y, state.z)}\\\\ \\text{Historia de posiciones (trayectoria)} & \\texttt{BufferGeometry, 5,000 puntos FIFO, degradado blanco }\\to\\text{ cyan}\\end{array}'} />
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-white">Por qué esto no es una “invención”</h4>
            <p>La diferencia entre una simulación física válida y una animación arbitraria reside en que los datos de validación concuerdan con las predicciones de la teoría analítica dentro del error numérico esperado.</p>
            <p>El JWST, lanzado en diciembre de 2021, orbita actualmente <InlineLatex math={'L_2'} /> del sistema Sol-Tierra en una órbita de halo. Su trayectoria se calcula con exactamente estas ecuaciones: el CR3BP es la base del diseño de misiones a los puntos de Lagrange desde los años 1960 (misiones ISEE-3, SOHO, WMAP, Gaia, JWST).</p>
            <p>El simulador no reinventa la física: la reimplementa fielmente y lo demuestra conservando la única cantidad que la teoría garantiza que debe conservarse, la constante de Jacobi.</p>
          </section>
        </article>
      </section>
    </section>
  )
}

export default InfoPanel
