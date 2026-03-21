import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const PLANS = [
  {
    id:'free', name:'Free', price:0, color:'#6b7280', bg:'#fff',
    features:['5 route searches per day','Basic congestion prediction','Weather at destination','7-day trip history','Voice navigation'],
    missing:['All 3 routes comparison','AI Route Assistant','Best departure time AI','Places along route','Accident hotspots','Fleet management','Carbon footprint score'],
  },
  {
    id:'pro', name:'Pro', price:499, color:'#6d28d9', bg:'#6d28d9', popular:true,
    features:['Unlimited route searches','Advanced ML congestion AI','All 3 routes simultaneously','AI Route Assistant chat','Best departure time AI','Places along route','Accident hotspot ML map','Live GPS sharing','Carbon footprint score','Live traffic incidents','90-day trip history','PWA mobile app'],
    missing:['Fleet management dashboard','Team accounts','Priority support'],
  },
  {
    id:'business', name:'Business', price:1499, color:'#0284c7', bg:'#fff',
    features:['Everything in Pro','Fleet management dashboard','Up to 50 vehicles tracking','Real-time GPS every 5 sec','Driver performance reports','Fuel consumption analytics','5 team member accounts','Priority 24/7 support','Custom API access','Unlimited trip history'],
    missing:[],
  },
]

const FAQS = [
  { q:'Can I cancel anytime?',        a:'Yes! Cancel your subscription anytime. You keep features until end of billing period.' },
  { q:'Is my payment secure?',        a:'Yes. Payments are processed by Razorpay — India\'s most trusted payment gateway.' },
  { q:'Do you offer refunds?',        a:'Yes, we offer a 7-day money-back guarantee for all paid plans.' },
  { q:'Can I switch plans?',          a:'Yes! Upgrade or downgrade anytime. Upgrades take effect immediately.' },
  { q:'What payment methods?',        a:'All major cards, UPI (GPay, PhonePe, Paytm), net banking and EMI via Razorpay.' },
  { q:'Is there a student discount?', a:'Yes! Students get 50% off Pro plan. Email us your college ID to claim.' },
]

