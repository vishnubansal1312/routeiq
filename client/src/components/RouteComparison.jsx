export default function RouteComparison({ routes, activeRoute, onSelect }) {
  if (!routes || routes.length === 0) return null

  const minDuration = Math.min(...routes.map(r => r.duration))
  const minDistance = Math.min(...routes.map(r => parseFloat(r.distance)))
  const minCost     = Math.min(...routes.map(r => r.tollCost + r.fuelCost))

  const ROUTE_META = {
    fastest:  { color: '#0ea5e9', label: 'Fastest',  icon: '⚡', desc: 'Least travel time' },
    shortest: { color: '#a855f7', label: 'Shortest', icon: '📏', desc: 'Least distance'    },
    eco:      { color: '#22c55e', label: 'Eco',      icon: '🌿', desc: 'Fuel efficient'    },
  }

  return (
    <div className="border-t border-dark-700 pt-4 pb-2">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
        Route Comparison
      </h3>

      <div className="space-y-2">
        {routes.map((route) => {
          const meta      = ROUTE_META[route.key]
          const isActive  = activeRoute === route.key
          const totalCost = route.tollCost + route.fuelCost
          const isBestTime = route.duration === minDuration
          const isBestDist = parseFloat(route.distance) === minDistance
          const isBestCost = totalCost === minCost

          return (
            <div
              key={route.key}
              onClick={() => onSelect(route.key)}
              className="rounded-xl p-3 cursor-pointer transition-all"
              style={{
                border:          isActive ? `2px solid ${meta.color}` : '1px solid #1e293b',
                backgroundColor: isActive ? `${meta.color}15` : '#1e293b',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span className="text-sm font-bold text-white">{meta.label}</span>
                  <span className="text-xs text-slate-500">{meta.desc}</span>
                </div>
                {isActive && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ color: meta.color, backgroundColor: `${meta.color}20` }}>
                    Selected
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className={`rounded-lg p-2 text-center ${isBestTime ? 'bg-green-500/10 border border-green-500/20' : 'bg-dark-800'}`}>
                  <div className="text-xs text-slate-500 mb-0.5">Time</div>
                  <div className="text-sm font-bold text-white">{route.duration}<span className="text-xs text-slate-400 ml-0.5">min</span></div>
                  {isBestTime && <div className="text-xs text-green-400 mt-0.5">✓ fastest</div>}
                  {route.trafficDelay > 0 && <div className="text-xs text-orange-400">+{route.trafficDelay}m</div>}
                </div>

                <div className={`rounded-lg p-2 text-center ${isBestDist ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-dark-800'}`}>
                  <div className="text-xs text-slate-500 mb-0.5">Distance</div>
                  <div className="text-sm font-bold text-white">{route.distance}<span className="text-xs text-slate-400 ml-0.5">km</span></div>
                  {isBestDist && <div className="text-xs text-purple-400 mt-0.5">✓ shortest</div>}
                </div>

                <div className={`rounded-lg p-2 text-center ${isBestCost ? 'bg-green-500/10 border border-green-500/20' : 'bg-dark-800'}`}>
                  <div className="text-xs text-slate-500 mb-0.5">Cost</div>
                  <div className="text-sm font-bold text-white">₹{totalCost}</div>
                  {isBestCost && <div className="text-xs text-green-400 mt-0.5">✓ cheapest</div>}
                </div>
              </div>

              {/* Breakdown */}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-slate-500">🛣 {route.tollCost === 0 ? 'No toll' : `₹${route.tollCost}`}</span>
                <span className="text-xs text-slate-500">⛽ ₹{route.fuelCost}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Color legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-dark-700/50">
        {Object.entries(ROUTE_META).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-4 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
            <span className="text-xs text-slate-500">{meta.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}