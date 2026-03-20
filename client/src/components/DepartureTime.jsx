import { useState } from 'react'
import api from '../utils/api'

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`
}))

function getCongestionColor(level) {
  if (level === 'Low')      return { text: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30'  }
  if (level === 'Moderate') return { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' }
  if (level === 'High')     return { text: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' }
  return                           { text: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30'    }
}

function getBarColor(score) {
  if (score >= 7.5) return '#ef4444'
  if (score >= 5.5) return '#f97316'
  if (score >= 3.5) return '#f59e0b'
  return '#22c55e'
}

export default function DepartureTime({ origin, destination, distance }) {
  const now = new Date()
  const [selectedDate, setSelectedDate] = useState(now.toISOString().split('T')[0])
  const [loading,      setLoading]      = useState(false)
  const [predictions,  setPredictions]  = useState(null)
  const [bestHour,     setBestHour]     = useState(null)
  const [expanded,     setExpanded]     = useState(true)

  const analyzeAllHours = async () => {
    if (!origin?.lat || !destination?.lat) return
    setLoading(true)
    setPredictions(null)

    try {
      const date    = new Date(selectedDate)
      const dayOfWk = date.getDay()

      const results = await Promise.all(
        HOURS.map(async ({ value: hour }) => {
          try {
            const res = await api.post('/api/predict', {
              hour,
              dayOfWeek:   dayOfWk,
              month:       date.getMonth() + 1,
              weatherCode: 800,
              temp:        28,
              humidity:    65,
              windSpeed:   5,
              visibility:  10,
              distance:    distance || 20,
              originLat:   origin.lat,
              originLon:   origin.lon,
              destLat:     destination.lat,
              destLon:     destination.lon,
            })
            return { hour, ...res.data }
          } catch {
            return { hour, score: 5, level: 'Moderate' }
          }
        })
      )

      const best = results.reduce((a, b) => a.score < b.score ? a : b)
      setPredictions(results)
      setBestHour(best)
    } catch (err) {
      console.error('Departure time error:', err)
    }
    setLoading(false)
  }

  return (
    <div className="border-t border-dark-700 mt-3">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-dark-700/50"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-300">Best Departure Time</span>
          <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">AI</span>
        </div>
        <span className="text-slate-500 text-xs">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Select date</label>
            <input
              type="date"
              value={selectedDate}
              min={now.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <button
            onClick={analyzeAllHours}
            disabled={loading || !origin?.lat}
            className="btn-primary w-full text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analysing 24 hours...
              </span>
            ) : '🕐 Find Best Time to Leave'}
          </button>

          {!origin?.lat && (
            <p className="text-xs text-slate-500 text-center">Select origin & destination first</p>
          )}

          {bestHour && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
              <div className="text-xs text-green-400 font-bold uppercase tracking-wider mb-1">✅ Best time to leave</div>
              <div className="text-2xl font-black text-white">{HOURS[bestHour.hour].label}</div>
              <div className="text-xs text-slate-400 mt-1">Score: {bestHour.score}/10 — {bestHour.level}</div>
            </div>
          )}

          {predictions && (
            <div>
              <div className="text-xs text-slate-500 mb-2">24-hour congestion forecast</div>
              <div className="flex items-end gap-0.5 h-16 mb-1">
                {predictions.map(({ hour, score }) => (
                  <div key={hour} className="flex-1 flex flex-col items-center justify-end group relative cursor-pointer">
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-dark-700 text-xs text-white px-2 py-1 rounded-lg whitespace-nowrap z-10 border border-dark-600">
                      {HOURS[hour].label}: {score}/10
                    </div>
                    <div
                      style={{
                        height:          `${(score / 10) * 100}%`,
                        backgroundColor: getBarColor(score),
                        opacity:         hour === bestHour?.hour ? 1 : 0.6,
                        borderRadius:    '2px 2px 0 0',
                        border:          hour === bestHour?.hour ? '2px solid #22c55e' : 'none',
                      }}
                      className="w-full min-h-[2px]"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-0.5">
                {predictions.map(({ hour }) => (
                  <div key={hour} className="flex-1 text-center">
                    {hour % 6 === 0 && (
                      <span className="text-slate-600" style={{ fontSize: '9px' }}>
                        {hour === 0 ? '12a' : hour === 6 ? '6a' : hour === 12 ? '12p' : '6p'}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <div className="text-xs text-slate-500 mb-2">Top 3 best times</div>
                <div className="space-y-1.5">
                  {[...predictions].sort((a, b) => a.score - b.score).slice(0, 3).map((p, i) => {
                    const c = getCongestionColor(p.level)
                    return (
                      <div key={p.hour} className={`flex items-center gap-3 rounded-xl p-2.5 border ${c.bg} ${c.border}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          i === 0 ? 'bg-yellow-400 text-yellow-900' :
                          i === 1 ? 'bg-slate-300 text-slate-800' : 'bg-amber-600 text-amber-100'
                        }`}>{i + 1}</div>
                        <div className="flex-1">
                          <div className={`text-sm font-bold ${c.text}`}>{HOURS[p.hour].label}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 h-1.5 bg-dark-700 rounded-full">
                              <div className="h-1.5 rounded-full" style={{ width: `${(p.score/10)*100}%`, backgroundColor: getBarColor(p.score) }} />
                            </div>
                            <span className="text-xs text-slate-400">{p.score}/10</span>
                          </div>
                        </div>
                        <div className={`text-xs font-semibold px-2 py-1 rounded-lg border ${c.bg} ${c.text} ${c.border}`}>{p.level}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-3">
                <div className="text-xs text-slate-500 mb-2">⚠️ Worst times — avoid these</div>
                <div className="flex flex-wrap gap-1.5">
                  {[...predictions].sort((a, b) => b.score - a.score).slice(0, 4).map(p => (
                    <span key={p.hour} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-lg">
                      {HOURS[p.hour].label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}