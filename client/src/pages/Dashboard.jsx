import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const CONGESTION_COLORS = {
  Low:      { bg:'#f0fdf4', text:'#15803d', dot:'#22c55e', border:'#bbf7d0' },
  Moderate: { bg:'#fefce8', text:'#a16207', dot:'#eab308', border:'#fef08a' },
  High:     { bg:'#fff7ed', text:'#c2410c', dot:'#f97316', border:'#fed7aa' },
  Severe:   { bg:'#fef2f2', text:'#b91c1c', dot:'#ef4444', border:'#fecaca' },
}

const HOUR_LABELS = ['12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p']

function StatCard({ icon, label, value, sub, color = '#6d28d9', trend }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:16, padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ width:40, height:40, borderRadius:12, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
          {icon}
        </div>
        {trend !== undefined && (
          <div style={{ fontSize:12, fontWeight:600, color: trend >= 0 ? '#16a34a' : '#dc2626', background: trend >= 0 ? '#f0fdf4' : '#fef2f2', padding:'3px 8px', borderRadius:20 }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize:28, fontWeight:800, color:'#111', letterSpacing:'-0.5px', lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>{label}</div>
        {sub && <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
      <div style={{ fontSize:12, color:'#6b7280', marginBottom:4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize:13, fontWeight:600, color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [trips,     setTrips]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/api/trips')
        setTrips(res.data.trips || [])
      } catch { setTrips([]) }
      setLoading(false)
    }
    fetch()
  }, [])

  // ── Computed stats ──
  const totalTrips     = trips.length
  const avgScore       = trips.length ? (trips.reduce((s,t) => s + (t.congestionScore||0), 0) / trips.length).toFixed(1) : '0'
  const totalDistance  = trips.reduce((s,t) => s + (parseFloat(t.distance)||0), 0).toFixed(0)
  const totalCost      = trips.reduce((s,t) => s + (t.tollCost||0) + (t.fuelCost||0), 0)
  const savedTrips     = trips.filter(t => t.congestionLevel === 'Low').length

  // Hourly chart data
  const hourlyData = HOUR_LABELS.map((hour, i) => {
    const hourTrips = trips.filter(t => new Date(t.createdAt).getHours() === i)
    const avgCong   = hourTrips.length ? hourTrips.reduce((s,t) => s + (t.congestionScore||5), 0) / hourTrips.length : Math.sin(i/3) * 2 + 5
    return { hour, congestion: parseFloat(avgCong.toFixed(1)), trips: hourTrips.length }
  })

  // Weekly trip data (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date     = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dayTrips = trips.filter(t => {
      const d = new Date(t.createdAt)
      return d.toDateString() === date.toDateString()
    })
    return {
      day:      ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getDay()],
      trips:    dayTrips.length,
      distance: parseFloat(dayTrips.reduce((s,t) => s + (parseFloat(t.distance)||0), 0).toFixed(1)),
    }
  })

  // Congestion distribution
  const congDist = ['Low','Moderate','High','Severe'].map(level => ({
    level,
    count: trips.filter(t => t.congestionLevel === level).length,
    pct:   trips.length ? Math.round(trips.filter(t => t.congestionLevel === level).length / trips.length * 100) : 0,
  }))

  // Recent trips
  const recentTrips = [...trips].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  if (loading) return (
    <div style={{ minHeight:'calc(100vh - 56px)', background:'#f9fafb', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid #e9d5ff', borderTopColor:'#6d28d9', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
        <p style={{ color:'#6b7280', fontSize:14 }}>Loading your dashboard...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'calc(100vh - 56px)', background:'#f9fafb', fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px' }}>

        {/* ── Header ── */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 style={{ fontSize:28, fontWeight:800, color:'#111', letterSpacing:'-0.5px', marginBottom:4 }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize:15, color:'#6b7280' }}>
              Here's your route intelligence overview
            </p>
          </div>
          <Link to="/map">
            <button style={{ background:'#6d28d9', color:'#fff', border:'none', padding:'12px 24px', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontFamily:'inherit' }}>
              <span>🗺️</span> Plan new route
            </button>
          </Link>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display:'flex', gap:4, background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:4, marginBottom:28, width:'fit-content' }}>
          {[['overview','Overview'],['trips','Trip History'],['analytics','Analytics']].map(([id,label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{ padding:'8px 20px', borderRadius:8, border:'none', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s',
                background: activeTab === id ? '#6d28d9' : 'transparent',
                color:      activeTab === id ? '#fff' : '#6b7280',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === 'overview' && (
          <div>
            {/* Stat cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:28 }}>
              <StatCard icon="🗺️" label="Total trips"       value={totalTrips}         sub="All time"                    color="#6d28d9" trend={12} />
              <StatCard icon="📏" label="Total distance"    value={`${totalDistance}km`} sub="Across all trips"           color="#0ea5e9" trend={8}  />
              <StatCard icon="🚦" label="Avg congestion"    value={`${avgScore}/10`}   sub="Lower is better"            color="#f97316"            />
              <StatCard icon="💰" label="Total trip cost"   value={`₹${totalCost.toLocaleString()}`} sub="Toll + fuel"  color="#22c55e" trend={-5} />
            </div>

            {/* Charts row */}
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:24 }}>

              {/* Hourly congestion chart */}
              <div style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:16, padding:'24px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                  <div>
                    <h3 style={{ fontSize:16, fontWeight:700, color:'#111', marginBottom:4 }}>Congestion by hour</h3>
                    <p style={{ fontSize:13, color:'#9ca3af' }}>Average congestion score throughout the day</p>
                  </div>
                  <div style={{ fontSize:11, background:'#f5f3ff', color:'#6d28d9', padding:'4px 10px', borderRadius:20, border:'1px solid #e9d5ff', fontWeight:500 }}>
                    Today
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={hourlyData} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                    <defs>
                      <linearGradient id="congGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6d28d9" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6d28d9" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="hour" tick={{ fontSize:10, fill:'#9ca3af' }} interval={2} />
                    <YAxis domain={[0,10]} tick={{ fontSize:10, fill:'#9ca3af' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="congestion" name="Score" stroke="#6d28d9" strokeWidth={2.5} fill="url(#congGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Congestion distribution */}
              <div style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:16, padding:'24px' }}>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#111', marginBottom:4 }}>Congestion levels</h3>
                <p style={{ fontSize:13, color:'#9ca3af', marginBottom:20 }}>Distribution across all trips</p>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {congDist.map(({ level, count, pct }) => {
                    const c = CONGESTION_COLORS[level]
                    return (
                      <div key={level}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:8, height:8, borderRadius:'50%', background:c.dot }} />
                            <span style={{ fontSize:13, fontWeight:500, color:'#374151' }}>{level}</span>
                          </div>
                          <span style={{ fontSize:12, color:'#6b7280' }}>{count} trips ({pct}%)</span>
                        </div>
                        <div style={{ height:6, background:'#f5f5f5', borderRadius:3 }}>
                          <div style={{ height:6, width:`${pct}%`, background:c.dot, borderRadius:3, transition:'width 1s ease' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                {totalTrips === 0 && (
                  <div style={{ textAlign:'center', padding:'20px 0', color:'#9ca3af', fontSize:13 }}>
                    Plan some routes to see your distribution
                  </div>
                )}
              </div>
            </div>

            {/* Weekly trips bar chart */}
            <div style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:16, padding:'24px', marginBottom:24 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div>
                  <h3 style={{ fontSize:16, fontWeight:700, color:'#111', marginBottom:4 }}>Weekly activity</h3>
                  <p style={{ fontSize:13, color:'#9ca3af' }}>Trips planned in the last 7 days</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weeklyData} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize:12, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill:'#f5f3ff' }} />
                  <Bar dataKey="trips" name="Trips" radius={[6,6,0,0]} maxBarSize={40}>
                    {weeklyData.map((_, i) => (
                      <Cell key={i} fill={i === weeklyData.length - 1 ? '#6d28d9' : '#e9d5ff'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent trips */}
            <div style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:16, padding:'24px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div>
                  <h3 style={{ fontSize:16, fontWeight:700, color:'#111', marginBottom:4 }}>Recent trips</h3>
                  <p style={{ fontSize:13, color:'#9ca3af' }}>Your latest route plans</p>
                </div>
                <button onClick={() => setActiveTab('trips')}
                  style={{ fontSize:13, color:'#6d28d9', background:'#f5f3ff', border:'1px solid #e9d5ff', padding:'6px 14px', borderRadius:8, cursor:'pointer', fontFamily:'inherit', fontWeight:500 }}>
                  View all
                </button>
              </div>

              {recentTrips.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 0' }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>🗺️</div>
                  <p style={{ fontSize:15, fontWeight:600, color:'#374151', marginBottom:8 }}>No trips yet</p>
                  <p style={{ fontSize:14, color:'#9ca3af', marginBottom:20 }}>Plan your first route to see it here</p>
                  <Link to="/map">
                    <button style={{ background:'#6d28d9', color:'#fff', border:'none', padding:'10px 24px', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                      Plan a route →
                    </button>
                  </Link>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {recentTrips.map((trip, i) => {
                    const c   = CONGESTION_COLORS[trip.congestionLevel] || CONGESTION_COLORS.Low
                    const date = new Date(trip.createdAt)
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 16px', background:'#fafafa', borderRadius:12, border:'1px solid #f0f0f0' }}>
                        <div style={{ width:40, height:40, borderRadius:10, background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                          🗺️
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:14, fontWeight:600, color:'#111', marginBottom:3, display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {trip.origin?.label?.split(',')[0]} → {trip.destination?.label?.split(',')[0]}
                            </span>
                          </div>
                          <div style={{ fontSize:12, color:'#9ca3af', display:'flex', alignItems:'center', gap:12 }}>
                            <span>📏 {parseFloat(trip.distance||0).toFixed(0)} km</span>
                            <span>⏱ {Math.round((trip.duration||0)/60)} min</span>
                            <span>💰 ₹{((trip.tollCost||0)+(trip.fuelCost||0)).toLocaleString()}</span>
                          </div>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
                          <div style={{ fontSize:11, fontWeight:600, color:c.text, background:c.bg, border:`1px solid ${c.border}`, padding:'3px 10px', borderRadius:20 }}>
                            {trip.congestionLevel || 'Low'}
                          </div>
                          <div style={{ fontSize:11, color:'#9ca3af' }}>
                            {date.toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TRIPS TAB ══ */}
        {activeTab === 'trips' && (
          <div style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:16, padding:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <div>
                <h3 style={{ fontSize:18, fontWeight:700, color:'#111', marginBottom:4 }}>All trips</h3>
                <p style={{ fontSize:14, color:'#9ca3af' }}>{totalTrips} trips planned total</p>
              </div>
            </div>

            {trips.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 0' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🗺️</div>
                <p style={{ fontSize:16, fontWeight:600, color:'#374151', marginBottom:8 }}>No trips yet</p>
                <p style={{ fontSize:14, color:'#9ca3af', marginBottom:24 }}>Start planning routes to see your trip history here</p>
                <Link to="/map">
                  <button style={{ background:'#6d28d9', color:'#fff', border:'none', padding:'12px 28px', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                    Plan your first route →
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[...trips].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((trip, i) => {
                  const c    = CONGESTION_COLORS[trip.congestionLevel] || CONGESTION_COLORS.Low
                  const date = new Date(trip.createdAt)
                  const cost = (trip.tollCost||0) + (trip.fuelCost||0)
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px', background:'#fafafa', borderRadius:14, border:'1px solid #f0f0f0', transition:'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background='#f5f3ff'}
                      onMouseOut={e  => e.currentTarget.style.background='#fafafa'}
                    >
                      <div style={{ width:44, height:44, borderRadius:12, background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                        {trip.routeType === 'eco' ? '🌿' : trip.routeType === 'shortest' ? '📏' : '⚡'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:600, color:'#111', marginBottom:4 }}>
                          {trip.origin?.label?.split(',')[0]} → {trip.destination?.label?.split(',')[0]}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                          <span style={{ fontSize:12, color:'#6b7280' }}>📏 {parseFloat(trip.distance||0).toFixed(0)} km</span>
                          <span style={{ fontSize:12, color:'#6b7280' }}>⏱ {Math.round((trip.duration||0)/60)} min</span>
                          {cost > 0 && <span style={{ fontSize:12, color:'#6b7280' }}>💰 ₹{cost.toLocaleString()}</span>}
                          <span style={{ fontSize:12, color:'#6b7280', textTransform:'capitalize' }}>🛣️ {trip.routeType || 'fastest'}</span>
                        </div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:c.text, background:c.bg, border:`1px solid ${c.border}`, padding:'3px 10px', borderRadius:20 }}>
                          {trip.congestionLevel || 'Low'}
                        </div>
                        <div style={{ fontSize:11, color:'#9ca3af' }}>
                          {date.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </div>
                        {trip.weather?.temp && (
                          <div style={{ fontSize:11, color:'#9ca3af' }}>🌤️ {trip.weather.temp}°C</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ ANALYTICS TAB ══ */}
        {activeTab === 'analytics' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Top stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
              <StatCard icon="✅" label="Low congestion trips"  value={savedTrips}  sub={`${totalTrips ? Math.round(savedTrips/totalTrips*100) : 0}% of all trips`} color="#22c55e" />
              <StatCard icon="📅" label="Avg trips per week"    value={totalTrips > 0 ? (totalTrips / 4).toFixed(1) : '0'} sub="Last 4 weeks" color="#6d28d9" />
              <StatCard icon="⛽" label="Avg fuel cost"         value={trips.length ? `₹${Math.round(trips.reduce((s,t) => s+(t.fuelCost||0),0)/trips.length).toLocaleString()}` : '₹0'} sub="Per trip" color="#f97316" />
              <StatCard icon="🛣️" label="Avg trip distance"     value={trips.length ? `${(parseFloat(totalDistance)/trips.length).toFixed(0)}km` : '0km'} sub="Per trip" color="#0ea5e9" />
            </div>

            {/* Distance chart */}
            <div style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:16, padding:'24px' }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:'#111', marginBottom:4 }}>Distance per day</h3>
              <p style={{ fontSize:13, color:'#9ca3af', marginBottom:20 }}>Total km driven each day this week</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize:12, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill:'#f5f3ff' }} />
                  <Bar dataKey="distance" name="Distance (km)" radius={[6,6,0,0]} maxBarSize={48}>
                    {weeklyData.map((_, i) => (
                      <Cell key={i} fill={i === weeklyData.length - 1 ? '#0ea5e9' : '#bae6fd'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Route type breakdown */}
            <div style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:16, padding:'24px' }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:'#111', marginBottom:4 }}>Route preferences</h3>
              <p style={{ fontSize:13, color:'#9ca3af', marginBottom:20 }}>Which route type you use most</p>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { type:'fastest',  emoji:'⚡', color:'#0ea5e9', label:'Fastest' },
                  { type:'shortest', emoji:'📏', color:'#a855f7', label:'Shortest' },
                  { type:'eco',      emoji:'🌿', color:'#22c55e', label:'Eco' },
                ].map(({ type, emoji, color, label }) => {
                  const count = trips.filter(t => t.routeType === type).length
                  const pct   = totalTrips ? Math.round(count / totalTrips * 100) : 0
                  return (
                    <div key={type}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:16 }}>{emoji}</span>
                          <span style={{ fontSize:14, fontWeight:500, color:'#374151' }}>{label}</span>
                        </div>
                        <span style={{ fontSize:13, color:'#6b7280' }}>{count} trips ({pct}%)</span>
                      </div>
                      <div style={{ height:8, background:'#f5f5f5', borderRadius:4 }}>
                        <div style={{ height:8, width:`${pct}%`, background:color, borderRadius:4, transition:'width 1s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}