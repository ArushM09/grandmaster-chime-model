const publicFacts = [
  ['Case', '47.7 mm reversible double sided case'],
  ['Movement', 'Caliber GS AL 36 750 QIS FUS IRM'],
  ['Scale', '37 mm diameter, 10.7 mm thickness movement'],
  ['Acoustics', 'Five acoustic functions with three classic gongs'],
]

function App() {
  return (
    <main className="app-shell">
      <section className="hero-panel" aria-labelledby="page-title">
        <p className="eyebrow">Original geometry rebuild</p>
        <h1 id="page-title">Grandmaster Chime educational 3D model</h1>
        <p className="lede">
          A museum style React and Three.js experience is being built from
          public specifications and original generated geometry. This project
          does not claim exact CAD accuracy.
        </p>
      </section>

      <section className="fact-grid" aria-label="Public specification anchors">
        {publicFacts.map(([label, value]) => (
          <article className="fact-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="milestone-strip" aria-label="Build status">
        <div>
          <span className="status-dot" aria-hidden="true" />
          <span>Vite React base ready</span>
        </div>
        <div>
          <span className="status-dot pending" aria-hidden="true" />
          <span>Blender GLB pipeline next</span>
        </div>
      </section>
    </main>
  )
}

export default App
