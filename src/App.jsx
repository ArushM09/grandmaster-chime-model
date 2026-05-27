import { useEffect, useMemo, useState } from 'react'
import { BoxSelect, MousePointer2, RotateCcw } from 'lucide-react'
import GrandmasterViewer from './components/GrandmasterViewer'
import ModelErrorBoundary from './components/ModelErrorBoundary'
import {
  MANIFEST_PATH,
  mechanismMap,
  mechanisms,
  publicFactCards,
} from './data/mechanisms'

function useModelManifest() {
  const [manifest, setManifest] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    fetch(MANIFEST_PATH)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Manifest request failed with ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        if (isMounted) {
          setManifest(data)
        }
      })
      .catch((fetchError) => {
        if (isMounted) {
          setError(fetchError)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { manifest, error }
}

function App() {
  const [selectedId, setSelectedId] = useState('Reversible_Double_Sided_Case')
  const [hoveredId, setHoveredId] = useState(null)
  const [resetSignal, setResetSignal] = useState(0)
  const { manifest, error: manifestError } = useModelManifest()

  const selectedMechanism = useMemo(
    () => mechanismMap.get(selectedId) || null,
    [selectedId],
  )

  const assetType = manifest?.assetType || 'loading asset manifest'

  return (
    <main className="app-shell">
      <section className="viewer-stage" aria-label="Grandmaster Chime model">
        <div className="stage-header">
          <div>
            <p className="eyebrow">Museum grade technical model</p>
            <h1>Grandmaster Chime</h1>
          </div>
          <div className="tool-row" aria-label="Viewer tools">
            <button
              type="button"
              className="tool-button"
              onClick={() => setResetSignal((value) => value + 1)}
            >
              <RotateCcw aria-hidden="true" size={17} />
              <span>Reset view</span>
            </button>
            <button
              type="button"
              className="tool-button"
              onClick={() => setSelectedId(null)}
            >
              <BoxSelect aria-hidden="true" size={17} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <ModelErrorBoundary>
          <GrandmasterViewer
            selectedId={selectedId}
            hoveredId={hoveredId}
            resetSignal={resetSignal}
            onSelect={setSelectedId}
            onHover={setHoveredId}
          />
        </ModelErrorBoundary>

        <div className="stage-footer">
          <span>
            <MousePointer2 aria-hidden="true" size={15} />
            Click any named mechanism group to inspect it.
          </span>
          <span>Rotate and zoom with mouse, trackpad, or touch.</span>
        </div>
      </section>

      <aside className="inspector-panel" aria-label="Mechanism inspector">
        <section className="panel-section title-section">
          <p className="eyebrow">Generated GLB asset</p>
          <h2>Educational mechanism map</h2>
          <p>
            Original geometry from public facts only. This is not exact CAD and
            does not reproduce proprietary diagrams, photos, or layouts.
          </p>
        </section>

        <section className="fact-strip" aria-label="Public facts">
          {publicFactCards.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="panel-section selected-section" aria-live="polite">
          <p className="section-kicker">Selected group</p>
          {selectedMechanism ? (
            <>
              <h3>{selectedMechanism.label}</h3>
              <span className="category-pill">{selectedMechanism.category}</span>
              <p>{selectedMechanism.beginner}</p>
            </>
          ) : (
            <p className="empty-state">No mechanism selected.</p>
          )}
        </section>

        <section className="panel-section">
          <div className="section-heading">
            <p className="section-kicker">Clickable groups</p>
            <span>{mechanisms.length}</span>
          </div>
          <div className="mechanism-list">
            {mechanisms.map((mechanism) => (
              <button
                type="button"
                className={
                  mechanism.id === selectedId
                    ? 'mechanism-row selected'
                    : 'mechanism-row'
                }
                key={mechanism.id}
                onClick={() => setSelectedId(mechanism.id)}
                onMouseEnter={() => setHoveredId(mechanism.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <span>{mechanism.label}</span>
                <small>{mechanism.category}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-section source-note">
          <p className="section-kicker">Asset status</p>
          <p>
            {assetType}
            {manifest?.blenderAvailableWhenGenerated === false
              ? ' because Blender was not available during generation.'
              : ''}
          </p>
          {manifestError ? <p>{manifestError.message}</p> : null}
        </section>
      </aside>
    </main>
  )
}

export default App
