import { useEffect, useMemo, useState } from 'react'
import {
  BoxSelect,
  Bell,
  CalendarDays,
  Clock3,
  Eye,
  Layers3,
  MousePointer2,
  PauseCircle,
  RefreshCw,
  Repeat2,
  RotateCcw,
  Rotate3D,
  ScanLine,
  Search,
  Tags,
  Timer,
} from 'lucide-react'
import GrandmasterViewer from './components/GrandmasterViewer'
import ModelErrorBoundary from './components/ModelErrorBoundary'
import { animationModes, getAnimationSnapshot } from './data/animationModes'
import {
  MANIFEST_PATH,
  acousticFunctions,
  mechanismMap,
  mechanisms,
  publicFactCards,
  sourceNotes,
} from './data/mechanisms'

const animationIcons = {
  idle: PauseCircle,
  case_flip: Rotate3D,
  grande_sonnerie: Bell,
  petite_sonnerie: Bell,
  minute_repeater: Timer,
  date_repeater: Repeat2,
  alarm_strike: Bell,
  calendar_advance: RefreshCw,
}

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
  const [viewSide, setViewSide] = useState('time')
  const [exploded, setExploded] = useState(false)
  const [labelsVisible, setLabelsVisible] = useState(false)
  const [cutaway, setCutaway] = useState(false)
  const [transparentCase, setTransparentCase] = useState(false)
  const [animationMode, setAnimationMode] = useState('idle')
  const [animationSnapshot, setAnimationSnapshot] = useState(() =>
    getAnimationSnapshot('idle', 0),
  )
  const [explanationLevel, setExplanationLevel] = useState('beginner')
  const [searchTerm, setSearchTerm] = useState('')
  const { manifest, error: manifestError } = useModelManifest()

  const selectedMechanism = useMemo(
    () => mechanismMap.get(selectedId) || null,
    [selectedId],
  )

  const filteredMechanisms = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) {
      return mechanisms
    }

    return mechanisms.filter((mechanism) =>
      [
        mechanism.label,
        mechanism.category,
        mechanism.beginner,
        mechanism.advanced,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [searchTerm])

  const assetType = manifest?.assetType || 'loading asset manifest'

  return (
    <main className="app-shell">
      <section className="viewer-stage" aria-label="Grandmaster Chime model">
        <div className="stage-header">
          <div>
            <p className="eyebrow">Museum grade technical model</p>
            <h1>Grandmaster Chime</h1>
          </div>
          <div className="control-stack">
            <div className="segmented-control" aria-label="Dial side">
              <button
                type="button"
                className={viewSide === 'time' ? 'active' : ''}
                onClick={() => setViewSide('time')}
              >
                <Clock3 aria-hidden="true" size={16} />
                <span>Time side</span>
              </button>
              <button
                type="button"
                className={viewSide === 'calendar' ? 'active' : ''}
                onClick={() => setViewSide('calendar')}
              >
                <CalendarDays aria-hidden="true" size={16} />
                <span>Calendar side</span>
              </button>
            </div>

            <div className="tool-row" aria-label="Viewer tools">
              <button
                type="button"
                className="tool-button"
                onClick={() => setResetSignal((value) => value + 1)}
              >
                <RotateCcw aria-hidden="true" size={17} />
                <span>Reset</span>
              </button>
              <button
                type="button"
                className={exploded ? 'tool-button active' : 'tool-button'}
                aria-pressed={exploded}
                onClick={() => setExploded((value) => !value)}
              >
                <Layers3 aria-hidden="true" size={17} />
                <span>Explode</span>
              </button>
              <button
                type="button"
                className={labelsVisible ? 'tool-button active' : 'tool-button'}
                aria-pressed={labelsVisible}
                onClick={() => setLabelsVisible((value) => !value)}
              >
                <Tags aria-hidden="true" size={17} />
                <span>Labels</span>
              </button>
              <button
                type="button"
                className={cutaway ? 'tool-button active' : 'tool-button'}
                aria-pressed={cutaway}
                onClick={() => setCutaway((value) => !value)}
              >
                <ScanLine aria-hidden="true" size={17} />
                <span>Cutaway</span>
              </button>
              <button
                type="button"
                className={transparentCase ? 'tool-button active' : 'tool-button'}
                aria-pressed={transparentCase}
                onClick={() => setTransparentCase((value) => !value)}
              >
                <Eye aria-hidden="true" size={17} />
                <span>Case</span>
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
        </div>

        <ModelErrorBoundary>
          <GrandmasterViewer
            selectedId={selectedId}
            hoveredId={hoveredId}
            resetSignal={resetSignal}
            onSelect={setSelectedId}
            onHover={setHoveredId}
            viewSide={viewSide}
            exploded={exploded}
            labelsVisible={labelsVisible}
            cutaway={cutaway}
            transparentCase={transparentCase}
            animationMode={animationMode}
            onAnimationUpdate={setAnimationSnapshot}
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
          <div className="section-heading">
            <p className="section-kicker">Selected group</p>
            <div className="mini-tabs" aria-label="Explanation level">
              <button
                type="button"
                className={explanationLevel === 'beginner' ? 'active' : ''}
                onClick={() => setExplanationLevel('beginner')}
              >
                Beginner
              </button>
              <button
                type="button"
                className={explanationLevel === 'advanced' ? 'active' : ''}
                onClick={() => setExplanationLevel('advanced')}
              >
                Advanced
              </button>
            </div>
          </div>
          {selectedMechanism ? (
            <>
              <h3>{selectedMechanism.label}</h3>
              <span className="category-pill">{selectedMechanism.category}</span>
              <p>{selectedMechanism[explanationLevel]}</p>
            </>
          ) : (
            <p className="empty-state">No mechanism selected.</p>
          )}
        </section>

        <section className="panel-section state-section">
          <p className="section-kicker">Current view</p>
          <dl>
            <div>
              <dt>Side</dt>
              <dd>{viewSide === 'time' ? 'Time side' : 'Calendar side'}</dd>
            </div>
            <div>
              <dt>Exploded</dt>
              <dd>{exploded ? 'On' : 'Off'}</dd>
            </div>
            <div>
              <dt>Labels</dt>
              <dd>{labelsVisible ? 'On' : 'Off'}</dd>
            </div>
            <div>
              <dt>Cutaway</dt>
              <dd>{cutaway ? 'On' : 'Off'}</dd>
            </div>
            <div>
              <dt>Transparent case</dt>
              <dd>{transparentCase ? 'On' : 'Off'}</dd>
            </div>
          </dl>
        </section>

        <section className="panel-section animation-section">
          <div className="section-heading">
            <p className="section-kicker">Animation mode</p>
            <span>{animationSnapshot.mode.shortLabel}</span>
          </div>
          <div className="mode-grid">
            {animationModes.map((mode) => {
              const Icon = animationIcons[mode.id] || Bell
              return (
                <button
                  type="button"
                  className={
                    animationMode === mode.id ? 'mode-button active' : 'mode-button'
                  }
                  key={mode.id}
                  onClick={() => setAnimationMode(mode.id)}
                >
                  <Icon aria-hidden="true" size={15} />
                  <span>{mode.shortLabel}</span>
                </button>
              )
            })}
          </div>
          <div className="timeline-card" aria-live="polite">
            <div className="timeline-copy">
              <span>{animationSnapshot.mode.label}</span>
              <strong>{animationSnapshot.phase.label}</strong>
            </div>
            <div
              className="timeline-track"
              role="progressbar"
              aria-label="Animation phase timeline"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.round(animationSnapshot.progress * 100)}
            >
              <span style={{ width: `${animationSnapshot.progress * 100}%` }} />
            </div>
            <p>{animationSnapshot.mode.description}</p>
          </div>
        </section>

        <section className="panel-section">
          <div className="section-heading">
            <p className="section-kicker">Clickable groups</p>
            <span>
              {filteredMechanisms.length}/{mechanisms.length}
            </span>
          </div>
          <label className="search-box">
            <Search aria-hidden="true" size={16} />
            <span className="sr-only">Search mechanisms</span>
            <input
              type="search"
              placeholder="Search mechanisms"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
          <div className="mechanism-list">
            {filteredMechanisms.map((mechanism) => (
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
            {filteredMechanisms.length === 0 ? (
              <p className="empty-state">No matching mechanisms.</p>
            ) : null}
          </div>
        </section>

        <section className="panel-section complication-section">
          <p className="section-kicker">Acoustic functions</p>
          <p>
            The public specification identifies five acoustic functions. The
            animation modes keep those functions visually distinct.
          </p>
          <div className="acoustic-list">
            {acousticFunctions.map(([name, detail]) => (
              <div key={name}>
                <strong>{name}</strong>
                <span>{detail}</span>
              </div>
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

        <section className="panel-section source-note">
          <p className="section-kicker">Source notes and disclaimer</p>
          <ul>
            {sourceNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      </aside>
    </main>
  )
}

export default App
