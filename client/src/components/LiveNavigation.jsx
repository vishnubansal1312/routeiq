import { useState, useEffect, useRef } from 'react'

function getIcon(instruction) {
  if (!instruction) return '↑'
  const text = instruction.toLowerCase()
  if (text.includes('arrive') || text.includes('destination')) return '📍'
  if (text.includes('depart') || text.includes('leave'))       return '🚀'
  if (text.includes('roundabout'))   return '⟳'
  if (text.includes('u-turn'))       return '⟳'
  if (text.includes('sharp right'))  return '⬎'
  if (text.includes('sharp left'))   return '⬏'
  if (text.includes('slight right')) return '↗'
  if (text.includes('slight left'))  return '↖'
  if (text.includes('right'))        return '↱'
  if (text.includes('left'))         return '↰'
  if (text.includes('straight') || text.includes('continue')) return '↑'
  return '↑'
}

function getManeuverColor(instruction) {
  if (!instruction) return '#6d28d9'
  const t = instruction.toLowerCase()
  if (t.includes('right'))  return '#0ea5e9'
  if (t.includes('left'))   return '#f97316'
  if (t.includes('arrive')) return '#22c55e'
  if (t.includes('depart')) return '#6d28d9'
  return '#6d28d9'
}

function formatDist(meters) {
  if (!meters && meters !== 0) return ''
  if (meters >= 1000) return `${(meters/1000).toFixed(1)} km`
  if (meters >= 100)  return `${Math.round(meters/10)*10} m`
  return `${Math.round(meters)} m`
}

function formatTime(seconds) {
  if (!seconds) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
}

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2-lat1) * Math.PI/180
  const dLon = (lon2-lon1) * Math.PI/180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function findNearestStepIndex(userLat, userLon, instructions) {
  if (!instructions?.length || !userLat) return 0
  let nearest = 0
  let minDist = Infinity
  instructions.forEach((step, i) => {
    if (step.lat && step.lon) {
      const d = calcDistance(userLat, userLon, step.lat, step.lon)
      if (d < minDist) { minDist = d; nearest = i }
    }
  })
  return nearest
}

function calcSpeed(prevPos, currPos, deltaMs) {
  if (!prevPos || !currPos || deltaMs <= 0) return 0
  const dist = calcDistance(prevPos.lat, prevPos.lon, currPos.lat, currPos.lon)
  return Math.round((dist / deltaMs) * 3600) // km/h
}

