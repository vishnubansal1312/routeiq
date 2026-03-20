import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import api from '../utils/api'

function createVehicleIcon(type, status) {
  const colors = { moving: '#22c55e', stopped: '#ef4444', idle: '#f59e0b' }
  const color  = colors[status] || '#94a3b8'
  const emoji  = type === 'truck' ? '&#128665;' : '&#128656;'
  return new L.DivIcon({
    className: '',
    html: `<div style="
      width:38px;height:38px;background:${color};
      border:3px solid white;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:18px;box-shadow:0 4px 12px rgba(0,0,0,0.4);
      cursor:pointer;
    ">${emoji}</div>`,
    iconSize: [38,38], iconAnchor: [19,19],
  })
}

function FuelBar({ pct }) {
  const color = pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ flex:1, height:6, background:'#1e293b', borderRadius:3 }}>
        <div style={{ width:`${pct}%`, height:6, background:color, borderRadius:3, transition:'width 0.5s' }} />
      </div>
      <span style={{ fontSize:10, color, minWidth:28 }}>{pct}%</span>
    </div>
  )
}

function ProgressBar({ covered, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((covered / total) * 100)) : 0
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ flex:1, height:6, background:'#1e293b', borderRadius:3 }}>
        <div style={{ width:`${pct}%`, height:6, background:'#0ea5e9', borderRadius:3, transition:'width 0.5s' }} />
      </div>
      <span style={{ fontSize:10, color:'#94a3b8', minWidth:36 }}>{pct}%</span>
    </div>
  )
}

function MapFly({ vehicles, selected }) {
  const map = useMap()
  useEffect(() => {
    if (selected) {
      const v = vehicles.find(v => v.id === selected)
      if (v) map.setView([v.lat, v.lon], 13, { animate: true })
    } else if (vehicles.length > 0) {
      const bounds = L.latLngBounds(vehicles.map(v => [v.lat, v.lon]))
      map.fitBounds(bounds, { padding: [50,50] })
    }
  }, [selected, vehicles])
  return null
}

// Generate realistic demo vehicles
function generateDemoVehicles() {
  const baseVehicles = [
    {
      id: "DL01AB1234", name: "Truck 01", driver: "Rajesh Kumar",
      type: "truck", status: "moving",
      baseLat: 28.6139, baseLon: 77.2090,
      route: "Delhi → Agra", total_distance: 230, eta: "2h 15m",
    },
    {
      id: "MH02CD5678", name: "Van 02", driver: "Suresh Sharma",
      type: "van", status: "stopped",
      baseLat: 19.0760, baseLon: 72.8777,
      route: "Mumbai → Pune", total_distance: 150, eta: "Stopped",
    },
    {
      id: "KA03EF9012", name: "Truck 03", driver: "Mohan Reddy",
      type: "truck", status: "moving",
      baseLat: 12.9716, baseLon: 77.5946,
      route: "Bangalore → Chennai", total_distance: 350, eta: "3h 45m",
    },
    {
      id: "GJ04GH3456", name: "Van 04", driver: "Priya Patel",
      type: "van", status: "idle",
      baseLat: 23.0225, baseLon: 72.5714,
      route: "Ahmedabad Depot", total_distance: 0, eta: "At depot",
    },
    {
      id: "RJ05IJ7890", name: "Truck 05", driver: "Amit Singh",
      type: "truck", status: "moving",
      baseLat: 26.9124, baseLon: 75.7873,
      route: "Jaipur → Delhi", total_distance: 280, eta: "1h 30m",
    },
  ]

  return baseVehicles.map(v => ({
    ...v,
    lat:              v.baseLat + (Math.random() - 0.5) * 0.3,
    lon:              v.baseLon + (Math.random() - 0.5) * 0.3,
    speed:            v.status === 'moving' ? Math.floor(Math.random() * 80 + 20) : 0,
    fuel:             Math.floor(Math.random() * 60 + 20),
    distance_covered: v.total_distance > 0 ? Math.floor(Math.random() * v.total_distance) : 0,
    last_update:      new Date().toISOString(),
  }))
}

