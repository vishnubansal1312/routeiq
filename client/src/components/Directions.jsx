import { useState, useEffect, useRef } from 'react'

function getIcon(maneuver = '') {
  const m = maneuver.toUpperCase()
  if (m.includes('LEFT')  && m.includes('SHARP')) return '↰'
  if (m.includes('RIGHT') && m.includes('SHARP')) return '↱'
  if (m.includes('UTURN'))                        return '↩'
  if (m.includes('LEFT'))                         return '←'
  if (m.includes('RIGHT'))                        return '→'
  if (m.includes('KEEP_LEFT'))                    return '↖'
  if (m.includes('KEEP_RIGHT'))                   return '↗'
  if (m.includes('ROUNDABOUT'))                   return '↻'
  if (m.includes('ARRIVE'))                       return '📍'
  if (m.includes('DEPART'))                       return '🚦'
  return '↑'
}

function formatDist(meters) {
  if (!meters) return ''
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.round(meters)} m`
}

// Calculate distance between two GPS points in meters
function gpsDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function Directions({
  instructions = [],
  totalDistance,
  totalDuration,
  userLocation,        // { lat, lon } from MapPage
  onStepChange,        // callback to highlight step on map
}) {
  const [activeStep, setActiveStep] = useState(0)
  const [voiceOn, setVoiceOn]       = useState(false)
  const [expanded, setExpanded]     = useState(true)
  const [announced, setAnnounced]   = useState(-1)
  const activeRef                   = useRef(null)
  const synth                       = window.speechSynthesis

  // Auto-scroll active step into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeStep])

  // Speak instruction
  const speak = (text) => {
    if (!voiceOn) return
    synth.cancel()
    const u  = new SpeechSynthesisUtterance(text)
    u.lang   = 'en-IN'
    u.rate   = 0.92
    u.pitch  = 1
    synth.speak(u)
  }

  // When step changes manually
  useEffect(() => {
    if (instructions[activeStep]) {
      speak(instructions[activeStep].message)
      onStepChange?.(instructions[activeStep])
    }
  }, [activeStep, voiceOn])

  // ── LIVE LOCATION: auto-advance steps ─────────────────────────────
  useEffect(() => {
    if (!userLocation || !instructions.length) return

    // Find which step point we are closest to
    let closestStep = activeStep
    let closestDist = Infinity

    instructions.forEach((step, i) => {
      if (!step.point) return
      const d = gpsDistance(
        userLocation.lat, userLocation.lon,
        step.point[0],    step.point[1]
      )
      if (d < closestDist) {
        closestDist = d
        closestStep = i
      }
    })

    // If we are within 80m of a step point, advance to next step
    if (closestDist < 80 && closestStep !== activeStep) {
      setActiveStep(closestStep)

      // Announce upcoming turn (next step)
      const nextStep = instructions[closestStep + 1]
      if (nextStep && announced !== closestStep) {
        setAnnounced(closestStep)
        speak(`In ${formatDist(nextStep.distanceMeters)}, ${nextStep.message}`)
      }
    }

    // Warn 200m before a turn
    const next = instructions[activeStep + 1]
    if (next?.point) {
      const distToNext = gpsDistance(
        userLocation.lat, userLocation.lon,
        next.point[0],    next.point[1]
      )
      if (distToNext < 200 && announced !== activeStep) {
        setAnnounced(activeStep)
        speak(`In ${formatDist(distToNext)}, ${next.message}`)
      }
    }
  }, [userLocation])

  const goNext = () => { if (activeStep < instructions.length - 1) setActiveStep(s => s + 1) }
  const goPrev = () => { if (activeStep > 0) setActiveStep(s => s - 1) }

  const toggleVoice = () => {
    if (voiceOn) synth.cancel()
    setVoiceOn(v => !v)
  }

  if (!instructions.length) return null
  const current = instructions[activeStep]

  return (
    <div className="border-t border-dark-700 mt-3">

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-dark-700/50"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-300">Turn-by-Turn Directions</span>
          <span className="text-xs bg-primary-500/20 text-primary-400 border border-primary-500/30 px-2 py-0.5 rounded-full">
            {instructions.length} steps
          </span>
        </div>
        <span className="text-slate-500 text-xs">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4">

          {/* Current step card */}
          <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {getIcon(current.maneuver)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm leading-snug">
                  {current.message}
                </div>
                {current.street && (
                  <div className="text-primary-400 text-xs mt-1 truncate">
                    onto {current.street}
                  </div>
                )}
                {current.distanceMeters > 0 && (
                  <div className="text-slate-400 text-xs mt-1">
                    {formatDist(current.distanceMeters)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-400">
                Step {activeStep + 1} of {instructions.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={activeStep === 0}
                  className="px-3 py-1.5 text-xs bg-dark-700 text-slate-300 rounded-lg border border-dark-600 disabled:opacity-40 hover:bg-dark-600 transition-all"
                >
                  ← Prev
                </button>
                <button
                  onClick={goNext}
                  disabled={activeStep === instructions.length - 1}
                  className="px-3 py-1.5 text-xs bg-primary-500 text-white rounded-lg disabled:opacity-40 hover:bg-primary-600 transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Voice button */}
          <button
            onClick={toggleVoice}
            className={`w-full py-2 text-xs font-semibold rounded-xl border transition-all mb-3 flex items-center justify-center gap-2 ${
              voiceOn
                ? 'bg-green-500/15 text-green-400 border-green-500/30'
                : 'bg-dark-700 text-slate-400 border-dark-600 hover:bg-dark-600'
            }`}
          >
            <span>{voiceOn ? '🔊' : '🔇'}</span>
            {voiceOn ? 'Voice ON — will announce turns' : 'Tap to enable voice navigation'}
          </button>

          {/* Steps list */}
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {instructions.map((step, i) => (
              <div
                key={step.id}
                ref={i === activeStep ? activeRef : null}
                onClick={() => setActiveStep(i)}
                className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                  i === activeStep
                    ? 'bg-primary-500/15 border border-primary-500/30'
                    : 'hover:bg-dark-700/60 border border-transparent'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                  i === activeStep
                    ? 'bg-primary-500 text-white'
                    : i < activeStep
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-dark-600 text-slate-400'
                }`}>
                  {i < activeStep ? '✓' : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{getIcon(step.maneuver)}</span>
                    <span className={`text-xs leading-snug ${
                      i === activeStep ? 'text-white font-medium' : 'text-slate-400'
                    }`}>
                      {step.message}
                    </span>
                  </div>
                  {step.distanceMeters > 0 && (
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      {formatDist(step.distanceMeters)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-700">
            <span className="text-xs text-slate-500">Total: {totalDistance} km</span>
            <span className="text-xs text-slate-500">{totalDuration} min</span>
            <button
              onClick={() => setActiveStep(0)}
              className="text-xs text-primary-400 hover:text-primary-300"
            >
              ↺ Restart
            </button>
          </div>
        </div>
      )}
    </div>
  )
}