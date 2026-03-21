import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'

function createVehicleIcon(type, status) {
  const colors = { moving:'#22c55e', stopped:'#ef4444', idle:'#f59e0b' }
  const color  = colors[status] || '#94a3b8'
  const emoji  = type === 'truck' ? '&#128665;' : '&#128656;'
  return new L.DivIcon({
    className: '',
    html: `<div style="width:36px;height:36px;background:${color};border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 4px 12px rgba(0,0,0,0.2);cursor:pointer;">${emoji}</div>`,
    iconSize: [36,36], iconAnchor: [18,18],
  })
}

function FuelBar({ pct }) {
  const color = pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ flex:1, height:5, background:'#f0f0f0', borderRadius:3 }}>
        <div style={{ width:`${pct}%`, height:5, background:color, borderRadius:3, transition:'width 0.5s' }} />
      </div>
      <span style={{ fontSize:10, color, minWidth:28, fontWeight:600 }}>{Math.round(pct)}%</span>
    </div>
  )
}

function ProgressBar({ covered, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((covered/total)*100)) : 0
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ flex:1, height:5, background:'#f0f0f0', borderRadius:3 }}>
        <div style={{ width:`${pct}%`, height:5, background:'#6d28d9', borderRadius:3, transition:'width 0.5s' }} />
      </div>
      <span style={{ fontSize:10, color:'#9ca3af', minWidth:36, fontWeight:500 }}>{pct}%</span>
    </div>
  )
}

function MapFly({ vehicles, selected }) {
  const map = useMap()
  useEffect(() => {
    if (selected) {
      const v = vehicles.find(v => v.id === selected)
      if (v) map.setView([v.lat, v.lon], 13, { animate:true })
    } else if (vehicles.length > 0) {
      const bounds = L.latLngBounds(vehicles.map(v => [v.lat, v.lon]))
      map.fitBounds(bounds, { padding:[50,50] })
    }
  }, [selected, vehicles])
  return null
}

function generateDemoVehicles() {
  const base = [
    { id:'DL01AB1234', name:'Truck 01', driver:'Rajesh Kumar',  type:'truck', status:'moving',  baseLat:28.6139, baseLon:77.2090, route:'Delhi → Agra',          total_distance:230, eta:'2h 15m' },
    { id:'MH02CD5678', name:'Van 02',   driver:'Suresh Sharma', type:'van',   status:'stopped', baseLat:19.0760, baseLon:72.8777, route:'Mumbai → Pune',          total_distance:150, eta:'Stopped' },
    { id:'KA03EF9012', name:'Truck 03', driver:'Mohan Reddy',   type:'truck', status:'moving',  baseLat:12.9716, baseLon:77.5946, route:'Bangalore → Chennai',    total_distance:350, eta:'3h 45m' },
    { id:'GJ04GH3456', name:'Van 04',   driver:'Priya Patel',   type:'van',   status:'idle',    baseLat:23.0225, baseLon:72.5714, route:'Ahmedabad Depot',         total_distance:0,   eta:'At depot' },
    { id:'RJ05IJ7890', name:'Truck 05', driver:'Amit Singh',    type:'truck', status:'moving',  baseLat:26.9124, baseLon:75.7873, route:'Jaipur → Delhi',          total_distance:280, eta:'1h 30m' },
  ]
  return base.map(v => ({
    ...v,
    lat:              v.baseLat + (Math.random()-0.5)*0.3,
    lon:              v.baseLon + (Math.random()-0.5)*0.3,
    speed:            v.status==='moving' ? Math.floor(Math.random()*80+20) : 0,
    fuel:             Math.floor(Math.random()*60+20),
    distance_covered: v.total_distance > 0 ? Math.floor(Math.random()*v.total_distance) : 0,
    last_update:      new Date().toISOString(),
  }))
}

