import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

const CONGESTION_COLORS = {
  Low:      { bg:'#f0fdf4', text:'#15803d', border:'#bbf7d0' },
  Moderate: { bg:'#fefce8', text:'#a16207', border:'#fef08a' },
  High:     { bg:'#fff7ed', text:'#c2410c', border:'#fed7aa' },
  Severe:   { bg:'#fef2f2', text:'#b91c1c', border:'#fecaca' },
}

const ROUTE_ICONS = { fastest:'⚡', shortest:'📏', eco:'🌿' }

export default function History() {
  const [trips,   setTrips]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { fetchTrips() }, [])

  const fetchTrips = async () => {
    try {
      const res = await api.get('/api/trips')
      setTrips(res.data.trips || [])
    } catch { setTrips([]) }
    setLoading(false)
  }

  const deleteTrip = async (id) => {
    setDeleting(id)
    try {
      await api.delete(`/api/trips/${id}`)
      setTrips(t => t.filter(x => x._id !== id))
    } catch {}
    setDeleting(null)
  }

  const filtered = trips
    .filter(t => filter === 'all' || t.routeType === filter)
    .filter(t => {
      if (!search) return true
      const q = search.toLowerCase()
      return t.origin?.label?.toLowerCase().includes(q) ||
             t.destination?.label?.toLowerCase().includes(q)
    })
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))

  const totalDistance = trips.reduce((s,t) => s + (parseFloat(t.distance)||0), 0).toFixed(0)
  const totalCost     = trips.reduce((s,t) => s + (t.tollCost||0) + (t.fuelCost||0), 0)

  if (loading) return (
    <div style={{ minHeight:'calc(100vh-56px)', background:'#f9fafb', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid #e9d5ff', borderTopColor:'#6d28d9', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'calc(100vh - 56px)', background:'#f9fafb', fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .trip-card { transition: all 0.2s; }
        .trip-card:hover { background: #f5f3ff !important; border-color: #e9d5ff !important; }
        .del-btn { opacity:0; transition:opacity 0.2s; }
        .trip-card:hover .del-btn { opacity:1; }
        .filter-btn { transition:all 0.2s; }
      `}</style>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 24px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 style={{ fontSize:28, fontWeight:800, color:'#111', letterSpacing:'-0.5px', marginBottom:4 }}>Trip History</h1>
            <p style={{ fontSize:15, color:'#6b7280' }}>All your planned routes in one place</p>
          </div>
          <Link to="/map">
            <button style={{ background:'#6d28d9', color:'#fff', border:'none', padding:'12px 24px', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8 }}>
              <span>🗺️</span> Plan new route
            </button>
          </Link>
        </div>

        {/* Summary strip */}
        {trips.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
            {[
              { icon:'🗺️', value: trips.length,             label:'Total trips'    },
              { icon:'📏', value: `${totalDistance}km`,      label:'Total distance' },
              { icon:'💰', value: `₹${totalCost.toLocaleString()}`, label:'Total spent' },
              { icon:'✅', value: trips.filter(t=>t.congestionLevel==='Low').length, label:'Low traffic trips' },
            ].map((s,i) => (
              <div key={i} style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:14, padding:'16px 18px', animation:`fadeUp 0.5s ease ${i*0.08}s both` }}>
                <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontSize:22, fontWeight:800, color:'#111', letterSpacing:'-0.5px' }}>{s.value}</div>
                <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search + filters */}
        <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:220, position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16, color:'#9ca3af' }}>🔍</span>
            <input
              type="text"
              placeholder="Search by origin or destination..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width:'100%', padding:'10px 14px 10px 40px', border:'1px solid #e5e7eb', borderRadius:10, fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', color:'#111', boxSizing:'border-box' }}
            />
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {[['all','All'],['fastest','⚡ Fastest'],['shortest','📏 Shortest'],['eco','🌿 Eco']].map(([val,label]) => (
              <button key={val} onClick={() => setFilter(val)} className="filter-btn"
                style={{ padding:'10px 16px', borderRadius:10, border:'1px solid', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                  background: filter === val ? '#6d28d9' : '#fff',
                  color:      filter === val ? '#fff'    : '#6b7280',
                  borderColor: filter === val ? '#6d28d9' : '#e5e7eb',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Trip list */}
        {trips.length === 0 ? (
          <div style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:20, padding:'80px 40px', textAlign:'center' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🗺️</div>
            <h3 style={{ fontSize:20, fontWeight:700, color:'#111', marginBottom:8 }}>No trips yet</h3>
            <p style={{ fontSize:15, color:'#9ca3af', marginBottom:28, maxWidth:320, margin:'0 auto 28px' }}>
              Plan your first route to start building your trip history
            </p>
            <Link to="/map">
              <button style={{ background:'#6d28d9', color:'#fff', border:'none', padding:'12px 32px', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                Plan a route →
              </button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:20, padding:'60px 40px', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:'#111', marginBottom:8 }}>No results found</h3>
            <p style={{ fontSize:14, color:'#9ca3af' }}>Try a different search term or filter</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtered.map((trip, i) => {
              const c    = CONGESTION_COLORS[trip.congestionLevel] || CONGESTION_COLORS.Low
              const date = new Date(trip.createdAt)
              const cost = (trip.tollCost||0) + (trip.fuelCost||0)
              const icon = ROUTE_ICONS[trip.routeType] || '⚡'
              return (
                <div key={trip._id || i} className="trip-card"
                  style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:16, padding:'18px 20px', display:'flex', alignItems:'center', gap:16, animation:`fadeUp 0.4s ease ${i*0.05}s both` }}>

                  {/* Route icon */}
                  <div style={{ width:48, height:48, borderRadius:14, background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                    {icon}
                  </div>

                  {/* Main info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:'#111', marginBottom:5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {trip.origin?.label?.split(',')[0]} → {trip.destination?.label?.split(',')[0]}
                    </div>
                    <div style={{ fontSize:12, color:'#6b7280', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                      <span>📏 {parseFloat(trip.distance||0).toFixed(0)} km</span>
                      <span>⏱ {Math.round((trip.duration||0)/60)} min</span>
                      {cost > 0 && <span>💰 ₹{cost.toLocaleString()}</span>}
                      {trip.weather?.temp && <span>🌤️ {trip.weather.temp}°C</span>}
                      <span style={{ textTransform:'capitalize' }}>🛣️ {trip.routeType || 'fastest'}</span>
                    </div>
                  </div>

                  {/* Right side */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8, flexShrink:0 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:c.text, background:c.bg, border:`1px solid ${c.border}`, padding:'3px 10px', borderRadius:20 }}>
                      {trip.congestionLevel || 'Low'}
                    </div>
                    <div style={{ fontSize:12, color:'#9ca3af' }}>
                      {date.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </div>
                    <button
                      className="del-btn"
                      onClick={() => deleteTrip(trip._id)}
                      disabled={deleting === trip._id}
                      style={{ fontSize:11, color:'#ef4444', background:'#fef2f2', border:'1px solid #fecaca', padding:'3px 10px', borderRadius:8, cursor:'pointer', fontFamily:'inherit' }}
                    >
                      {deleting === trip._id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer count */}
        {filtered.length > 0 && (
          <div style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#9ca3af' }}>
            Showing {filtered.length} of {trips.length} trips
          </div>
        )}
      </div>
    </div>
  )
}