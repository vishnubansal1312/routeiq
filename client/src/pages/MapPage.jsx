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
  iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34],
})
const redIcon = new L.Icon({
  iconUrl:   'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34],
})
const liveIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:18px;height:18px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,0.3);animation:pulse-gps 1.5s infinite"></div>
  <style>@keyframes pulse-gps{0%{box-shadow:0 0 0 0 rgba(59,130,246,0.4)}100%{box-shadow:0 0 0 12px rgba(59,130,246,0)}}</style>`,
  iconSize: [18,18], iconAnchor: [9,9],
})

const ROUTE_COLORS = { fastest: '#0ea5e9', shortest: '#a855f7', eco: '#22c55e' }
const congestionColor = {
  Low:      'text-green-400  bg-green-400/10  border-green-400/30',
  Moderate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  High:     'text-orange-400 bg-orange-400/10 border-orange-400/30',
  Severe:   'text-red-400    bg-red-400/10    border-red-400/30',
}

function FlyToRoutes({ allRoutes }) {
  const map = useMap()
  useEffect(() => {
    if (!allRoutes?.length) return
    const pts = allRoutes.flatMap(r => r.points)
    if (pts.length > 0) map.fitBounds(L.latLngBounds(pts), { padding: [50,50] })
  }, [allRoutes])
  return null
}

function FollowUser({ position, follow }) {
  const map = useMap()
  useEffect(() => {
    if (position && follow)
      map.setView([position.lat, position.lon], Math.max(map.getZoom(), 15), { animate: true })
  }, [position, follow])
  return null
}

function SearchBox({ label, placeholder, value, onChange, onSelect }) {
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [showDrop, setShowDrop] = useState(false)
  const timerRef = useRef(null)
  const wrapRef  = useRef(null)

  useEffect(() => {
    const fn = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false)
    }
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
        const response = await fetch(url)
        const data = await response.json()
        const items = (data.results || [])
          .filter(r => r.address && r.position)
          .map(r => ({
            label: r.address.freeformAddress || r.poi?.name || r.address.municipality || val,
            lat:   r.position.lat,
            lon:   r.position.lon,
            city:  r.address.municipality || r.address.countrySubdivision || '',
          }))
        setResults(items)
        setShowDrop(items.length > 0)
      } catch (err) {
        console.error('Autocomplete error:', err)
        setResults([])
      }
      setLoading(false)
    }, 350)
  }

  const handleSelect = (item) => {
    onChange(item.label)
    onSelect(item)
    setShowDrop(false)
    setResults([])
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      {label && <label className="text-xs text-slate-500 mb-1 block">{label}</label>}
      <div className="relative">
        <input
          type="text" value={value} onChange={handleInput}
          placeholder={placeholder}
          className="input-field pr-10 text-sm" autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-dark-600 border-t-primary-500 rounded-full animate-spin" />
          </div>
        )}
      </div>
      {showDrop && results.length > 0 && (
        <div className="autocomplete-dropdown">
          {results.map((r, i) => (
            <div key={i} className="autocomplete-item" onMouseDown={() => handleSelect(r)}>
              <div className="text-slate-200 text-sm">{r.label}</div>
              {r.city && <div className="text-slate-500 text-xs mt-0.5">{r.city}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MapPage() {
  const [origin, setOrigin]               = useState({ label:'', lat:null, lon:null })
  const [dest, setDest]                   = useState({ label:'', lat:null, lon:null })
  const [activeRoute, setActiveRoute]     = useState('fastest')
  const [allRoutes, setAllRoutes]         = useState([])
  const [weather, setWeather]             = useState(null)
  const [congestion, setCongestion]       = useState(null)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [tripSaved, setTripSaved]         = useState(false)
  const [compareMode, setCompareMode]     = useState(true)
  const [showIncidents, setShowIncidents] = useState(false)
  const [incidentCount, setIncidentCount] = useState(0)
  const [showHotspots, setShowHotspots]   = useState(false)
  const [hotspotCount, setHotspotCount]   = useState(0)
  const [routePlaces, setRoutePlaces]     = useState([])
  const [sharedUsers, setSharedUsers]     = useState({})
  const [userLocation, setUserLocation]   = useState(null)
  const [tracking, setTracking]           = useState(false)
  const [followUser, setFollowUser]       = useState(false)
  const [locationError, setLocationError] = useState('')
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [locating, setLocating]           = useState(false)
  const watchIdRef = useRef(null)

  const activeRouteData = allRoutes.find(r => r.key === activeRoute) || null

  // ── Use current location for origin ──
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('GPS not supported on this device')
      return
    }
    setLocating(true)
    setOrigin(o => ({ ...o, label: 'Getting your location...' }))

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        try {
          const url = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lon}.json?key=${TOMTOM_KEY}&language=en-GB`
          const res  = await fetch(url)
          const data = await res.json()
          const addr = data.addresses?.[0]?.address
          const label = addr?.freeformAddress
            || addr?.municipality
            || `${lat.toFixed(4)}, ${lon.toFixed(4)}`
          setOrigin({ label, lat, lon })
        } catch {
          setOrigin({
            label: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
            lat, lon,
          })
        }
        setLocating(false)
      },
      () => {
        setOrigin({ label: '', lat: null, lon: null })
        setError('Location access denied. Please allow GPS.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const startTracking = () => {
    setLocationError('')
    if (!navigator.geolocation) { setLocationError('GPS not supported'); return }
    setTracking(true); setFollowUser(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => { setLocationError('Location denied — please allow GPS'); setTracking(false) },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
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
    if (!origin.lat || !dest.lat) {
      setError('Please select both origin and destination from the dropdown')
      return
    }
    setLoading(true); setError('')
    setAllRoutes([]); setWeather(null); setCongestion(null); setTripSaved(false)

    try {
      const [routesRes, weatherRes] = await Promise.all([
        api.get('/api/routes/all', {
          params: {
            originLat: origin.lat, originLon: origin.lon,
            destLat: dest.lat, destLon: dest.lon,
          }
        }),
        api.get('/api/weather', { params: { lat: dest.lat, lon: dest.lon } })
      ])

      setAllRoutes(routesRes.data.routes)
      setWeather(weatherRes.data)

      const fastest = routesRes.data.routes.find(r => r.key === 'fastest') || routesRes.data.routes[0]
      const now = new Date()
      const predRes = await api.post('/api/predict', {
        hour: now.getHours(), dayOfWeek: now.getDay(), month: now.getMonth() + 1,
        weatherCode: 800, temp: weatherRes.data.temp || 30,
        humidity: weatherRes.data.humidity || 60, windSpeed: weatherRes.data.windSpeed || 5,
        visibility: 10, distance: parseFloat(fastest.distance),
        originLat: origin.lat, originLon: origin.lon,
        destLat: dest.lat, destLon: dest.lon,
      })
      setCongestion(predRes.data)

      await api.post('/api/trips', {
        origin:      { label: origin.label, lat: origin.lat, lon: origin.lon },
        destination: { label: dest.label,   lat: dest.lat,   lon: dest.lon   },
        routeType: activeRoute,
        distance: parseFloat(fastest.distance),
        duration: fastest.duration,
        congestionScore: predRes.data.score,
        congestionLevel: predRes.data.level,
        weather: {
          temp: weatherRes.data.temp,
          condition: weatherRes.data.condition,
          icon: weatherRes.data.icon,
        },
        tollCost: fastest.tollCost,
        fuelCost: fastest.fuelCost,
      })
      setTripSaved(true)
      setSidebarOpen(false)

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get routes. Try again.')
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', position: 'relative', overflow: 'hidden' }}>

      {/* ── MOBILE TOGGLE ── */}
      <button
        onClick={() => setSidebarOpen(s => !s)}
        style={{
          position: 'absolute', top: 12, left: 12, zIndex: 10000,
          background: '#0f172a', border: '1px solid #334155',
          borderRadius: 12, padding: '8px 14px', color: 'white',
          fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        }}
        className="md:hidden"
      >
        <span style={{ fontSize: 16 }}>{sidebarOpen ? '✕' : '☰'}</span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          {sidebarOpen ? 'Close' : 'Search Route'}
        </span>
      </button>

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9998 }}
          className="md:hidden"
        />
      )}

      {/* ══════════ SIDEBAR ══════════ */}
      <div
        style={{
          position: 'absolute', left: 0, top: 0, height: '100%', width: 320,
          zIndex: 9999,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          display: 'flex', flexDirection: 'column', overflowY: 'auto',
          background: '#0f172a', borderRight: '1px solid #1e293b',
        }}
        className="md:relative md:translate-x-0"
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Plan Your Route
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-500 hover:text-white text-lg"
            >✕</button>
          </div>

          {/* ── ORIGIN with current location ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-500">Origin</label>
              <button
                onClick={useCurrentLocation}
                disabled={locating}
                className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors disabled:opacity-50"
              >
                {locating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
                    <span>Locating...</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 11 }}>📍</span>
                    <span>Use my location</span>
                  </>
                )}
              </button>
            </div>
            <SearchBox
              label=""
              placeholder="e.g. Connaught Place, Delhi"
              value={origin.label}
              onChange={(v) => setOrigin(o => ({ ...o, label: v }))}
              onSelect={(item) => setOrigin({ label: item.label, lat: item.lat, lon: item.lon })}
            />
          </div>

          {/* ── DESTINATION ── */}
          <SearchBox
            label="Destination"
            placeholder="e.g. Taj Mahal, Agra"
            value={dest.label}
            onChange={(v) => setDest(d => ({ ...d, label: v }))}
            onSelect={(item) => setDest({ label: item.label, lat: item.lat, lon: item.lon })}
          />

          {/* Display mode */}
          <div>
            <label className="text-xs text-slate-500 mb-2 block">Display mode</label>
            <div className="flex gap-2">
              <button onClick={() => setCompareMode(true)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${compareMode ? 'bg-primary-500 text-white border-primary-500' : 'bg-dark-700 text-slate-400 border-dark-600 hover:bg-dark-600'}`}>
                Compare all 3
              </button>
              <button onClick={() => setCompareMode(false)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${!compareMode ? 'bg-primary-500 text-white border-primary-500' : 'bg-dark-700 text-slate-400 border-dark-600 hover:bg-dark-600'}`}>
                Single route
              </button>
            </div>
          </div>

          {!compareMode && (
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Route type</label>
              <div className="flex gap-2">
                {['fastest','shortest','eco'].map(type => (
                  <button key={type} onClick={() => setActiveRoute(type)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all capitalize ${activeRoute === type ? 'bg-primary-500 text-white border-primary-500' : 'bg-dark-700 text-slate-400 border-dark-600 hover:bg-dark-600'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Map layers */}
          <div className="space-y-2">
            <label className="text-xs text-slate-500 block">Map layers</label>
            <TrafficIncidents
              enabled={showIncidents}
              onToggle={() => setShowIncidents(s => !s)}
              incidentCount={incidentCount}
              onCountChange={setIncidentCount}
            />
            <AccidentHotspots
              enabled={showHotspots}
              onToggle={() => setShowHotspots(s => !s)}
              count={hotspotCount}
            />
          </div>

          {/* Live GPS */}
          <div>
            <label className="text-xs text-slate-500 mb-2 block">Live navigation</label>
            {!tracking ? (
              <button onClick={startTracking}
                className="w-full py-2.5 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 transition-all">
                <span className="w-2 h-2 bg-blue-400 rounded-full" />
                Start Live Navigation
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 px-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-xs text-blue-400 font-medium">GPS Active</span>
                  </div>
                  {userLocation && (
                    <span className="text-xs text-slate-400 font-mono">
                      {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setFollowUser(f => !f)}
                    className={`flex-1 py-2 text-xs rounded-lg border transition-all ${followUser ? 'bg-primary-500/20 text-primary-400 border-primary-500/40' : 'bg-dark-700 text-slate-400 border-dark-600'}`}>
                    {followUser ? 'Following' : 'Follow me'}
                  </button>
                  <button onClick={stopTracking}
                    className="flex-1 py-2 text-xs rounded-lg border bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 transition-all">
                    Stop GPS
                  </button>
                </div>
              </div>
            )}
            {locationError && (
              <div className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {locationError}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-3 py-2 text-xs">
              {error}
            </div>
          )}

          <button onClick={handleGetRoute} disabled={loading} className="btn-primary w-full">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Fetching all routes...
              </span>
            ) : 'Get All Routes'}
          </button>

          {tripSaved && (
            <div className="text-center text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg py-2">
              ✅ Trip saved to history
            </div>
          )}
        </div>

        {/* Results */}
        {allRoutes.length > 0 && (
          <div className="px-4 pb-4 space-y-4">
            <RouteComparison
              routes={allRoutes}
              activeRoute={activeRoute}
              onSelect={setActiveRoute}
            />

            {congestion && (
              <div className={`rounded-xl p-3 border ${congestionColor[congestion.level] || congestionColor.Low}`}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1">Congestion Level</div>
                <div className="text-2xl font-black">{congestion.level}</div>
                <div className="text-xs mt-1 opacity-70">Score: {congestion.score}/10</div>
              </div>
            )}

            {weather && (
              <div className="bg-dark-700 rounded-xl p-3">
                <div className="text-xs text-slate-500 mb-2">Weather at destination</div>
                <div className="flex items-center gap-3">
                  <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                    alt={weather.condition} className="w-12 h-12" />
                  <div>
                    <div className="text-lg font-bold text-white">{weather.temp}°C</div>
                    <div className="text-xs text-slate-400 capitalize">{weather.description}</div>
                    <div className="text-xs text-slate-500">
                      Humidity: {weather.humidity}% · Wind: {weather.windSpeed} m/s
                    </div>
                  </div>
                </div>
                {weather.alerts?.map((alert, i) => (
                  <div key={i} className={`mt-2 text-xs px-3 py-2 rounded-lg ${
                    alert.type === 'danger'  ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    alert.type === 'warning' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                               'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {alert.message}
                  </div>
                ))}
              </div>
            )}

            <CarbonFootprint routes={allRoutes} activeRoute={activeRoute} />

            <DepartureTime
              origin={origin}
              destination={dest}
              distance={activeRouteData ? parseFloat(activeRouteData.distance) : 20}
            />

            <PlacesAlongRoute
              routePoints={activeRouteData?.points || []}
              onPlacesChange={setRoutePlaces}
            />

            <LiveSharing
              userLocation={userLocation}
              routeContext={{ destination: dest.label }}
            />

            {activeRouteData?.instructions?.length > 0 && (
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

      {/* ══════════ MAP ══════════ */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={[20.5937, 78.9629]} zoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          />

          {origin.lat && (
            <Marker position={[origin.lat, origin.lon]} icon={greenIcon}>
              <Popup><strong>{origin.label}</strong><br />Origin</Popup>
            </Marker>
          )}
          {dest.lat && (
            <Marker position={[dest.lat, dest.lon]} icon={redIcon}>
              <Popup><strong>{dest.label}</strong><br />Destination</Popup>
            </Marker>
          )}

          {compareMode
            ? allRoutes.map(route => (
                <Polyline
                  key={route.key}
                  positions={route.points}
                  color={ROUTE_COLORS[route.key]}
                  weight={activeRoute === route.key ? 6 : 3}
                  opacity={activeRoute === route.key ? 0.95 : 0.45}
                  eventHandlers={{ click: () => setActiveRoute(route.key) }}
                />
              ))
            : activeRouteData && (
                <Polyline
                  positions={activeRouteData.points}
                  color={ROUTE_COLORS[activeRoute]}
                  weight={5} opacity={0.9}
                />
              )
          }

          {allRoutes.length > 0 && <FlyToRoutes allRoutes={allRoutes} />}

          {userLocation && (
            <>
              <Marker position={[userLocation.lat, userLocation.lon]} icon={liveIcon}>
                <Popup><strong>You are here</strong></Popup>
              </Marker>
              <Circle
                center={[userLocation.lat, userLocation.lon]}
                radius={80}
                pathOptions={{ color:'#3b82f6', fillColor:'#3b82f6', fillOpacity:0.1, weight:1 }}
              />
              <FollowUser position={userLocation} follow={followUser} />
            </>
          )}

          <IncidentsLayer enabled={showIncidents} />
          <HotspotsLayer enabled={showHotspots} />
          <PlacesLayer places={routePlaces} />
          <SharedUsersLayer users={sharedUsers} />

        </MapContainer>

        {/* Desktop route legend */}
        {compareMode && allRoutes.length > 0 && (
          <div className="hidden md:block absolute top-4 right-4 bg-dark-800/90 backdrop-blur-sm border border-dark-600 rounded-xl px-4 py-3 space-y-2">
            <div className="text-xs text-slate-400 font-semibold mb-1">Routes</div>
            {[
              { key:'fastest',  color:'#0ea5e9', label:'Fastest'  },
              { key:'shortest', color:'#a855f7', label:'Shortest' },
              { key:'eco',      color:'#22c55e', label:'Eco'      },
            ].map(r => (
              <div key={r.key} onClick={() => setActiveRoute(r.key)}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                <div className="w-6 h-1.5 rounded-full"
                  style={{ backgroundColor: r.color, opacity: activeRoute === r.key ? 1 : 0.45 }} />
                <span className={`text-xs ${activeRoute === r.key ? 'text-white font-semibold' : 'text-slate-400'}`}>
                  {r.label}
                </span>
                {activeRoute === r.key && <span className="text-xs text-primary-400">●</span>}
              </div>
            ))}
          </div>
        )}

        {/* Mobile route legend */}
        {compareMode && allRoutes.length > 0 && (
          <div className="md:hidden absolute bottom-24 right-3 bg-dark-800/95 border border-dark-600 rounded-xl px-3 py-2 space-y-1.5">
            {[
              { key:'fastest',  color:'#0ea5e9', label:'Fast'  },
              { key:'shortest', color:'#a855f7', label:'Short' },
              { key:'eco',      color:'#22c55e', label:'Eco'   },
            ].map(r => (
              <div key={r.key} onClick={() => setActiveRoute(r.key)}
                className="flex items-center gap-2 cursor-pointer">
                <div className="w-4 h-1.5 rounded-full"
                  style={{ backgroundColor: r.color, opacity: activeRoute === r.key ? 1 : 0.4 }} />
                <span className={`text-xs ${activeRoute === r.key ? 'text-white font-semibold' : 'text-slate-500'}`}>
                  {r.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom hint */}
        {allRoutes.length === 0 && !loading && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-dark-800/90 backdrop-blur-sm border border-dark-600 rounded-2xl px-4 py-2.5 text-xs text-slate-400 pointer-events-none whitespace-nowrap">
            Tap ☰ to search and plan your route
          </div>
        )}

        {/* Re-center */}
        {tracking && !followUser && (
          <button onClick={() => setFollowUser(true)}
            className="absolute bottom-24 right-4 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Re-center
          </button>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-dark-900/60 flex items-center justify-center" style={{ zIndex: 9997 }}>
            <div className="bg-dark-800 border border-dark-600 rounded-2xl px-8 py-6 text-center mx-4">
              <div className="w-10 h-10 border-4 border-dark-600 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white font-semibold text-sm">Fetching all 3 routes...</p>
              <p className="text-slate-400 text-xs mt-1">Fastest · Shortest · Eco</p>
            </div>
          </div>
        )}

        {/* AI Chat */}
        <ChatAssistant
          routeContext={{
            origin:          origin.label,
            destination:     dest.label,
            destLat:         dest.lat,
            destLon:         dest.lon,
            distance:        activeRouteData?.distance,
            duration:        activeRouteData?.duration,
            trafficDelay:    activeRouteData?.trafficDelay,
            tollCost:        activeRouteData?.tollCost,
            fuelCost:        activeRouteData?.fuelCost,
            congestionLevel: congestion?.level,
            congestionScore: congestion?.score,
            weather:         weather,
            activeRoute:     activeRoute,
          }}
        />
      </div>
    </div>
  )
}