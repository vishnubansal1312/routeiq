import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import api from '../utils/api'
import Directions        from '../components/Directions'
import RouteComparison   from '../components/RouteComparison'
import DepartureTime     from '../components/DepartureTime'
import TrafficIncidents, { IncidentsLayer } from '../components/TrafficIncidents'
import PlacesAlongRoute, { PlacesLayer }    from '../components/PlacesAlongRoute'
import ChatAssistant     from '../components/ChatAssistant'
import CarbonFootprint   from '../components/CarbonFootprint'
import AccidentHotspots, { HotspotsLayer } from '../components/AccidentHotspots'
import LiveSharing, { SharedUsersLayer }    from '../components/LiveSharing'
import LiveNavigation    from '../components/LiveNavigation'

const TOMTOM_KEY = 'hZ6CdVAUab6mNAKFG7tL2fuJiqoZzCQL'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const greenIcon = new L.Icon({
  iconUrl:   'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:[25,41], iconAnchor:[12,41], popupAnchor:[1,-34],
})
const redIcon = new L.Icon({
  iconUrl:   'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:[25,41], iconAnchor:[12,41], popupAnchor:[1,-34],
})
const liveIcon = new L.DivIcon({
  className:'',
  html:`<div style="width:18px;height:18px;background:#6d28d9;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(109,40,217,0.3);animation:pulse-gps 1.5s infinite"></div>
  <style>@keyframes pulse-gps{0%{box-shadow:0 0 0 0 rgba(109,40,217,0.4)}100%{box-shadow:0 0 0 14px rgba(0,0,0,0)}}</style>`,
  iconSize:[18,18], iconAnchor:[9,9],
})

const ROUTE_COLORS = { fastest:'#6d28d9', shortest:'#0ea5e9', eco:'#22c55e' }
const CONGESTION_STYLES = {
  Low:      { bg:'#f0fdf4', text:'#15803d', border:'#bbf7d0' },
  Moderate: { bg:'#fefce8', text:'#a16207', border:'#fef08a' },
  High:     { bg:'#fff7ed', text:'#c2410c', border:'#fed7aa' },
  Severe:   { bg:'#fef2f2', text:'#b91c1c', border:'#fecaca' },
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return isMobile
}

function FlyToRoutes({ allRoutes }) {
  const map = useMap()
  useEffect(() => {
    if (!allRoutes?.length) return
    const pts = allRoutes.flatMap(r => r.points)
    if (pts.length > 0) map.fitBounds(L.latLngBounds(pts), { padding:[60,60] })
  }, [allRoutes])
  return null
}

function FollowUser({ position, follow, navMode }) {
  const map = useMap()
  useEffect(() => {
    if (!position || !follow) return
    map.setView([position.lat, position.lon], navMode ? 17 : Math.max(map.getZoom(), 15), { animate:true, duration:0.5 })
  }, [position, follow])
  return null
}