export default function Pricing() {
  const { user }              = useAuth()
  const [loading, setLoading] = useState(null)
  const [success, setSuccess] = useState(null)
  const [current, setCurrent] = useState('free')
  const [annual,  setAnnual]  = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const getPrice = (plan) => {
    if (plan.price === 0) return 0
    return annual ? Math.round(plan.price * 0.8) : plan.price
  }

  const handleSubscribe = async (plan) => {
    if (plan.id === 'free' || plan.id === current) return
    setLoading(plan.id)
    setTimeout(() => {
      setLoading(null)
      setSuccess(plan.id)
      setCurrent(plan.id)
    }, 2000)
  }

  return (
    <div style={{ minHeight:'calc(100vh - 56px)', background:'#f9fafb', fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .plan-card { transition:transform 0.2s,box-shadow 0.2s; }
        .plan-card:hover { transform:translateY(-4px); }
        .faq-item { transition:all 0.2s; }
        .faq-item:hover { background:#f5f3ff !important; }
      `}</style>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'48px 24px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ display:'inline-block', background:'#f5f3ff', color:'#6d28d9', fontSize:12, fontWeight:600, padding:'6px 16px', borderRadius:100, marginBottom:16, border:'1px solid #e9d5ff' }}>
            Simple pricing
          </div>
          <h1 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:'#111', letterSpacing:'-1px', marginBottom:12, fontFamily:"'DM Serif Display',serif" }}>
            Start free, grow as you need
          </h1>
          <p style={{ fontSize:17, color:'#6b7280', marginBottom:24 }}>No credit card required to get started</p>

          {/* Billing toggle */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, background:'#fff', border:'1px solid #e5e7eb', borderRadius:100, padding:'6px 6px 6px 16px' }}>
            <span style={{ fontSize:14, color: annual ? '#9ca3af' : '#111', fontWeight: annual ? 400 : 600 }}>Monthly</span>
            <button
              onClick={() => setAnnual(a => !a)}
              style={{ width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', background: annual ? '#6d28d9' : '#d1d5db' }}
            >
              <span style={{ position:'absolute', top:2, left: annual ? 22 : 2, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.2s', display:'block' }} />
            </button>
            <span style={{ fontSize:14, color: annual ? '#111' : '#9ca3af', fontWeight: annual ? 600 : 400 }}>Annual</span>
            {annual && <span style={{ fontSize:11, fontWeight:700, color:'#16a34a', background:'#f0fdf4', border:'1px solid #bbf7d0', padding:'3px 10px', borderRadius:20 }}>Save 20%</span>}
          </div>

          {user && (
            <div style={{ marginTop:16, fontSize:14, color:'#6b7280' }}>
              Logged in as {user.name} · Current plan:{' '}
              <span style={{ fontWeight:700, color:'#6d28d9', textTransform:'capitalize' }}>{current}</span>
            </div>
          )}
        </div>

        {/* Success banner */}
        {success && (
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:16, padding:'20px 24px', textAlign:'center', marginBottom:32, animation:'fadeUp 0.4s ease' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🎉</div>
            <div style={{ fontSize:18, fontWeight:700, color:'#15803d', marginBottom:4 }}>
              Welcome to RouteIQ {success.charAt(0).toUpperCase() + success.slice(1)}!
            </div>
            <div style={{ fontSize:14, color:'#16a34a' }}>Your subscription is now active.</div>
          </div>
        )}

        {/* Plans */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20, marginBottom:64 }}>
          {PLANS.map((plan, i) => {
            const price    = getPrice(plan)
            const isActive = current === plan.id
            const isBusy   = loading === plan.id
            const isPro    = plan.popular

            return (
              <div key={plan.id} className="plan-card"
                style={{ background: isPro ? '#6d28d9' : '#fff', borderRadius:24, padding:'32px 28px', position:'relative', border: isPro ? 'none' : isActive ? '2px solid #6d28d9' : '1px solid #e5e7eb', boxShadow: isPro ? '0 20px 60px rgba(109,40,217,0.25)' : '0 1px 3px rgba(0,0,0,0.06)', animation:`fadeUp 0.5s ease ${i*0.1}s both` }}>

                {isPro && (
                  <div style={{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)', background:'#a78bfa', color:'#fff', fontSize:11, fontWeight:700, padding:'5px 18px', borderRadius:100, whiteSpace:'nowrap', boxShadow:'0 4px 12px rgba(167,139,250,0.4)' }}>
                    Most popular
                  </div>
                )}
                {isActive && !isPro && (
                  <div style={{ position:'absolute', top:-12, right:16, background:'#22c55e', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:100 }}>
                    ✓ Active
                  </div>
                )}

                <div style={{ fontSize:14, fontWeight:600, color: isPro ? 'rgba(255,255,255,0.7)' : '#6b7280', marginBottom:8 }}>{plan.name}</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:4 }}>
                  <span style={{ fontSize:44, fontWeight:800, color: isPro ? '#fff' : '#111', letterSpacing:'-1.5px', lineHeight:1 }}>
                    {price === 0 ? '₹0' : `₹${price}`}
                  </span>
                  {price > 0 && <span style={{ fontSize:14, color: isPro ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>/month</span>}
                </div>
                {annual && price > 0 && (
                  <div style={{ fontSize:12, color: isPro ? '#a78bfa' : '#16a34a', marginBottom:4 }}>
                    Save ₹{(plan.price - price) * 12}/year
                  </div>
                )}
                {price === 0 && <div style={{ fontSize:12, color:'#9ca3af', marginBottom:4 }}>No credit card needed</div>}

                <div style={{ height:1, background: isPro ? 'rgba(255,255,255,0.15)' : '#f0f0f0', margin:'20px 0' }} />

                <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:28, flex:1 }}>
                  {plan.features.map((f,j) => (
                    <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                      <span style={{ color: isPro ? '#a78bfa' : '#6d28d9', fontSize:14, flexShrink:0, marginTop:1 }}>✓</span>
                      <span style={{ fontSize:13, color: isPro ? 'rgba(255,255,255,0.85)' : '#374151', lineHeight:1.5 }}>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f,j) => (
                    <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:10, opacity:0.35 }}>
                      <span style={{ color:'#9ca3af', fontSize:14, flexShrink:0, marginTop:1 }}>✗</span>
                      <span style={{ fontSize:13, color: isPro ? 'rgba(255,255,255,0.5)' : '#9ca3af', lineHeight:1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link to={plan.id === 'business' ? '/pricing' : '/signup'} style={{ textDecoration:'none' }}>
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isBusy || isActive || plan.id === 'free'}
                    style={{ width:'100%', padding:'14px', borderRadius:12, fontSize:14, fontWeight:600, cursor: (isActive || plan.id === 'free') ? 'default' : 'pointer', fontFamily:'inherit', transition:'all 0.2s',
                      background: isActive ? 'rgba(34,197,94,0.15)' : isPro ? 'rgba(255,255,255,0.15)' : plan.id === 'free' ? '#f9fafb' : 'transparent',
                      color:      isActive ? '#16a34a'               : isPro ? '#fff'                  : plan.id === 'free' ? '#9ca3af'  : '#6d28d9',
                      border:     isActive ? '1px solid #bbf7d0'     : isPro ? 'none'                  : plan.id === 'free' ? '1px solid #e5e7eb' : '1.5px solid #6d28d9',
                    }}
                    onMouseOver={e => { if (!isActive && plan.id !== 'free') e.currentTarget.style.background = isPro ? 'rgba(255,255,255,0.25)' : '#f5f3ff' }}
                    onMouseOut={e  => { e.currentTarget.style.background  = isActive ? 'rgba(34,197,94,0.15)' : isPro ? 'rgba(255,255,255,0.15)' : plan.id === 'free' ? '#f9fafb' : 'transparent' }}
                  >
                    {isBusy ? (
                      <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                        <span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} />
                        Processing...
                      </span>
                    ) : isActive ? '✓ Current plan'
                      : plan.id === 'free' ? 'Get started free'
                      : `Subscribe — ₹${price}/mo →`
                    }
                  </button>
                </Link>
              </div>
            )
          })}
        </div>

        {/* Feature comparison table */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:20, padding:'32px', marginBottom:64, overflowX:'auto' }}>
          <h2 style={{ fontSize:22, fontWeight:800, color:'#111', letterSpacing:'-0.5px', marginBottom:24 }}>Full feature comparison</h2>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ borderBottom:'2px solid #f0f0f0' }}>
                <th style={{ textAlign:'left', padding:'10px 0', color:'#6b7280', fontWeight:600, width:'40%' }}>Feature</th>
                {PLANS.map(p => (
                  <th key={p.id} style={{ textAlign:'center', padding:'10px 0', color: p.popular ? '#6d28d9' : '#374151', fontWeight:700 }}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Route searches',        '5/day',    'Unlimited', 'Unlimited'],
                ['Route types',           '1 route',  'All 3',     'All 3'],
                ['ML congestion AI',      'Basic',    'Advanced',  'Advanced'],
                ['AI Route Assistant',    '✗',        '✓',         '✓'],
                ['Best departure time',   '✗',        '✓',         '✓'],
                ['Places along route',    '✗',        '✓',         '✓'],
                ['Accident hotspots',     '✗',        '✓',         '✓'],
                ['Live GPS sharing',      '✗',        '✓',         '✓'],
                ['Carbon footprint',      '✗',        '✓',         '✓'],
                ['Trip history',          '7 days',   '90 days',   'Unlimited'],
                ['Fleet management',      '✗',        '✗',         '✓'],
                ['Team accounts',         '✗',        '✗',         '5 users'],
                ['Priority support',      '✗',        '✗',         '✓'],
                ['API access',            '✗',        '✗',         '✓'],
              ].map(([feature,...vals], i) => (
                <tr key={i} style={{ borderBottom:'1px solid #f9fafb', background: i%2===1 ? '#fafafa' : '#fff' }}>
                  <td style={{ padding:'12px 0', color:'#374151' }}>{feature}</td>
                  {vals.map((v,j) => (
                    <td key={j} style={{ padding:'12px 0', textAlign:'center', fontWeight: v==='✓'||v==='✗'?700:500, color: v==='✓'?'#16a34a':v==='✗'?'#d1d5db':PLANS[j].color }}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth:680, margin:'0 auto 64px' }}>
          <h2 style={{ fontSize:28, fontWeight:800, color:'#111', letterSpacing:'-0.5px', marginBottom:8, textAlign:'center' }}>
            Frequently asked questions
          </h2>
          <p style={{ fontSize:15, color:'#6b7280', marginBottom:32, textAlign:'center' }}>
            Everything you need to know about RouteIQ pricing
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="faq-item"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'16px 20px', cursor:'pointer', borderColor: openFaq===i ? '#e9d5ff' : '#e5e7eb', background: openFaq===i ? '#faf5ff' : '#fff' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                  <span style={{ fontSize:14, fontWeight:600, color:'#111' }}>{faq.q}</span>
                  <span style={{ fontSize:18, color:'#6d28d9', flexShrink:0, transition:'transform 0.2s', transform: openFaq===i ? 'rotate(45deg)' : 'none' }}>+</span>
                </div>
                {openFaq === i && (
                  <p style={{ fontSize:14, color:'#6b7280', marginTop:10, lineHeight:1.7 }}>{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ background:'linear-gradient(135deg,#6d28d9,#4c1d95)', borderRadius:24, padding:'48px 40px', textAlign:'center' }}>
          <h2 style={{ fontSize:'clamp(24px,3vw,36px)', fontWeight:800, color:'#fff', letterSpacing:'-0.5px', marginBottom:12, fontFamily:"'DM Serif Display',serif" }}>
            Ready to navigate smarter?
          </h2>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.7)', marginBottom:28 }}>
            Join drivers across India saving time and money every day
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/signup">
              <button style={{ background:'#fff', color:'#6d28d9', border:'none', padding:'14px 32px', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', transition:'all 0.2s', fontFamily:'inherit' }}
                onMouseOver={e => e.target.style.transform='translateY(-1px)'}
                onMouseOut={e  => e.target.style.transform='none'}
              >
                Start for free →
              </button>
            </Link>
            <Link to="/map">
              <button style={{ background:'transparent', color:'#fff', border:'1.5px solid rgba(255,255,255,0.3)', padding:'13px 28px', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                Try the map
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}