export default function Fleet() {
  const [vehicles,    setVehicles]    = useState(generateDemoVehicles())
  const [selected,    setSelected]    = useState(null)
  const [lastUpdate,  setLastUpdate]  = useState(new Date())
  const [showUpgrade, setShowUpgrade] = useState(false)
  const timerRef = useRef(null)

  const refresh = () => {
    setVehicles(prev => prev.map(v => ({
      ...v,
      lat:   v.status==='moving' ? v.lat+(Math.random()-0.5)*0.01 : v.lat,
      lon:   v.status==='moving' ? v.lon+(Math.random()-0.5)*0.01 : v.lon,
      speed: v.status==='moving' ? Math.floor(Math.random()*80+20) : 0,
      fuel:  Math.max(5, v.fuel-Math.random()*0.5),
      distance_covered: v.status==='moving' ? Math.min(v.total_distance, v.distance_covered+Math.floor(Math.random()*3)) : v.distance_covered,
      last_update: new Date().toISOString(),
    })))
    setLastUpdate(new Date())
  }

  useEffect(() => {
    timerRef.current = setInterval(refresh, 10000)
    return () => clearInterval(timerRef.current)
  }, [])

  const moving  = vehicles.filter(v => v.status==='moving').length
  const stopped = vehicles.filter(v => v.status==='stopped').length
  const idle    = vehicles.filter(v => v.status==='idle').length
  const lowFuel = vehicles.filter(v => v.fuel < 25).length

  const statusColor = { moving:'#22c55e', stopped:'#ef4444', idle:'#f59e0b' }
  const statusBg    = { moving:'#f0fdf4',  stopped:'#fef2f2',  idle:'#fefce8'  }
  const statusBorder= { moving:'#bbf7d0',  stopped:'#fecaca',  idle:'#fef08a'  }
  const statusText  = { moving:'#15803d',  stopped:'#b91c1c',  idle:'#a16207'  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 56px)', fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* ── DEMO BANNER ── */}
      <div style={{ background:'#faf5ff', borderBottom:'1px solid #e9d5ff', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ background:'#6d28d9', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>
            DEMO MODE
          </span>
          <span style={{ color:'#6b7280', fontSize:13 }}>
            Showing simulated fleet data — upgrade to Business plan for real GPS tracking
          </span>
        </div>
        <button
          onClick={() => setShowUpgrade(true)}
          style={{ background:'#6d28d9', color:'white', border:'none', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}
        >
          Upgrade to Business
        </button>
      </div>

      {/* ── MAIN ── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* Sidebar */}
        <div style={{ width:320, background:'#fff', borderRight:'1px solid #f0f0f0', display:'flex', flexDirection:'column', overflowY:'auto', flexShrink:0 }}>

          {/* Header */}
          <div style={{ padding:'16px', borderBottom:'1px solid #f0f0f0' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <h2 style={{ color:'#111', fontSize:16, fontWeight:700, margin:0 }}>Fleet Dashboard</h2>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:6, height:6, background:'#22c55e', borderRadius:'50%', display:'inline-block', animation:'pulse-dot 2s infinite' }} />
                <span style={{ color:'#22c55e', fontSize:11, fontWeight:600 }}>Live Demo</span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { label:'Total',    value:vehicles.length, color:'#6d28d9' },
                { label:'Moving',   value:moving,          color:'#22c55e' },
                { label:'Stopped',  value:stopped,         color:'#ef4444' },
                { label:'Low Fuel', value:lowFuel,         color:'#f59e0b' },
              ].map((s,i) => (
                <div key={i} style={{ background:'#f9fafb', borderRadius:10, padding:'10px 12px', border:'1px solid #f0f0f0' }}>
                  <div style={{ color:'#9ca3af', fontSize:10, marginBottom:2, fontWeight:500 }}>{s.label}</div>
                  <div style={{ color:s.color, fontSize:22, fontWeight:800 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ color:'#9ca3af', fontSize:10, marginTop:8, textAlign:'center' }}>
              Last updated: {lastUpdate.toLocaleTimeString()} · Auto-refresh 10s
            </div>
          </div>

          {/* Vehicle list */}
          <div style={{ padding:12, flex:1 }}>
            <div style={{ color:'#9ca3af', fontSize:11, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>
              Vehicles ({vehicles.length})
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {vehicles.map(v => (
                <div
                  key={v.id}
                  onClick={() => setSelected(selected===v.id ? null : v.id)}
                  style={{
                    background: selected===v.id ? '#f5f3ff' : '#fff',
                    border:     selected===v.id ? '1.5px solid #6d28d9' : '1px solid #f0f0f0',
                    borderRadius:12, padding:12, cursor:'pointer', transition:'all 0.2s',
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:20 }}>{v.type==='truck'?'🚛':'🚐'}</span>
                      <div>
                        <div style={{ color:'#111', fontSize:13, fontWeight:600 }}>{v.name}</div>
                        <div style={{ color:'#9ca3af', fontSize:10 }}>{v.driver}</div>
                      </div>
                    </div>
                    <div style={{ background:statusBg[v.status], color:statusText[v.status], border:`1px solid ${statusBorder[v.status]}`, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, textTransform:'capitalize' }}>
                      {v.status}
                    </div>
                  </div>

                  <div style={{ color:'#6b7280', fontSize:11, marginBottom:6 }}>{v.route}</div>

                  <div style={{ display:'flex', gap:12, marginBottom:8 }}>
                    <div>
                      <div style={{ color:'#9ca3af', fontSize:10 }}>Speed</div>
                      <div style={{ color:'#111', fontSize:13, fontWeight:700 }}>{Math.round(v.speed)} km/h</div>
                    </div>
                    <div>
                      <div style={{ color:'#9ca3af', fontSize:10 }}>ETA</div>
                      <div style={{ color:'#111', fontSize:13, fontWeight:700 }}>{v.eta}</div>
                    </div>
                    <div>
                      <div style={{ color:'#9ca3af', fontSize:10 }}>ID</div>
                      <div style={{ color:'#6b7280', fontSize:11 }}>{v.id}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom:6 }}>
                    <div style={{ color:'#9ca3af', fontSize:10, marginBottom:3 }}>Fuel level</div>
                    <FuelBar pct={Math.round(v.fuel)} />
                  </div>

                  {v.total_distance > 0 && (
                    <div>
                      <div style={{ color:'#9ca3af', fontSize:10, marginBottom:3 }}>
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
          <MapContainer center={[22,78]} zoom={5} style={{ height:'100%', width:'100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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
                  <div style={{ minWidth:200, fontFamily:'sans-serif' }}>
                    <div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>
                      {v.type==='truck'?'🚛':'🚐'} {v.name}
                    </div>
                    <div style={{ fontSize:12, color:'#6b7280', marginBottom:4 }}>Driver: {v.driver}</div>
                    <div style={{ fontSize:12, marginBottom:4 }}>Route: {v.route}</div>
                    <div style={{ display:'flex', gap:12, marginBottom:6 }}>
                      <span style={{ fontSize:12 }}>Speed: <strong>{Math.round(v.speed)} km/h</strong></span>
                      <span style={{ fontSize:12 }}>ETA: <strong>{v.eta}</strong></span>
                    </div>
                    <div style={{ fontSize:12 }}>
                      Fuel: <strong style={{ color:v.fuel<25?'#ef4444':'#22c55e' }}>{Math.round(v.fuel)}%</strong>
                      {v.fuel<25 && <span style={{ color:'#ef4444', marginLeft:4 }}>⚠️ Low!</span>}
                    </div>
                    <div style={{ marginTop:8, padding:'4px 10px', borderRadius:6, fontSize:11, fontWeight:700, textAlign:'center', background:statusBg[v.status], color:statusText[v.status], border:`1px solid ${statusBorder[v.status]}` }}>
                      {v.status.toUpperCase()}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            <MapFly vehicles={vehicles} selected={selected} />
          </MapContainer>

          {/* Refresh */}
          <button onClick={refresh}
            style={{ position:'absolute', top:16, left:16, zIndex:1000, background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'8px 14px', color:'#374151', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:500, display:'flex', alignItems:'center', gap:6, boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
            ↻ Refresh
          </button>

          {/* Legend */}
          <div style={{ position:'absolute', top:16, right:16, zIndex:1000, background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'14px 16px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ color:'#374151', fontSize:12, fontWeight:600, marginBottom:10 }}>Vehicle status</div>
            {[{color:'#22c55e',label:'Moving'},{color:'#ef4444',label:'Stopped'},{color:'#f59e0b',label:'Idle'}].map((s,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span style={{ width:8, height:8, background:s.color, borderRadius:'50%', display:'inline-block' }} />
                <span style={{ color:'#6b7280', fontSize:12 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Low fuel alert */}
          {lowFuel > 0 && (
            <div style={{ position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, padding:'10px 20px', color:'#b91c1c', fontSize:12, fontWeight:600, zIndex:1000, whiteSpace:'nowrap', boxShadow:'0 4px 16px rgba(239,68,68,0.15)' }}>
              ⚠️ {lowFuel} vehicle{lowFuel>1?'s':''} with low fuel — needs refuelling!
            </div>
          )}
        </div>
      </div>

      {/* ── UPGRADE MODAL ── */}
      {showUpgrade && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999, padding:20 }}>
          <div style={{ background:'#fff', borderRadius:24, padding:40, maxWidth:480, width:'100%', textAlign:'center', boxShadow:'0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🚛</div>
            <h2 style={{ color:'#111', fontSize:24, fontWeight:800, marginBottom:8, letterSpacing:'-0.5px' }}>
              Upgrade to Business Plan
            </h2>
            <p style={{ color:'#6b7280', fontSize:14, marginBottom:24, lineHeight:1.7 }}>
              Get real-time GPS tracking for your entire fleet, live location updates, route analytics, fuel monitoring and much more.
            </p>

            <div style={{ background:'#f9fafb', borderRadius:16, padding:20, marginBottom:24, textAlign:'left', border:'1px solid #f0f0f0' }}>
              <div style={{ color:'#6d28d9', fontSize:13, fontWeight:700, marginBottom:12 }}>
                Business Plan — ₹1,499/month includes:
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
                  <span style={{ color:'#22c55e', fontSize:14, flexShrink:0 }}>✓</span>
                  <span style={{ color:'#374151', fontSize:13 }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => setShowUpgrade(false)}
                style={{ flex:1, padding:'12px', background:'transparent', border:'1px solid #e5e7eb', borderRadius:12, color:'#6b7280', fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>
                Maybe later
              </button>
              <Link to="/pricing" style={{ flex:2, textDecoration:'none' }}>
                <button onClick={() => setShowUpgrade(false)}
                  style={{ width:'100%', padding:'12px', background:'#6d28d9', border:'none', borderRadius:12, color:'white', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                  View Pricing Plans →
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}