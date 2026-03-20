import { useState, useEffect, useRef } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

function createUserIcon(name, color) {
  const initials = name?.charAt(0)?.toUpperCase() || '?'
  return new L.DivIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;
      background:${color};
      border:3px solid white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:14px;font-weight:900;
      box-shadow:0 4px 12px rgba(0,0,0,0.4);
      cursor:pointer;
    ">${initials}</div>`,
    iconSize:   [36, 36],
    iconAnchor: [18, 18],
  })
}

const USER_COLORS = ['#f97316', '#a855f7', '#22c55e', '#ec4899', '#06b6d4', '#f59e0b']

export function SharedUsersLayer({ users }) {
  return (
    <>
      {Object.entries(users).map(([id, user], i) => (
        <Marker
          key={id}
          position={[user.lat, user.lon]}
          icon={createUserIcon(user.name, USER_COLORS[i % USER_COLORS.length])}
        >
          <Popup>
            <div style={{ minWidth: 140 }}>
              <div style={{ fontWeight:'bold', marginBottom:4 }}>{user.name}</div>
              <div style={{ fontSize:11, color:'#94a3b8' }}>
                {user.lat?.toFixed(4)}, {user.lon?.toFixed(4)}
              </div>
              <div style={{ fontSize:11, color:'#22c55e', marginTop:4 }}>
                Live location
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

export default function LiveSharing({ userLocation, routeContext }) {
  const { user } = useAuth()
  const [sharing,     setSharing]     = useState(false)
  const [sharedUsers, setSharedUsers] = useState({})
  const [expanded,    setExpanded]    = useState(true)
  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', { transports: ['websocket', 'polling'] })

    socketRef.current.on('userLocation', (data) => {
      setSharedUsers(prev => ({ ...prev, [data.id]: data }))
    })

    socketRef.current.on('userLeft', (id) => {
      setSharedUsers(prev => { const n = { ...prev }; delete n[id]; return n })
    })

    return () => socketRef.current?.disconnect()
  }, [])

  // Broadcast location when sharing
  useEffect(() => {
    if (!sharing || !userLocation || !socketRef.current) return
    socketRef.current.emit('shareLocation', {
      name:  user?.name || 'Anonymous',
      lat:   userLocation.lat,
      lon:   userLocation.lon,
      route: routeContext?.destination || null,
    })
  }, [userLocation, sharing])

  const toggleSharing = () => {
    if (sharing) {
      socketRef.current?.emit('stopSharing')
      setSharing(false)
    } else {
      if (!userLocation) {
        alert('Start Live Navigation first to share your location!')
        return
      }
      setSharing(true)
    }
  }

  const sharedCount = Object.keys(sharedUsers).length

  return (
    <div className="border-t border-dark-700 mt-1">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-dark-700/50"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-300">Live Location Sharing</span>
          {sharedCount > 0 && (
            <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
              {sharedCount} nearby
            </span>
          )}
        </div>
        <span className="text-slate-500 text-xs">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <button
            onClick={toggleSharing}
            className={`w-full py-2.5 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
              sharing
                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                : 'bg-dark-700 text-slate-400 border-dark-600 hover:bg-dark-600'
            }`}
          >
            {sharing ? (
              <>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                Sharing your location — tap to stop
              </>
            ) : (
              <>
                <span>📡</span>
                Share my location with others
              </>
            )}
          </button>

          {!userLocation && (
            <p className="text-xs text-slate-500 text-center">
              Start Live Navigation first
            </p>
          )}

          {sharedCount > 0 && (
            <div>
              <div className="text-xs text-slate-500 mb-2">Users sharing location nearby:</div>
              <div className="space-y-1.5">
                {Object.entries(sharedUsers).map(([id, u], i) => (
                  <div key={id} className="flex items-center gap-3 bg-dark-700 rounded-xl p-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: USER_COLORS[i % USER_COLORS.length] }}
                    >
                      {u.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">{u.name}</div>
                      {u.route && <div className="text-xs text-slate-500 truncate">Going to: {u.route}</div>}
                    </div>
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {sharing && sharedCount === 0 && (
            <div className="text-center py-3 text-xs text-slate-500">
              No other users nearby right now
            </div>
          )}
        </div>
      )}
    </div>
  )
}