function SearchBox({ label, placeholder, value, onChange, onSelect }) {
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [showDrop, setShowDrop] = useState(false)
  const timerRef = useRef(null)
  const wrapRef  = useRef(null)

  useEffect(() => {
    const fn = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleInput = (e) => {
    const val = e.target.value
    onChange(val)
    clearTimeout(timerRef.current)
    if (val.length < 2) { setResults([]); setShowDrop(false); return }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      try {
        const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(val)}.json?key=${TOMTOM_KEY}&limit=7&countrySet=IN&language=en-GB&typeahead=true`
        const res  = await fetch(url)
        const data = await res.json()
        const items = (data.results || [])
          .filter(r => r.address && r.position)
          .map(r => ({
            label: r.address.freeformAddress || r.poi?.name || r.address.municipality || val,
            lat:   r.position.lat,
            lon:   r.position.lon,
            city:  r.address.municipality || r.address.countrySubdivision || '',
          }))
        setResults(items); setShowDrop(items.length > 0)
      } catch { setResults([]) }
      setLoading(false)
    }, 350)
  }

  const handleSelect = (item) => {
    onChange(item.label); onSelect(item); setShowDrop(false); setResults([])
  }

  return (
    <div ref={wrapRef} style={{ position:'relative' }}>
      {label && <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#6b7280', marginBottom:5 }}>{label}</label>}
      <div style={{ position:'relative' }}>
        <input
          type="text" value={value} onChange={handleInput} placeholder={placeholder}
          autoComplete="off"
          style={{ width:'100%', padding:'10px 36px 10px 12px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, fontFamily:'inherit', outline:'none', color:'#111', background:'#fff', boxSizing:'border-box', transition:'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor='#6d28d9'}
          onBlur={e  => e.target.style.borderColor='#e5e7eb'}
        />
        {loading && (
          <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}>
            <div style={{ width:14, height:14, border:'2px solid #e9d5ff', borderTopColor:'#6d28d9', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          </div>
        )}
      </div>
      {showDrop && results.length > 0 && (
        <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', zIndex:99999, overflow:'hidden' }}>
          {results.map((r,i) => (
            <div key={i} onMouseDown={() => handleSelect(r)}
              style={{ padding:'10px 12px', cursor:'pointer', borderBottom:i<results.length-1?'1px solid #f9fafb':'none' }}
              onMouseOver={e => e.currentTarget.style.background='#faf5ff'}
              onMouseOut={e  => e.currentTarget.style.background='#fff'}
            >
              <div style={{ fontSize:13, color:'#111', fontWeight:500 }}>{r.label}</div>
              {r.city && <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{r.city}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MapPage() {
  const isMobile = useIsMobile()
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [origin,        setOrigin]        = useState({ label:'', lat:null, lon:null })
  const [dest,          setDest]          = useState({ label:'', lat:null, lon:null })
  const [activeRoute,   setActiveRoute]   = useState('fastest')
  const [allRoutes,     setAllRoutes]     = useState([])
  const [weather,       setWeather]       = useState(null)
  const [congestion,    setCongestion]    = useState(null)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')
  const [tripSaved,     setTripSaved]     = useState(false)
  const [compareMode,   setCompareMode]   = useState(true)
  const [showIncidents, setShowIncidents] = useState(false)
  const [incidentCount, setIncidentCount] = useState(0)
  const [showHotspots,  setShowHotspots]  = useState(false)
  const [routePlaces,   setRoutePlaces]   = useState([])
  const [sharedUsers,   setSharedUsers]   = useState({})
  const [userLocation,  setUserLocation]  = useState(null)
  const [tracking,      setTracking]      = useState(false)
  const [followUser,    setFollowUser]    = useState(false)
  const [locationError, setLocationError] = useState('')
  const [locating,      setLocating]      = useState(false)
  const [navMode,       setNavMode]       = useState(false)
  const watchIdRef = useRef(null)

  // On desktop sidebar is always open
  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  const activeRouteData = allRoutes.find(r => r.key === activeRoute) || null

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setError('GPS not supported'); return }
    setLocating(true)
    setOrigin(o => ({ ...o, label:'Getting your location...' }))
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude:lat, longitude:lon } = pos.coords
        try {
          const res  = await fetch(`https://api.tomtom.com/search/2/reverseGeocode/${lat},${lon}.json?key=${TOMTOM_KEY}&language=en-GB`)
          const data = await res.json()
          const addr = data.addresses?.[0]?.address
          setOrigin({ label: addr?.freeformAddress || `${lat.toFixed(4)}, ${lon.toFixed(4)}`, lat, lon })
        } catch {
          setOrigin({ label:`${lat.toFixed(4)}, ${lon.toFixed(4)}`, lat, lon })
        }
        setLocating(false)
      },
      () => { setOrigin({ label:'', lat:null, lon:null }); setError('Location access denied'); setLocating(false) },
      { enableHighAccuracy:true, timeout:10000 }
    )
  }

  const startTracking = () => {
    setLocationError('')
    if (!navigator.geolocation) { setLocationError('GPS not supported'); return }
    setTracking(true); setFollowUser(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setUserLocation({ lat:pos.coords.latitude, lon:pos.coords.longitude }),
      () => { setLocationError('Location denied'); setTracking(false) },
      { enableHighAccuracy:true, maximumAge:2000, timeout:10000 }
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
    setTracking(false); setFollowUser(false); setUserLocation(null)
  }

  useEffect(() => () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
  }, [])

  const handleGetRoute = async () => {
    if (!origin.lat || !dest.lat) { setError('Please select both origin and destination from the dropdown'); return }
    setLoading(true); setError(''); setAllRoutes([]); setWeather(null); setCongestion(null); setTripSaved(false); setNavMode(false)
    try {
      const [routesRes, weatherRes] = await Promise.all([
        api.get('/api/routes/all', { params:{ originLat:origin.lat, originLon:origin.lon, destLat:dest.lat, destLon:dest.lon } }),
        api.get('/api/weather', { params:{ lat:dest.lat, lon:dest.lon } })
      ])
      setAllRoutes(routesRes.data.routes)
      setWeather(weatherRes.data)
      const fastest = routesRes.data.routes.find(r => r.key==='fastest') || routesRes.data.routes[0]
      const now = new Date()
      const predRes = await api.post('/api/predict', {
        hour:now.getHours(), dayOfWeek:now.getDay(), month:now.getMonth()+1,
        weatherCode:800, temp:weatherRes.data.temp||30, humidity:weatherRes.data.humidity||60,
        windSpeed:weatherRes.data.windSpeed||5, visibility:10, distance:parseFloat(fastest.distance),
        originLat:origin.lat, originLon:origin.lon, destLat:dest.lat, destLon:dest.lon,
      })
      setCongestion(predRes.data)
      await api.post('/api/trips', {
        origin:{ label:origin.label, lat:origin.lat, lon:origin.lon },
        destination:{ label:dest.label, lat:dest.lat, lon:dest.lon },
        routeType:activeRoute, distance:parseFloat(fastest.distance), duration:fastest.duration,
        congestionScore:predRes.data.score, congestionLevel:predRes.data.level,
        weather:{ temp:weatherRes.data.temp, condition:weatherRes.data.condition, icon:weatherRes.data.icon },
        tollCost:fastest.tollCost, fuelCost:fastest.fuelCost,
      })
      setTripSaved(true)
      if (isMobile) setSidebarOpen(false)
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to get routes. Try again.')
    }
    setLoading(false)
  }

  const startNavigation = () => {
    startTracking(); setNavMode(true); setFollowUser(true); setCompareMode(false)
    if (isMobile) setSidebarOpen(false)
  }

  const stopNavigation = () => {
    setNavMode(false); setCompareMode(true); stopTracking()
  }

  // Sidebar component
  const Sidebar = (
    <div style={{
      width: isMobile ? '100%' : 300,
      height: '100%',
      background:'#fff',
      borderRight: isMobile ? 'none' : '1px solid #f0f0f0',
      display:'flex', flexDirection:'column', overflowY:'auto',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ padding:'14px 16px', borderBottom:'1px solid #f5f5f5', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:24, height:24, background:'#6d28d9', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:10, fontWeight:800 }}>IQ</div>
          <span style={{ fontSize:13, fontWeight:700, color:'#374151' }}>Plan Your Route</span>
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} style={{ background:'none', border:'none', color:'#9ca3af', cursor:'pointer', fontSize:20, padding:'2px 6px', lineHeight:1 }}>✕</button>
        )}
      </div>

      <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14, overflowY:'auto', flex:1 }}>

        {/* Origin */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
            <label style={{ fontSize:12, fontWeight:500, color:'#6b7280' }}>Origin</label>
            <button onClick={useCurrentLocation} disabled={locating}
              style={{ fontSize:11, color:'#6d28d9', background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600, display:'flex', alignItems:'center', gap:4, opacity:locating?0.6:1 }}>
              {locating
                ? <><div style={{ width:10, height:10, border:'1.5px solid #e9d5ff', borderTopColor:'#6d28d9', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /><span>Locating...</span></>
                : <><span>📍</span><span>My location</span></>
              }
            </button>
          </div>
          <SearchBox label="" placeholder="e.g. Connaught Place, Delhi"
            value={origin.label}
            onChange={(v) => setOrigin(o => ({ ...o, label:v }))}
            onSelect={(item) => setOrigin({ label:item.label, lat:item.lat, lon:item.lon })}
          />
        </div>

        {/* Destination */}
        <SearchBox label="Destination" placeholder="e.g. Taj Mahal, Agra"
          value={dest.label}
          onChange={(v) => setDest(d => ({ ...d, label:v }))}
          onSelect={(item) => setDest({ label:item.label, lat:item.lat, lon:item.lon })}
        />

        {/* Display mode */}
        <div>
          <label style={{ fontSize:12, fontWeight:500, color:'#6b7280', display:'block', marginBottom:6 }}>Display mode</label>
          <div style={{ display:'flex', gap:6 }}>
            {[['true','⚖️ Compare 3'],['false','🗺️ Single']].map(([val,label]) => (
              <button key={val} onClick={() => setCompareMode(val==='true')}
                style={{ flex:1, padding:'8px 4px', borderRadius:9, border:`1.5px solid ${compareMode===(val==='true')?'#6d28d9':'#e5e7eb'}`, background:compareMode===(val==='true')?'#f5f3ff':'#fff', color:compareMode===(val==='true')?'#6d28d9':'#6b7280', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Route type */}
        {!compareMode && (
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:'#6b7280', display:'block', marginBottom:6 }}>Route type</label>
            <div style={{ display:'flex', gap:6 }}>
              {[['fastest','⚡ Fast'],['shortest','📏 Short'],['eco','🌿 Eco']].map(([type,label]) => (
                <button key={type} onClick={() => setActiveRoute(type)}
                  style={{ flex:1, padding:'7px 4px', borderRadius:9, border:`1.5px solid ${activeRoute===type?'#6d28d9':'#e5e7eb'}`, background:activeRoute===type?'#f5f3ff':'#fff', color:activeRoute===type?'#6d28d9':'#6b7280', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Map layers */}
        <div>
          <label style={{ fontSize:12, fontWeight:500, color:'#6b7280', display:'block', marginBottom:6 }}>Map layers</label>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {[
              { active:showIncidents, toggle:() => setShowIncidents(s=>!s), icon:'🚧', label:showIncidents?`Live incidents ON (${incidentCount})`:'Live traffic incidents' },
              { active:showHotspots,  toggle:() => setShowHotspots(s=>!s),  icon:'⚠️', label:showHotspots?'Hotspots ON':'Accident hotspots' },
            ].map((btn,i) => (
              <button key={i} onClick={btn.toggle}
                style={{ width:'100%', padding:'9px 12px', borderRadius:9, border:`1px solid ${btn.active?'#6d28d9':'#e5e7eb'}`, background:btn.active?'#f5f3ff':'#fff', color:btn.active?'#6d28d9':'#374151', fontSize:12, fontWeight:btn.active?600:500, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8, transition:'all 0.15s', textAlign:'left' }}>
                <span>{btn.icon}</span>{btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live GPS */}
        <div>
          <label style={{ fontSize:12, fontWeight:500, color:'#6b7280', display:'block', marginBottom:6 }}>Live GPS</label>
          {!tracking ? (
            <button onClick={startTracking}
              style={{ width:'100%', padding:'9px 12px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8, transition:'all 0.15s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor='#6d28d9'; e.currentTarget.style.color='#6d28d9' }}
              onMouseOut={e  => { e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.color='#374151' }}
            >
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />
              Start live GPS
            </button>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:9 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />
                  <span style={{ fontSize:12, color:'#15803d', fontWeight:600 }}>GPS Active</span>
                </div>
                {userLocation && <span style={{ fontSize:10, color:'#6b7280', fontFamily:'monospace' }}>{userLocation.lat.toFixed(3)}, {userLocation.lon.toFixed(3)}</span>}
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => setFollowUser(f => !f)}
                  style={{ flex:1, padding:'7px', borderRadius:9, border:`1.5px solid ${followUser?'#6d28d9':'#e5e7eb'}`, background:followUser?'#f5f3ff':'#fff', color:followUser?'#6d28d9':'#6b7280', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  {followUser ? '📍 Following' : '📍 Follow'}
                </button>
                <button onClick={stopTracking}
                  style={{ flex:1, padding:'7px', borderRadius:9, border:'1px solid #fecaca', background:'#fef2f2', color:'#b91c1c', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  Stop GPS
                </button>
              </div>
            </div>
          )}
          {locationError && <div style={{ fontSize:11, color:'#b91c1c', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'7px 10px', marginTop:6 }}>{locationError}</div>}
        </div>

        {error && <div style={{ fontSize:12, color:'#b91c1c', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:9, padding:'10px 12px' }}>{error}</div>}

        {/* Get Routes */}
        <button onClick={handleGetRoute} disabled={loading}
          style={{ width:'100%', padding:'13px', borderRadius:12, border:'none', background:'#6d28d9', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:loading?0.8:1, boxShadow:'0 4px 12px rgba(109,40,217,0.3)' }}>
          {loading ? (
            <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} />
              Fetching routes...
            </span>
          ) : '🗺️ Get All Routes'}
        </button>

        {tripSaved && (
          <div style={{ fontSize:12, color:'#15803d', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:9, padding:'9px 12px', textAlign:'center', fontWeight:500 }}>
            ✅ Trip saved to history
          </div>
        )}

        {/* Start Navigation */}
        {allRoutes.length > 0 && !navMode && (
          <button onClick={startNavigation}
            style={{ width:'100%', padding:'13px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#1a0f3c,#6d28d9)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(109,40,217,0.4)' }}>
            <span style={{ fontSize:18 }}>🧭</span> Start Navigation
          </button>
        )}

        {navMode && (
          <button onClick={stopNavigation}
            style={{ width:'100%', padding:'12px', borderRadius:12, border:'1px solid #fecaca', background:'#fef2f2', color:'#b91c1c', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            ✕ Stop Navigation
          </button>
        )}

        {/* Route results */}
        {allRoutes.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <RouteComparison routes={allRoutes} activeRoute={activeRoute} onSelect={setActiveRoute} />

            {congestion && (() => {
              const s = CONGESTION_STYLES[congestion.level] || CONGESTION_STYLES.Low
              return (
                <div style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:12, padding:'12px 14px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:s.text, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Congestion Level</div>
                  <div style={{ fontSize:24, fontWeight:800, color:s.text }}>{congestion.level}</div>
                  <div style={{ fontSize:11, color:s.text, opacity:0.75, marginTop:2 }}>Score: {congestion.score}/10</div>
                </div>
              )
            })()}

            {weather && (
              <div style={{ background:'#f9fafb', border:'1px solid #f0f0f0', borderRadius:12, padding:'12px 14px' }}>
                <div style={{ fontSize:11, fontWeight:600, color:'#9ca3af', marginBottom:8 }}>Weather at destination</div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.condition} style={{ width:44, height:44 }} />
                  <div>
                    <div style={{ fontSize:20, fontWeight:800, color:'#111' }}>{weather.temp}°C</div>
                    <div style={{ fontSize:12, color:'#6b7280', textTransform:'capitalize' }}>{weather.description}</div>
                    <div style={{ fontSize:11, color:'#9ca3af' }}>Humidity {weather.humidity}% · Wind {weather.windSpeed}m/s</div>
                  </div>
                </div>
              </div>
            )}

            <CarbonFootprint routes={allRoutes} activeRoute={activeRoute} />
            <DepartureTime origin={origin} destination={dest} distance={activeRouteData ? parseFloat(activeRouteData.distance) : 20} />
            <PlacesAlongRoute routePoints={activeRouteData?.points || []} onPlacesChange={setRoutePlaces} />
            <LiveSharing userLocation={userLocation} routeContext={{ destination:dest.label }} />

            {activeRouteData?.instructions?.length > 0 && !navMode && (
              <Directions
                instructions={activeRouteData.instructions}
                totalDistance={activeRouteData.distance}
                totalDuration={activeRouteData.duration}
                userLocation={userLocation}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', height:'calc(100vh - 56px)', position:'relative', overflow:'hidden', fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Desktop sidebar — always visible */}
      {!isMobile && Sidebar}

      {/* Mobile sidebar — overlay */}
      {isMobile && sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)}
            style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', zIndex:9998 }} />
          <div style={{ position:'absolute', left:0, top:0, height:'100%', width:'85%', maxWidth:320, zIndex:9999, overflowY:'auto' }}>
            {Sidebar}
          </div>
        </>
      )}

      {/* MAP */}
      <div style={{ flex:1, position:'relative', minWidth:0 }}>

        {/* Mobile search button */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ position:'absolute', top:12, left:12, zIndex:1000, background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'10px 16px', color:'#374151', fontSize:13, cursor:'pointer', fontFamily:'inherit', fontWeight:600, display:'flex', alignItems:'center', gap:8, boxShadow:'0 2px 12px rgba(0,0,0,0.12)' }}
          >
            <span>☰</span>
            <span style={{ color:'#6d28d9' }}>Search Route</span>
          </button>
        )}

        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height:'100%', width:'100%' }}>
          {navMode ? (
            <TileLayer key="light" url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CARTO' maxZoom={20} />
          ) : (
            <TileLayer key="dark" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CARTO' />
          )}

          {origin.lat && <Marker position={[origin.lat, origin.lon]} icon={greenIcon}><Popup><strong>{origin.label}</strong><br/>Origin</Popup></Marker>}
          {dest.lat   && <Marker position={[dest.lat,   dest.lon]}   icon={redIcon}  ><Popup><strong>{dest.label}</strong><br/>Destination</Popup></Marker>}

          {compareMode
            ? allRoutes.map(route => (
                <Polyline key={route.key} positions={route.points} color={ROUTE_COLORS[route.key]}
                  weight={activeRoute===route.key?6:3} opacity={activeRoute===route.key?0.95:0.5}
                  eventHandlers={{ click:() => setActiveRoute(route.key) }} />
              ))
            : activeRouteData && <Polyline positions={activeRouteData.points} color={ROUTE_COLORS[activeRoute]} weight={6} opacity={0.92} />
          }

          {allRoutes.length > 0 && <FlyToRoutes allRoutes={allRoutes} />}

          {userLocation && (
            <>
              <Marker position={[userLocation.lat, userLocation.lon]} icon={liveIcon}><Popup><strong>You are here</strong></Popup></Marker>
              <Circle center={[userLocation.lat, userLocation.lon]} radius={50} pathOptions={{ color:'#6d28d9', fillColor:'#6d28d9', fillOpacity:0.12, weight:1.5 }} />
              <FollowUser position={userLocation} follow={followUser} navMode={navMode} />
            </>
          )}

          <IncidentsLayer enabled={showIncidents} />
          <HotspotsLayer  enabled={showHotspots}  />
          <PlacesLayer    places={routePlaces}     />
          <SharedUsersLayer users={sharedUsers}    />
        </MapContainer>

        {/* Nav mode indicator */}
        {navMode && (
          <div style={{ position:'absolute', top:16, left:'50%', transform:'translateX(-50%)', zIndex:1000, background:'#6d28d9', color:'#fff', padding:'8px 20px', borderRadius:24, fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 16px rgba(109,40,217,0.4)', whiteSpace:'nowrap' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#a78bfa', display:'inline-block', animation:'pulse-dot 1s infinite' }} />
            Navigation Active
          </div>
        )}

        {/* Route legend */}
        {compareMode && allRoutes.length > 0 && !navMode && (
          <div style={{ position:'absolute', top:16, right:16, zIndex:1000, background:'rgba(255,255,255,0.96)', backdropFilter:'blur(8px)', border:'1px solid #e5e7eb', borderRadius:14, padding:'14px 16px', boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#9ca3af', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>Routes</div>
            {[{key:'fastest',color:'#6d28d9',label:'⚡ Fastest'},{key:'shortest',color:'#0ea5e9',label:'📏 Shortest'},{key:'eco',color:'#22c55e',label:'🌿 Eco'}].map(r => (
              <div key={r.key} onClick={() => setActiveRoute(r.key)}
                style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7, cursor:'pointer', opacity:activeRoute===r.key?1:0.5 }}>
                <div style={{ width:20, height:3, borderRadius:2, background:r.color }} />
                <span style={{ fontSize:12, fontWeight:activeRoute===r.key?700:500, color:activeRoute===r.key?'#111':'#6b7280' }}>{r.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom hint */}
        {allRoutes.length === 0 && !loading && (
          <div style={{ position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)', background:'rgba(255,255,255,0.96)', border:'1px solid #e5e7eb', borderRadius:20, padding:'10px 20px', fontSize:13, color:'#6b7280', pointerEvents:'none', whiteSpace:'nowrap', boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
            {isMobile ? 'Tap ☰ to search your route' : 'Enter origin and destination to get routes'}
          </div>
        )}

        {/* Re-center */}
        {tracking && !followUser && !navMode && (
          <button onClick={() => setFollowUser(true)}
            style={{ position:'absolute', bottom:80, right:16, zIndex:1000, background:'#6d28d9', color:'#fff', border:'none', padding:'10px 18px', borderRadius:12, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 16px rgba(109,40,217,0.35)' }}>
            Re-center
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.75)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9997 }}>
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:20, padding:'28px 36px', textAlign:'center', boxShadow:'0 16px 48px rgba(0,0,0,0.12)' }}>
              <div style={{ width:44, height:44, border:'3px solid #e9d5ff', borderTopColor:'#6d28d9', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 14px' }} />
              <p style={{ color:'#111', fontWeight:700, fontSize:15, marginBottom:4 }}>Fetching all 3 routes...</p>
              <p style={{ color:'#9ca3af', fontSize:12 }}>Fastest · Shortest · Eco</p>
            </div>
          </div>
        )}

        {/* Live Navigation */}
        {navMode && activeRouteData?.instructions?.length > 0 && (
          <LiveNavigation
            instructions={activeRouteData.instructions}
            userLocation={userLocation}
            totalDistance={activeRouteData.distance}
            totalDuration={activeRouteData.duration}
            onClose={stopNavigation}
            onZoomRequest={() => setFollowUser(true)}
          />
        )}

        {/* AI Chat */}
        <ChatAssistant
          routeContext={{
            origin:origin.label, destination:dest.label,
            destLat:dest.lat, destLon:dest.lon,
            distance:activeRouteData?.distance, duration:activeRouteData?.duration,
            tollCost:activeRouteData?.tollCost, fuelCost:activeRouteData?.fuelCost,
            congestionLevel:congestion?.level, congestionScore:congestion?.score,
            weather, activeRoute,
          }}
        />
      </div>
    </div>
  )
}