export default function LiveNavigation({
  instructions, userLocation, totalDistance, totalDuration, onClose, onZoomRequest
}) {
  const [currentStep, setCurrentStep]   = useState(0)
  const [voiceOn,     setVoiceOn]       = useState(true)
  const [arrived,     setArrived]       = useState(false)
  const [speed,       setSpeed]         = useState(0)
  const [distLeft,    setDistLeft]      = useState(null)
  const [timeLeft,    setTimeLeft]      = useState(null)
  const lastSpokenStep = useRef(-1)
  const prevPosition   = useRef(null)
  const prevTime       = useRef(null)

  const steps    = instructions || []
  const step     = steps[currentStep]
  const nextStep = steps[currentStep + 1]
  const color    = getManeuverColor(step?.instruction)

  // Auto-advance + speed + distance tracking
  useEffect(() => {
    if (!userLocation || !steps.length) return

    // Calculate speed
    const now = Date.now()
    if (prevPosition.current && prevTime.current) {
      const deltaMs = now - prevTime.current
      const spd = calcSpeed(prevPosition.current, userLocation, deltaMs)
      if (spd < 250) setSpeed(spd) // filter GPS noise
    }
    prevPosition.current = userLocation
    prevTime.current = now

    // Find nearest step
    const nearest = findNearestStepIndex(userLocation.lat, userLocation.lon, steps)
    if (nearest > currentStep) setCurrentStep(nearest)

    // Remaining distance to destination
    const lastStep = steps[steps.length - 1]
    if (lastStep?.lat && lastStep?.lon) {
      const remaining = calcDistance(userLocation.lat, userLocation.lon, lastStep.lat, lastStep.lon)
      setDistLeft(remaining)
      // Estimate time remaining (assume avg 40km/h in city)
      setTimeLeft(Math.round(remaining / 40000 * 3600))
      if (remaining < 50) setArrived(true)
    }

    // Request map zoom
    if (onZoomRequest) onZoomRequest(userLocation, 17)

  }, [userLocation])

  // Voice announcement
  useEffect(() => {
    if (!voiceOn || !step || lastSpokenStep.current === currentStep) return
    if (!window.speechSynthesis) return
    lastSpokenStep.current = currentStep
    window.speechSynthesis.cancel()
    const distText = step.distance ? `In ${formatDist(step.distance)},` : ''
    const msg = new SpeechSynthesisUtterance(`${distText} ${step.instruction || ''}`)
    msg.lang  = 'en-IN'
    msg.rate  = 0.95
    msg.pitch = 1
    window.speechSynthesis.speak(msg)
  }, [currentStep, voiceOn])

  const distToNext = userLocation && step?.lat && step?.lon
    ? calcDistance(userLocation.lat, userLocation.lon, step.lat, step.lon)
    : null

  if (!steps.length) return null

  return (
    <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:9998, fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes pulse-nav { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes slide-up  { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>

      {/* ── Arrived ── */}
      {arrived ? (
        <div style={{ background:'#6d28d9', padding:'28px 24px', textAlign:'center', animation:'slide-up 0.4s ease' }}>
          <div style={{ fontSize:44, marginBottom:10 }}>🎉</div>
          <div style={{ fontSize:24, fontWeight:800, color:'#fff', marginBottom:6 }}>You have arrived!</div>
          <div style={{ fontSize:14, color:'rgba(255,255,255,0.7)', marginBottom:20 }}>You reached your destination</div>
          <button onClick={onClose}
            style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', padding:'12px 28px', borderRadius:24, cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:15 }}>
            Done ✓
          </button>
        </div>
      ) : (
        <div style={{ animation:'slide-up 0.3s ease' }}>

          {/* ── Next step preview bar ── */}
          {nextStep && (
            <div style={{ background:'rgba(26,15,60,0.97)', backdropFilter:'blur(8px)', padding:'8px 20px', display:'flex', alignItems:'center', gap:12, borderTop:`2px solid ${color}30` }}>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)', flexShrink:0 }}>Then</span>
              <span style={{ fontSize:18, flexShrink:0 }}>{getIcon(nextStep.instruction)}</span>
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.8)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {nextStep.instruction}
              </span>
              {nextStep.distance && (
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.45)', flexShrink:0 }}>{formatDist(nextStep.distance)}</span>
              )}
            </div>
          )}

          {/* ── Main navigation card ── */}
          <div style={{ background:'#0f0a1e', padding:'14px 16px' }}>

            {/* Top row — turn + instruction */}
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>

              {/* Turn icon */}
              <div style={{ width:64, height:64, borderRadius:18, background:`${color}20`, border:`2.5px solid ${color}60`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, flexShrink:0, animation:'pulse-nav 2s ease-in-out infinite' }}>
                {getIcon(step?.instruction)}
              </div>

              {/* Distance + instruction */}
              <div style={{ flex:1, minWidth:0 }}>
                {distToNext !== null && (
                  <div style={{ fontSize:32, fontWeight:800, color:'#fff', lineHeight:1, marginBottom:4, letterSpacing:'-0.5px' }}>
                    {formatDist(distToNext)}
                  </div>
                )}
                <div style={{ fontSize:14, color:'rgba(255,255,255,0.9)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {step?.instruction}
                </div>
                {step?.name && (
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    📍 {step.name}
                  </div>
                )}
              </div>

              {/* Controls column */}
              <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
                <button
                  onClick={() => { setVoiceOn(v => !v); if (voiceOn) window.speechSynthesis?.cancel() }}
                  style={{ width:38, height:38, borderRadius:19, border:`1px solid ${voiceOn?color+'60':'rgba(255,255,255,0.15)'}`, background:voiceOn?`${color}30`:'rgba(255,255,255,0.08)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}
                  title={voiceOn?'Mute voice':'Enable voice'}
                >
                  {voiceOn ? '🔊' : '🔇'}
                </button>
                <button
                  onClick={onClose}
                  style={{ width:38, height:38, borderRadius:19, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.2)', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', color:'#fca5a5' }}
                  title="Stop navigation"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ── Bottom bar — speed + ETA + progress ── */}
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>

              {/* Speed display */}
              <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'6px 12px', textAlign:'center', flexShrink:0, minWidth:64 }}>
                <div style={{ fontSize:22, fontWeight:800, color:'#fff', lineHeight:1 }}>{speed}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', marginTop:2 }}>km/h</div>
              </div>

              {/* Progress + ETA */}
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>
                    {currentStep+1}/{steps.length} steps
                  </span>
                  <div style={{ display:'flex', gap:10 }}>
                    {distLeft !== null && (
                      <span style={{ fontSize:11, color:'rgba(255,255,255,0.6)', fontWeight:600 }}>
                        {formatDist(distLeft)} left
                      </span>
                    )}
                    {timeLeft !== null && (
                      <span style={{ fontSize:11, color:color, fontWeight:600 }}>
                        ~{formatTime(timeLeft)}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:2 }}>
                  <div style={{ height:4, width:`${((currentStep+1)/steps.length)*100}%`, background:`linear-gradient(90deg,${color},${color}cc)`, borderRadius:2, transition:'width 0.6s ease' }} />
                </div>
              </div>

              {/* Prev / Next */}
              <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                <button
                  onClick={() => setCurrentStep(s => Math.max(0, s-1))}
                  disabled={currentStep===0}
                  style={{ padding:'7px 10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:currentStep===0?'rgba(255,255,255,0.2)':'rgba(255,255,255,0.7)', cursor:currentStep===0?'default':'pointer', fontSize:12, fontFamily:'inherit' }}
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentStep(s => Math.min(steps.length-1, s+1))}
                  disabled={currentStep===steps.length-1}
                  style={{ padding:'7px 10px', borderRadius:8, border:`1px solid ${color}50`, background:`${color}20`, color:currentStep===steps.length-1?'rgba(255,255,255,0.2)':'#fff', cursor:currentStep===steps.length-1?'default':'pointer', fontSize:12, fontFamily:'inherit', fontWeight:700 }}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}