import { useState, useEffect } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import api from '../utils/api'

function createHotspotIcon(severity) {
  const color = severity === 'high' ? '#ef4444' : '#f59e0b'
  const size  = severity === 'high' ? 36 : 30
  return new L.DivIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:3px solid white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:${severity === 'high' ? 16 : 14}px;
      box-shadow:0 0 0 4px ${color}40;
      cursor:pointer;
      animation: hotspot-pulse 2s infinite;
    ">&#9888;</div>
    <style>
      @keyframes hotspot-pulse {
        0%,100% { box-shadow: 0 0 0 4px ${color}40; }
        50% { box-shadow: 0 0 0 10px ${color}10; }
      }
    </style>`,
    iconSize:   [size, size],
    iconAnchor: [size/2, size/2],
  })
}

function HotspotsLayer({ enabled }) {
  const map = useMap()
  const [hotspots, setHotspots] = useState([])

  const fetchHotspots = async () => {
    if (!enabled) return
    try {
      const b = map.getBounds()
      const res = await api.get('/api/hotspots', {
        params: {
          minLat: b.getSouth().toFixed(4),
          minLon: b.getWest().toFixed(4),
          maxLat: b.getNorth().toFixed(4),
          maxLon: b.getEast().toFixed(4),
        }
      })
      setHotspots(res.data.hotspots || [])
    } catch { setHotspots([]) }
  }

  useEffect(() => {
    if (!enabled) { setHotspots([]); return }
    fetchHotspots()
    map.on('moveend', fetchHotspots)
    return () => map.off('moveend', fetchHotspots)
  }, [enabled])

  if (!enabled || hotspots.length === 0) return null

  return (
    <>
      {hotspots.map(h => (
        <Marker key={h.id} position={[h.lat, h.lon]} icon={createHotspotIcon(h.severity)}>
          <Popup>
            <div style={{ minWidth: 200 }}>
              <div style={{ fontWeight:'bold', color: h.severity === 'high' ? '#ef4444' : '#f59e0b', marginBottom:6, fontSize:13 }}>
                ⚠️ Accident Hotspot — {h.severity === 'high' ? 'HIGH RISK' : 'MEDIUM RISK'}
              </div>
              <div style={{ fontSize:12, marginBottom:4 }}>
                <strong>📍 {h.city}</strong> — {h.road}
              </div>
              <div style={{ fontSize:11, color:'#94a3b8', marginBottom:4 }}>
                ⚠️ {h.reason}
              </div>
              <div style={{ fontSize:11, color:'#ef4444', fontWeight:'bold' }}>
                🚗 ~{h.accidents_per_year} accidents/year
              </div>
              <div style={{ marginTop:6, padding:'4px 8px', background:'#fef3c7', borderRadius:6, fontSize:11, color:'#92400e' }}>
                Drive carefully through this zone!
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

export { HotspotsLayer }

export default function AccidentHotspots({ enabled, onToggle, count }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full py-2.5 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
        enabled
          ? 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20'
          : 'bg-dark-700 text-slate-400 border-dark-600 hover:bg-dark-600'
      }`}
    >
      <span>⚠️</span>
      {enabled ? `Accident hotspots ON (${count} in view)` : 'Show Accident Hotspots'}
    </button>
  )
}