export default function CarbonFootprint({ routes, activeRoute }) {
  if (!routes || routes.length === 0) return null

  // CO2 calculation: avg car emits 120g CO2 per km
  // Eco route saves ~15%, Shortest saves ~8%
  const CO2_PER_KM = 0.12 // kg per km

  const getEmissions = (route) => {
    const dist = parseFloat(route.distance)
    const multiplier = route.key === 'eco' ? 0.85 : route.key === 'shortest' ? 0.92 : 1.0
    return (dist * CO2_PER_KM * multiplier).toFixed(2)
  }

  const getTreeEquivalent = (kg) => (parseFloat(kg) / 21.77).toFixed(3)

  const activeRouteData = routes.find(r => r.key === activeRoute)
  const fastestData     = routes.find(r => r.key === 'fastest')

  if (!activeRouteData) return null

  const activeEmissions  = parseFloat(getEmissions(activeRouteData))
  const fastestEmissions = parseFloat(getEmissions(fastestData || activeRouteData))
  const saved            = (fastestEmissions - activeEmissions).toFixed(2)
  const savedPct         = fastestEmissions > 0 ? Math.round((saved / fastestEmissions) * 100) : 0

  const getGreenScore = (key) => key === 'eco' ? 92 : key === 'shortest' ? 78 : 60
  const score = getGreenScore(activeRoute)

  const getScoreColor = (s) => s >= 85 ? '#22c55e' : s >= 70 ? '#f59e0b' : '#ef4444'
  const getScoreLabel = (s) => s >= 85 ? 'Excellent' : s >= 70 ? 'Good' : 'Poor'

  return (
    <div className="border-t border-dark-700 mt-3">
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-bold text-slate-300">Carbon Footprint</span>
          <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
            Eco Score
          </span>
        </div>

        {/* Green score circle */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={getScoreColor(score)} strokeWidth="3"
                strokeDasharray={`${score} ${100 - score}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black" style={{ color: getScoreColor(score) }}>{score}</span>
            </div>
          </div>
          <div>
            <div className="text-lg font-black" style={{ color: getScoreColor(score) }}>
              {getScoreLabel(score)}
            </div>
            <div className="text-xs text-slate-400">Green score for {activeRoute} route</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {activeEmissions} kg CO2 emitted
            </div>
          </div>
        </div>

        {/* CO2 comparison bars */}
        <div className="space-y-2 mb-3">
          {routes.map(route => {
            const emissions = parseFloat(getEmissions(route))
            const maxEmissions = Math.max(...routes.map(r => parseFloat(getEmissions(r))))
            const barWidth = Math.round((emissions / maxEmissions) * 100)
            const color = route.key === 'eco' ? '#22c55e' : route.key === 'shortest' ? '#f59e0b' : '#ef4444'
            const isActive = route.key === activeRoute

            return (
              <div key={route.key} className={`rounded-lg p-2.5 transition-all ${isActive ? 'bg-dark-700' : 'bg-dark-800'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold capitalize ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {route.key === 'fastest' ? '⚡' : route.key === 'shortest' ? '📏' : '🌿'} {route.key}
                  </span>
                  <span className="text-xs font-bold" style={{ color }}>{emissions} kg CO2</span>
                </div>
                <div className="h-1.5 bg-dark-600 rounded-full">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${barWidth}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Savings if using eco */}
        {activeRoute !== 'eco' && parseFloat(saved) > 0 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-3">
            <div className="text-xs text-green-400 font-bold mb-1">
              Switch to Eco route and save:
            </div>
            <div className="text-lg font-black text-green-400">
              {Math.abs(parseFloat((fastestEmissions - parseFloat(getEmissions(routes.find(r => r.key === 'eco') || activeRouteData))).toFixed(2)))} kg CO2
            </div>
            <div className="text-xs text-slate-400 mt-1">
              = {getTreeEquivalent(Math.abs(parseFloat((fastestEmissions - parseFloat(getEmissions(routes.find(r => r.key === 'eco') || activeRouteData))).toFixed(2))))} trees worth of CO2 absorption per day
            </div>
          </div>
        )}

        {/* CO2 facts */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-dark-700 rounded-xl p-2.5 text-center">
            <div className="text-xs text-slate-500 mb-1">Trees needed</div>
            <div className="text-sm font-bold text-white">{getTreeEquivalent(activeEmissions)}</div>
            <div className="text-xs text-slate-500">to offset trip</div>
          </div>
          <div className="bg-dark-700 rounded-xl p-2.5 text-center">
            <div className="text-xs text-slate-500 mb-1">vs Fastest</div>
            <div className="text-sm font-bold" style={{ color: activeRoute === 'fastest' ? '#94a3b8' : '#22c55e' }}>
              {activeRoute === 'fastest' ? '0%' : `${savedPct}% less`}
            </div>
            <div className="text-xs text-slate-500">CO2 saved</div>
          </div>
        </div>
      </div>
    </div>
  )
}