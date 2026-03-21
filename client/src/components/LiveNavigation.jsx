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

function formatDist(meters) {
  if (!meters) return ''
  if (meters >= 1000) return `${(meters/1000).toFixed(1)} km`
  return `${Math.round(meters)} m`
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

export default function LiveNavigation({ instructions, userLocation, totalDistance, totalDuration, onClose }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [voiceOn,     setVoiceOn]     = useState(true)
  const [arrived,     setArrived]     = useState(false)
  const lastSpokenStep = useRef(-1)

  const steps    = instructions || []
  const step     = steps[currentStep]
  const nextStep = steps[currentStep + 1]

  useEffect(() => {
    if (!userLocation || !steps.length) return
    const nearest = findNearestStepIndex(userLocation.lat, userLocation.lon, steps)
    if (nearest > currentStep) setCurrentStep(nearest)
    const lastStep = steps[steps.length - 1]
    if (lastStep?.lat && lastStep?.lon) {
      const dist = calcDistance(userLocation.lat, userLocation.lon, lastStep.lat, lastStep.lon)
      if (dist < 50) setArrived(true)
    }
  }, [userLocation])

  useEffect(() => {
    if (!voiceOn || !step || lastSpokenStep.current === currentStep) return
    if (!window.speechSynthesis) return
    lastSpokenStep.current = currentStep
    window.speechSynthesis.cancel()
    const distText = step.distance ? `In ${formatDist(step.distance)},` : ''
    const msg = new SpeechSynthesisUtterance(`${distText} ${step.instruction || ''}`)
    msg.lang = 'en-IN'
    msg.rate = 0.95
    window.speechSynthesis.speak(msg)
  }, [currentStep, voiceOn])

  const distToNext = userLocation && step?.lat && step?.lon
    ? calcDistance(userLocation.lat, userLocation.lon, step.lat, step.lon)
    : null

  if (!steps.length) return null

  return (
    <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:9998, fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {arrived ? (
        <div style={{ background:'#6d28d9', color:'#fff', padding:'24px', textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🎉</div>
          <div style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>You have arrived!</div>
          <div style={{ fontSize:14, opacity:0.8, marginBottom:16 }}>You reached your destination</div>
          <button onClick={onClose}
            style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', padding:'10px 24px', borderRadius:20, cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:14 }}>
            Done
          </button>
        </div>
      ) : (
        <>
          {/* Next step preview */}
          {nextStep && (
            <div style={{ background:'rgba(74,40,174,0.95)', backdropFilter:'blur(8px)', padding:'8px 20px', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>Then</span>
              <span style={{ fontSize:20 }}>{getIcon(nextStep.instruction)}</span>
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.9)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {nextStep.instruction}
              </span>
              {nextStep.distance && (
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)', flexShrink:0 }}>
                  {formatDist(nextStep.distance)}
                </span>
              )}
            </div>
          )}

          {/* Current step */}
          <div style={{ background:'#1a0f3c', padding:'16px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14 }}>
              {/* Turn icon box */}
              <div style={{ width:60, height:60, borderRadius:16, background:'rgba(109,40,217,0.4)', border:'2px solid rgba(167,139,250,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, flexShrink:0 }}>
                {getIcon(step?.instruction)}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                {distToNext !== null && distToNext < 5000 && (
                  <div style={{ fontSize:30, fontWeight:800, color:'#fff', lineHeight:1, marginBottom:4 }}>
                    {formatDist(distToNext)}
                  </div>
                )}
                <div style={{ fontSize:15, color:'rgba(255,255,255,0.9)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {step?.instruction}
                </div>
                {step?.name && (
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginTop:3 }}>{step.name}</div>
                )}
              </div>

              {/* Voice + Close */}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <button
                  onClick={() => { setVoiceOn(v => !v); if (voiceOn) window.speechSynthesis?.cancel() }}
                  style={{ width:38, height:38, borderRadius:19, border:'1px solid rgba(255,255,255,0.2)', background:voiceOn?'rgba(109,40,217,0.5)':'rgba(255,255,255,0.1)', cursor:'pointer', fontSize:17, display:'flex', alignItems:'center', justifyContent:'center' }}
                  title={voiceOn ? 'Mute voice' : 'Enable voice'}
                >
                  {voiceOn ? '🔊' : '🔇'}
                </button>
                <button
                  onClick={onClose}
                  style={{ width:38, height:38, borderRadius:19, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(239,68,68,0.3)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', color:'#fca5a5' }}
                  title="Stop navigation"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Progress bar + controls */}
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button
                onClick={() => setCurrentStep(s => Math.max(0, s-1))}
                disabled={currentStep === 0}
                style={{ padding:'8px 14px', borderRadius:9, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:currentStep===0?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.8)', cursor:currentStep===0?'default':'pointer', fontSize:13, fontFamily:'inherit' }}
              >
                ← Prev
              </button>

              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Step {currentStep+1}/{steps.length}</span>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{Math.round(totalDistance||0)} km total</span>
                </div>
                <div style={{ height:3, background:'rgba(255,255,255,0.1)', borderRadius:2 }}>
                  <div style={{ height:3, width:`${((currentStep+1)/steps.length)*100}%`, background:'#a78bfa', borderRadius:2, transition:'width 0.5s' }} />
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(s => Math.min(steps.length-1, s+1))}
                disabled={currentStep === steps.length-1}
                style={{ padding:'8px 14px', borderRadius:9, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(109,40,217,0.4)', color:currentStep===steps.length-1?'rgba(255,255,255,0.25)':'#fff', cursor:currentStep===steps.length-1?'default':'pointer', fontSize:13, fontFamily:'inherit', fontWeight:600 }}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}