export default function Fleet() {
  const [vehicles,   setVehicles]   = useState(generateDemoVehicles())
  const [selected,   setSelected]   = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [showUpgrade, setShowUpgrade] = useState(false)
  const timerRef = useRef(null)

  // Simulate live updates every 10 seconds
  const refresh = () => {
    setVehicles(prev => prev.map(v => ({
      ...v,
      lat:   v.status === 'moving' ? v.lat + (Math.random() - 0.5) * 0.01 : v.lat,
      lon:   v.status === 'moving' ? v.lon + (Math.random() - 0.5) * 0.01 : v.lon,
      speed: v.status === 'moving' ? Math.floor(Math.random() * 80 + 20) : 0,
      fuel:  Math.max(5, v.fuel - Math.random() * 0.5),
      distance_covered: v.status === 'moving'
        ? Math.min(v.total_distance, v.distance_covered + Math.floor(Math.random() * 3))
        : v.distance_covered,
      last_update: new Date().toISOString(),
    })))
    setLastUpdate(new Date())
  }

  useEffect(() => {
    timerRef.current = setInterval(refresh, 10000)
    return () => clearInterval(timerRef.current)
  }, [])

  const moving   = vehicles.filter(v => v.status === 'moving').length
  const stopped  = vehicles.filter(v => v.status === 'stopped').length
  const idle     = vehicles.filter(v => v.status === 'idle').length
  const lowFuel  = vehicles.filter(v => v.fuel < 25).length

  const statusColor = { moving:'#22c55e', stopped:'#ef4444', idle:'#f59e0b' }
  const statusBg    = { moving:'rgba(34,197,94,0.1)', stopped:'rgba(239,68,68,0.1)', idle:'rgba(245,158,11,0.1)' }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 64px)' }}>

      {/* ── DEMO BANNER ── */}
      <div style={{
        background:'linear-gradient(90deg, rgba(168,85,247,0.2), rgba(14,165,233,0.2))',
        borderBottom:'1px solid rgba(168,85,247,0.3)',
        padding:'10px 20px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        flexShrink:0,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ background:'rgba(168,85,247,0.3)', color:'#c084fc', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, border:'1px solid rgba(168,85,247,0.4)' }}>
            DEMO MODE
          </span>
          <span style={{ color:'#94a3b8', fontSize:13 }}>
            Showing simulated fleet data — upgrade to Business plan for real GPS tracking
          </span>
        </div>
        <button
          onClick={() => setShowUpgrade(true)}
          style={{
            background:'#a855f7', color:'white', border:'none',
            borderRadius:8, padding:'6px 16px', fontSize:12,
            fontWeight:700, cursor:'pointer',
          }}
        >
          Upgrade to Business
        </button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* Sidebar */}
        <div style={{ width:320, background:'#0f172a', borderRight:'1px solid #1e293b', display:'flex', flexDirection:'column', overflowY:'auto', flexShrink:0 }}>

          {/* Header stats */}
          <div style={{ padding:16, borderBottom:'1px solid #1e293b' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <h2 style={{ color:'white', fontSize:16, fontWeight:700, margin:0 }}>Fleet Dashboard</h2>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:6, height:6, background:'#22c55e', borderRadius:'50%', display:'inline-block' }} />
                <span style={{ color:'#22c55e', fontSize:11 }}>Live Demo</span>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { label:'Total',    value: vehicles.length, color:'#0ea5e9' },
                { label:'Moving',   value: moving,          color:'#22c55e' },
                { label:'Stopped',  value: stopped,         color:'#ef4444' },
                { label:'Low Fuel', value: lowFuel,         color:'#f59e0b' },
              ].map((s,i) => (
                <div key={i} style={{ background:'#1e293b', borderRadius:10, padding:'10px 12px', border:'1px solid #334155' }}>
                  <div style={{ color:'#64748b', fontSize:10, marginBottom:2 }}>{s.label}</div>
                  <div style={{ color:s.color, fontSize:22, fontWeight:900 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ color:'#475569', fontSize:10, marginTop:8, textAlign:'center' }}>
              Last updated: {lastUpdate.toLocaleTimeString()} · Auto-refresh 10s
            </div>
          </div>

          {/* Vehicle list */}
          <div style={{ padding:12, flex:1 }}>
            <div style={{ color:'#64748b', fontSize:11, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Vehicles ({vehicles.length})
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {vehicles.map(v => (
                <div
                  key={v.id}
                  onClick={() => setSelected(selected === v.id ? null : v.id)}
                  style={{
                    background: selected === v.id ? 'rgba(14,165,233,0.1)' : '#1e293b',
                    border:     selected === v.id ? '1.5px solid #0ea5e9' : '1px solid #334155',
                    borderRadius:12, padding:12, cursor:'pointer', transition:'all 0.2s',
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:20 }}>{v.type === 'truck' ? '🚛' : '🚐'}</span>
                      <div>
                        <div style={{ color:'white', fontSize:13, fontWeight:600 }}>{v.name}</div>
                        <div style={{ color:'#64748b', fontSize:10 }}>{v.driver}</div>
                      </div>
                    </div>
                    <div style={{
                      background: statusBg[v.status], color: statusColor[v.status],
                      fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20,
                      textTransform:'capitalize', border:`1px solid ${statusColor[v.status]}40`,
                    }}>
                      {v.status}
                    </div>
                  </div>

                  <div style={{ color:'#94a3b8', fontSize:11, marginBottom:6 }}>{v.route}</div>

                  <div style={{ display:'flex', gap:12, marginBottom:8 }}>
                    <div>
                      <div style={{ color:'#475569', fontSize:10 }}>Speed</div>
                      <div style={{ color:'white', fontSize:13, fontWeight:700 }}>{Math.round(v.speed)} km/h</div>
                    </div>
                    <div>
                      <div style={{ color:'#475569', fontSize:10 }}>ETA</div>
                      <div style={{ color:'white', fontSize:13, fontWeight:700 }}>{v.eta}</div>
                    </div>
                    <div>
                      <div style={{ color:'#475569', fontSize:10 }}>ID</div>
                      <div style={{ color:'#94a3b8', fontSize:11 }}>{v.id}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom:6 }}>
                    <div style={{ color:'#475569', fontSize:10, marginBottom:3 }}>Fuel level</div>
                    <FuelBar pct={Math.round(v.fuel)} />
                  </div>

                  {v.total_distance > 0 && (
                    <div>
                      <div style={{ color:'#475569', fontSize:10, marginBottom:3 }}>
                        Route progress ({v.distance_covered}/{v.total_distance} km)
                      </div>
                      <ProgressBar covered={v.distance_covered} total={v.total_distance} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map */}
        <div style={{ flex:1, position:'relative' }}>
          <MapContainer center={[22, 78]} zoom={5} style={{ height:'100%', width:'100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            />
            {vehicles.map(v => (
              <Marker
                key={v.id}
                position={[v.lat, v.lon]}
                icon={createVehicleIcon(v.type, v.status)}
                eventHandlers={{ click: () => setSelected(v.id) }}
              >
                <Popup>
                  <div style={{ minWidth:200 }}>
                    <div style={{ fontWeight:'bold', fontSize:14, marginBottom:6 }}>
                      {v.type === 'truck' ? '🚛' : '🚐'} {v.name}
                    </div>
                    <div style={{ fontSize:12, color:'#475569', marginBottom:4 }}>
                      Driver: {v.driver}
                    </div>
                    <div style={{ fontSize:12, marginBottom:4 }}>Route: {v.route}</div>
                    <div style={{ display:'flex', gap:12, marginBottom:6 }}>
                      <span style={{ fontSize:12 }}>Speed: <strong>{Math.round(v.speed)} km/h</strong></span>
                      <span style={{ fontSize:12 }}>ETA: <strong>{v.eta}</strong></span>
                    </div>
                    <div style={{ fontSize:12, marginBottom:4 }}>
                      Fuel:
                      <span style={{ color: v.fuel < 25 ? '#ef4444' : '#22c55e', fontWeight:'bold', marginLeft:4 }}>
                        {Math.round(v.fuel)}%
                      </span>
                      {v.fuel < 25 && <span style={{ color:'#ef4444', marginLeft:4 }}>⚠️ Low!</span>}
                    </div>
                    <div style={{
                      marginTop:6, padding:'4px 10px', borderRadius:6,
                      fontSize:11, fontWeight:700, textAlign:'center',
                      background: statusBg[v.status], color: statusColor[v.status],
                    }}>
                      {v.status.toUpperCase()}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            <MapFly vehicles={vehicles} selected={selected} />
          </MapContainer>

          {/* Refresh button */}
          <button
            onClick={refresh}
            style={{
              position:'absolute', top:16, left:16, zIndex:1000,
              background:'rgba(15,23,42,0.9)', border:'1px solid #334155',
              borderRadius:10, padding:'8px 14px', color:'#94a3b8',
              fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:6,
            }}
          >
            ↻ Refresh
          </button>

          {/* Status legend */}
          <div style={{
            position:'absolute', top:16, right:16, zIndex:1000,
            background:'rgba(15,23,42,0.9)', border:'1px solid #334155',
            borderRadius:12, padding:'12px 16px',
          }}>
            <div style={{ color:'#94a3b8', fontSize:11, fontWeight:600, marginBottom:8 }}>Status</div>
            {[
              { color:'#22c55e', label:'Moving'  },
              { color:'#ef4444', label:'Stopped' },
              { color:'#f59e0b', label:'Idle'    },
            ].map((s,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                <span style={{ width:8, height:8, background:s.color, borderRadius:'50%', display:'inline-block' }} />
                <span style={{ color:'#64748b', fontSize:11 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Low fuel alert */}
          {lowFuel > 0 && (
            <div style={{
              position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)',
              background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)',
              borderRadius:12, padding:'10px 20px', color:'#ef4444',
              fontSize:12, fontWeight:600, zIndex:1000, whiteSpace:'nowrap',
            }}>
              ⚠️ {lowFuel} vehicle{lowFuel > 1 ? 's' : ''} with low fuel — needs refuelling!
            </div>
          )}
        </div>
      </div>

      {/* ── UPGRADE MODAL ── */}
      {showUpgrade && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.8)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:99999, padding:20,
        }}>
          <div style={{
            background:'#0f172a', border:'1px solid #334155',
            borderRadius:24, padding:40, maxWidth:480, width:'100%',
            textAlign:'center',
          }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🚛</div>
            <h2 style={{ color:'white', fontSize:24, fontWeight:900, marginBottom:8 }}>
              Upgrade to Business Plan
            </h2>
            <p style={{ color:'#94a3b8', fontSize:14, marginBottom:24, lineHeight:1.6 }}>
              Get real-time GPS tracking for your entire fleet, live location updates, route analytics, fuel monitoring, and much more.
            </p>

            <div style={{ background:'#1e293b', borderRadius:16, padding:20, marginBottom:24, textAlign:'left' }}>
              <div style={{ color:'#a855f7', fontSize:13, fontWeight:700, marginBottom:12 }}>
                Business Plan — ₹1499/month includes:
              </div>
              {[
                'Live GPS tracking for up to 50 vehicles',
                'Real-time location updates every 5 seconds',
                'Driver performance analytics',
                'Fuel consumption reports',
                'Route deviation alerts',
                'Everything in Pro plan',
                '5 team member accounts',
                '24/7 priority support',
              ].map((f,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <span style={{ color:'#22c55e', fontSize:14 }}>✓</span>
                  <span style={{ color:'#cbd5e1', fontSize:13 }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <button
                onClick={() => setShowUpgrade(false)}
                style={{
                  flex:1, padding:'12px', background:'transparent',
                  border:'1px solid #334155', borderRadius:12,
                  color:'#64748b', fontSize:14, cursor:'pointer',
                }}
              >
                Maybe later
              </button>
              <button
                onClick={() => {
                  setShowUpgrade(false)
                  window.location.href = '/pricing'
                }}
                style={{
                  flex:2, padding:'12px', background:'#a855f7',
                  border:'none', borderRadius:12,
                  color:'white', fontSize:14, fontWeight:700, cursor:'pointer',
                }}
              >
                View Pricing Plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}