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
    </section>
  )
}

export default InfoPanel
