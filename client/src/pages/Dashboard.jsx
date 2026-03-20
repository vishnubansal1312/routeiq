import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../utils/api'

export default function Dashboard() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/trips/stats')
      .then(res => { setStats(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-10 h-10 border-4 border-dark-600 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-white mb-2">Dashboard</h1>
      <p className="text-slate-400 text-sm mb-8">Your trip statistics and congestion patterns</p>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Trips',     value: stats?.totalTrips    || 0,    unit: ''   },
          { label: 'Total Distance',  value: stats?.totalDistance || 0,    unit: 'km' },
          { label: 'Avg Congestion',  value: stats?.avgCongestion || 0,    unit: '/10'},
          { label: 'Fuel Spent',      value: `₹${stats?.totalFuelCost || 0}`, unit: '' },
        ].map((s, i) => (
          <div key={i} className="card text-center">
            <div className="text-3xl font-black text-primary-400 mb-1">{s.value}<span className="text-sm text-slate-400">{s.unit}</span></div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Hourly congestion chart */}
      <div className="card mb-6">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">Hourly Congestion Pattern</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={stats?.hourlyData || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} interval={2} />
            <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#0ea5e9' }}
            />
            <Line
              type="monotone"
              dataKey="congestion"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#0ea5e9' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tips */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: 'Best travel time',   tip: 'Travel between 10am–12pm or after 8pm for lowest congestion.',  color: 'text-green-400',  bg: 'bg-green-400/10  border-green-400/20'  },
          { title: 'Peak hours to avoid', tip: 'Avoid 8–10am and 5–8pm on weekdays — highest traffic volume.', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
          { title: 'Weather impact',     tip: 'Rain increases congestion by up to 40%. Plan extra time.',       color: 'text-blue-400',   bg: 'bg-blue-400/10   border-blue-400/20'   },
        ].map((t, i) => (
          <div key={i} className={`rounded-2xl p-4 border ${t.bg}`}>
            <div className={`text-sm font-bold mb-2 ${t.color}`}>{t.title}</div>
            <div className="text-xs text-slate-400 leading-relaxed">{t.tip}</div>
          </div>
        ))}
      </div>
    </div>
  )
}