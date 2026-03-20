import { useState, useEffect } from 'react'
import api from '../utils/api'

const levelColor = {
  Low:      'text-green-400  bg-green-400/10  border-green-400/30',
  Moderate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  High:     'text-orange-400 bg-orange-400/10 border-orange-400/30',
  Severe:   'text-red-400    bg-red-400/10    border-red-400/30',
}

export default function History() {
  const [trips, setTrips]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/trips')
      .then(res => { setTrips(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const deleteTrip = async (id) => {
    try {
      await api.delete(`/api/trips/${id}`)
      setTrips(trips.filter(t => t._id !== id))
    } catch (err) {
      console.error('Delete failed')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-10 h-10 border-4 border-dark-600 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-white mb-2">Trip History</h1>
      <p className="text-slate-400 text-sm mb-8">Your last {trips.length} saved trips</p>

      {trips.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-bold text-white mb-2">No trips yet</h3>
          <p className="text-slate-400 text-sm">Plan a route on the Map page to see it here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip._id} className="card hover:border-dark-600 transition-all">
              <div className="flex items-start justify-between gap-4">

                {/* Route info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-400 bg-primary-400/10 border border-primary-400/20 px-2 py-1 rounded-lg">
                      {trip.routeType}
                    </span>
                    {trip.congestionLevel && (
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg border ${levelColor[trip.congestionLevel]}`}>
                        {trip.congestionLevel}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 ml-auto">
                      {new Date(trip.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></span>
                      <span className="text-sm text-slate-200 truncate">{trip.origin?.label || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></span>
                      <span className="text-sm text-slate-200 truncate">{trip.destination?.label || 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>📍 {trip.distance} km</span>
                    <span>⏱ {trip.duration} min</span>
                    {trip.tollCost > 0 && <span>🛣 Toll: ₹{trip.tollCost}</span>}
                    {trip.fuelCost  > 0 && <span>⛽ Fuel: ₹{trip.fuelCost}</span>}
                    {trip.weather?.temp && <span>🌡 {trip.weather.temp}°C {trip.weather.condition}</span>}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => deleteTrip(trip._id)}
                  className="text-slate-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10 flex-shrink-0"
                  title="Delete trip"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}