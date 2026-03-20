import { useState } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import api from '../utils/api'

const CATEGORIES = [
  { key: 'petrol',   label: 'Petrol',     emoji: '⛽', color: '#f59e0b' },
  { key: 'hospital', label: 'Hospital',   emoji: '🏥', color: '#ef4444' },
  { key: 'food',     label: 'Food',       emoji: '🍽️', color: '#f97316' },
  { key: 'atm',      label: 'ATM',        emoji: '🏧', color: '#22c55e' },
  { key: 'police',   label: 'Police',     emoji: '👮', color: '#3b82f6' },
  { key: 'parking',  label: 'Parking',    emoji: '🅿️', color: '#8b5cf6' },
]

function createPlaceIcon(emoji, color) {
  return new L.DivIcon({
    className: '',
    html: `<div style="width:30px;height:30px;background:${color};border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer;">${emoji}</div>`,
    iconSize: [30,30], iconAnchor: [15,15],
  })
}

export function PlacesLayer({ places }) {
  if (!places || places.length === 0) return null
  return (
    <>
      {places.map((place, i) => {
        const cat = CATEGORIES.find(c => c.key === place._category) || CATEGORIES[0]
        return (
          <Marker key={`${place.id}-${i}`} position={[place.lat, place.lon]} icon={createPlaceIcon(cat.emoji, cat.color)}>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{cat.emoji} {place.name}</div>
                {place.address && <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{place.address}</div>}
                {place.distance && <div style={{ fontSize: 11, color: '#0ea5e9' }}>📍 {place.distance < 1000 ? `${place.distance}m` : `${(place.distance/1000).toFixed(1)}km`} away</div>}
                {place.phone && <div style={{ fontSize: 11, color: '#22c55e', marginTop: 2 }}>📞 {place.phone}</div>}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

export default function PlacesAlongRoute({ routePoints, onPlacesChange }) {
  const [activeCategory, setActiveCategory] = useState(null)
  const [places,         setPlaces]         = useState([])
  const [loading,        setLoading]        = useState(false)
  const [expanded,       setExpanded]       = useState(true)

  const fetchPlaces = async (categoryKey) => {
    if (!routePoints || routePoints.length === 0) return
    if (activeCategory === categoryKey) {
      setActiveCategory(null); setPlaces([]); onPlacesChange?.([]); return
    }
    setLoading(true); setActiveCategory(categoryKey)
    try {
      const samplePoints = routePoints.filter((_, i) => i % 20 === 0).slice(0, 5)
      const allResults = await Promise.all(
        samplePoints.map(([lat, lon]) =>
          api.get('/api/places', { params: { lat, lon, category: categoryKey, radius: 3000 } })
            .then(r => r.data.places.map(p => ({ ...p, _category: categoryKey })))
            .catch(() => [])
        )
      )
      const seen = new Set()
      const unique = allResults.flat().filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true })
      setPlaces(unique); onPlacesChange?.(unique)
    } catch (err) {
      console.error('Places error:', err); setPlaces([])
    }
    setLoading(false)
  }

  return (
    <div className="border-t border-dark-700 mt-3">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-dark-700/50" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-300">Places Along Route</span>
          {places.length > 0 && (
            <span className="text-xs bg-primary-500/20 text-primary-400 border border-primary-500/30 px-2 py-0.5 rounded-full">{places.length}</span>
          )}
        </div>
        <span className="text-slate-500 text-xs">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          {!routePoints?.length && (
            <p className="text-xs text-slate-500 text-center mb-3">Get a route first</p>
          )}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => fetchPlaces(cat.key)}
                disabled={loading || !routePoints?.length}
                className="py-2.5 px-2 text-xs font-semibold rounded-xl border transition-all flex flex-col items-center gap-1 disabled:opacity-40"
                style={activeCategory === cat.key ? {
                  backgroundColor: `${cat.color}20`, borderColor: cat.color, color: cat.color, borderWidth: 2
                } : { backgroundColor: '#1e293b', borderColor: '#334155', color: '#94a3b8' }}
              >
                <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-400">
              <div className="w-4 h-4 border-2 border-dark-600 border-t-primary-500 rounded-full animate-spin" />
              Searching...
            </div>
          )}

          {!loading && places.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {places.slice(0, 8).map((place, i) => {
                const cat = CATEGORIES.find(c => c.key === place._category) || CATEGORIES[0]
                return (
                  <div key={i} className="bg-dark-700 rounded-xl p-3 border border-dark-600">
                    <div className="flex items-start gap-2">
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{cat.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{place.name}</div>
                        {place.address && <div className="text-xs text-slate-500 truncate mt-0.5">{place.address}</div>}
                        {place.distance && (
                          <span className="text-xs text-primary-400">
                            📍 {place.distance < 1000 ? `${place.distance}m` : `${(place.distance/1000).toFixed(1)}km`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && activeCategory && places.length === 0 && (
            <div className="text-center py-4 text-xs text-slate-500">
              No {CATEGORIES.find(c => c.key === activeCategory)?.label} found nearby
            </div>
          )}
        </div>
      )}
    </div>
  )
}