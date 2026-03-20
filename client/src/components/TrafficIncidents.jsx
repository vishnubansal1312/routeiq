import { useState, useEffect } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import api from '../utils/api'

// Incident type to icon/color mapping
function getIncidentMeta(type) {
  const types = {
    0:  { emoji: '⚠️', label: 'Unknown',          color: '#94a3b8' },
    1:  { emoji: '🚗', label: 'Accident',          color: '#ef4444' },
    2:  { emoji: '🚧', label: 'Fog',               color: '#94a3b8' },
    3:  { emoji: '⚠️', label: 'Dangerous',         color: '#f97316' },
    4:  { emoji: '🌧️', label: 'Rain',              color: '#3b82f6' },
    5:  { emoji: '❄️', label: 'Ice',               color: '#06b6d4' },
    6:  { emoji: '🚧', label: 'Jam',               color: '#f59e0b' },
    7:  { emoji: '🛑', label: 'Lane Closed',       color: '#ef4444' },
    8:  { emoji: '🛑', label: 'Road Closed',       color: '#dc2626' },
    9:  { emoji: '🚧', label: 'Road Works',        color: '#f59e0b' },
    10: { emoji: '🌊', label: 'Wind',              color: '#6366f1' },
    11: { emoji: '🚧', label: 'Flooding',          color: '#0ea5e9' },
    14: { emoji: '🚧', label: 'Broken Breakdown',  color: '#f97316' },
  }
  return types[type] || types[0]
}

function createIncidentIcon(type) {
  const meta = getIncidentMeta(type)
  return new L.DivIcon({
    className: '',
    html: `<div style="
      width: 28px; height: 28px;
      background: ${meta.color};
      border: 2px solid white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      cursor: pointer;
    ">${meta.emoji}</div>`,
    iconSize:   [28, 28],
    iconAnchor: [14, 14],
  })
}

function formatDelay(seconds) {
  if (!seconds || seconds <= 0) return 'No delay'
  const mins = Math.round(seconds / 60)
  return `+${mins} min delay`
}

// Inner component that uses the map bounds
function IncidentsLayer({ enabled }) {
  const map = useMap()
  const [incidents, setIncidents] = useState([])
  const [loading,   setLoading]   = useState(false)

  const fetchIncidents = async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const bounds = map.getBounds()
      const res = await api.get('/api/incidents', {
        params: {
          minLat: bounds.getSouth().toFixed(4),
          minLon: bounds.getWest().toFixed(4),
          maxLat: bounds.getNorth().toFixed(4),
          maxLon: bounds.getEast().toFixed(4),
        }
      })
      setIncidents(res.data.incidents || [])
    } catch (err) {
      console.error('Incidents fetch error:', err)
      setIncidents([])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!enabled) { setIncidents([]); return }
    fetchIncidents()
    const handler = () => fetchIncidents()
    map.on('moveend', handler)
    return () => map.off('moveend', handler)
  }, [enabled])

  if (!enabled || incidents.length === 0) return null

  return (
    <>
      {incidents.map((inc, i) => {
        let lat, lon
        if (inc.geometryType === 'Point' && Array.isArray(inc.coords) && inc.coords.length >= 2) {
          lon = inc.coords[0]; lat = inc.coords[1]
        } else if (inc.geometryType === 'LineString' && Array.isArray(inc.coords) && inc.coords.length > 0) {
          const mid = Math.floor(inc.coords.length / 2)
          lon = inc.coords[mid][0]; lat = inc.coords[mid][1]
        } else return null

        if (!lat || !lon || isNaN(lat) || isNaN(lon)) return null

        const meta = getIncidentMeta(inc.type)
        return (
          <Marker key={`${inc.id}-${i}`} position={[lat, lon]} icon={createIncidentIcon(inc.type)}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4, color: meta.color }}>
                  {meta.emoji} {meta.label}
                </div>
                <div style={{ fontSize: 12, marginBottom: 4 }}>{inc.description}</div>
                {inc.from && <div style={{ fontSize: 11, color: '#94a3b8' }}>From: {inc.from}</div>}
                {inc.to   && <div style={{ fontSize: 11, color: '#94a3b8' }}>To: {inc.to}</div>}
                <div style={{ fontSize: 11, marginTop: 4, color: inc.delay > 0 ? '#f97316' : '#22c55e' }}>
                  {formatDelay(inc.delay)}
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

export default function TrafficIncidents({ enabled, onToggle, incidentCount, onCountChange }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full py-2.5 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
          enabled
            ? 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20'
            : 'bg-dark-700 text-slate-400 border-dark-600 hover:bg-dark-600'
        }`}
      >
        <span>🚧</span>
        {enabled ? `Live incidents ON (${incidentCount} found)` : 'Show Live Traffic Incidents'}
      </button>
    </div>
  )
}

export { IncidentsLayer }