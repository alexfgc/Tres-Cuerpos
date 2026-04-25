function InfoPanel() {
  return (
    <section className="rounded-xl border border-white/20 bg-white/5 p-4">
      <h2 className="font-display text-lg font-semibold">Estado del Proyecto</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/75">
        Esta primera entrega ya muestra los cuerpos principales del sistema Sol-Tierra y los cinco
        puntos de Lagrange en el marco rotante. El siguiente paso es integrar la dinamica del
        tercer cuerpo con RK4 y dibujar su trayectoria en tiempo real.
      </p>
    </section>
  )
}

export default InfoPanel
