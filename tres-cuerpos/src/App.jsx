import Scene3D from './components/Scene3D'
import ControlPanel from './components/ControlPanel'
import InfoPanel from './components/InfoPanel'

function App() {
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
        <ControlPanel />
        <Scene3D />
      </section>

      <section className="px-4 pb-6 md:px-6">
        <InfoPanel />
      </section>
    </main>
  )
}

export default App
