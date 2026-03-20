import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const PLANS = [
  {
    id:    'free',
    name:  'Free',
    price: 0,
    color: '#64748b',
    bg:    '#1e293b',
    features: [
      '5 route searches per day',
      'Basic congestion prediction',
      'Weather at destination',
      '7-day trip history',
      'Standard map view',
      'Voice navigation',
    ],
    missing: [
      'All 3 routes comparison',
      'AI Route Assistant',
      'Best departure time AI',
      'Places along route',
      'Accident hotspots',
      'Fleet management',
      'Carbon footprint score',
      'Live GPS sharing',
    ],
  },
  {
    id:      'pro',
    name:    'Pro',
    price:   499,
    color:   '#0ea5e9',
    bg:      'rgba(14,165,233,0.05)',
    popular: true,
    features: [
      'Unlimited route searches',
      'Advanced ML congestion AI',
      'All 3 routes simultaneously',
      'AI Route Assistant chat',
      'Best departure time AI',
      'Places along route',
      'Accident hotspot ML map',
      'Live GPS sharing',
      'Carbon footprint score',
      'Live traffic incidents',
      '90-day trip history',
      'PWA mobile app',
    ],
    missing: [
      'Fleet management dashboard',
      'Team accounts',
      'Priority support',
    ],
  },
  {
    id:    'business',
    name:  'Business',
    price: 1499,
    color: '#a855f7',
    bg:    'rgba(168,85,247,0.05)',
    features: [
      'Everything in Pro',
      'Fleet management dashboard',
      'Up to 50 vehicles tracking',
      'Real-time GPS every 5 sec',
      'Driver performance reports',
      'Fuel consumption analytics',
      'Route deviation alerts',
      '5 team member accounts',
      'Priority 24/7 support',
      'Custom API access',
      'Unlimited trip history',
      'White-label option',
    ],
    missing: [],
  },
]

export default function Pricing() {
  const { user }                  = useAuth()
  const [loading,  setLoading]    = useState(null)
  const [success,  setSuccess]    = useState(null)
  const [current,  setCurrent]    = useState('free')
  const [annually, setAnnually]   = useState(false)

  const getPrice = (plan) => {
    if (plan.price === 0) return 0
    return annually ? Math.round(plan.price * 0.8) : plan.price
  }

  const handleSubscribe = async (plan) => {
    if (plan.id === 'free' || plan.id === current) return
    setLoading(plan.id)

    // Simulate payment processing (demo mode)
    setTimeout(() => {
      setLoading(null)
      setSuccess(plan.id)
      setCurrent(plan.id)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-slate-400 text-lg mb-6">
            Start free. Upgrade anytime. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-dark-800 border border-dark-700 rounded-full px-4 py-2">
            <button
              onClick={() => setAnnually(false)}
              className={`text-sm font-semibold px-3 py-1 rounded-full transition-all ${
                !annually ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnually(true)}
              className={`text-sm font-semibold px-3 py-1 rounded-full transition-all ${
                annually ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>

          {user && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-slate-400 text-sm">Logged in as {user.name}</span>
              <span className="text-slate-600">·</span>
              <span className="text-sm">
                Current plan:{' '}
                <span className="font-bold capitalize" style={{
                  color: current === 'business' ? '#a855f7' : current === 'pro' ? '#0ea5e9' : '#64748b'
                }}>
                  {current}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Success banner */}
        {success && (
          <div className="mb-8 bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-xl font-black text-green-400 mb-1">
              Welcome to RouteIQ {success.charAt(0).toUpperCase() + success.slice(1)}!
            </div>
            <div className="text-slate-400 text-sm">
              Your subscription is now active. Enjoy all premium features!
            </div>
          </div>
        )}

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => {
            const price    = getPrice(plan)
            const isActive = current === plan.id
            const isBusy   = loading === plan.id

            return (
              <div
                key={plan.id}
                className="relative rounded-2xl p-6 flex flex-col transition-all"
                style={{
                  background:  plan.bg,
                  border:      plan.popular
                    ? `2px solid ${plan.color}`
                    : isActive
                    ? `2px solid #22c55e`
                    : '1px solid #1e293b',
                }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="text-xs font-bold px-4 py-1.5 rounded-full text-white"
                      style={{ background: plan.color }}>
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Active badge */}
                {isActive && (
                  <div className="absolute -top-3.5 right-4">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white bg-green-500">
                      ✓ Active
                    </span>
                  </div>
                )}

                {/* Plan name + price */}
                <div className="mb-6">
                  <h3 className="text-xl font-black text-white mb-3">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black" style={{ color: plan.color }}>
                      {price === 0 ? '₹0' : `₹${price}`}
                    </span>
                    {price > 0 && (
                      <span className="text-slate-500 text-sm">/month</span>
                    )}
                  </div>
                  {annually && price > 0 && (
                    <div className="text-xs text-green-400 mt-1">
                      Save ₹{(plan.price - price) * 12}/year vs monthly
                    </div>
                  )}
                  {price === 0 && (
                    <div className="text-xs text-slate-500 mt-1">No credit card needed</div>
                  )}
                </div>

                {/* Features */}
                <div className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-green-400 flex-shrink-0 mt-0.5" style={{ fontSize:13 }}>✓</span>
                      <span className="text-sm text-slate-300">{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 opacity-35">
                      <span className="text-slate-600 flex-shrink-0 mt-0.5" style={{ fontSize:13 }}>✗</span>
                      <span className="text-sm text-slate-500">{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isBusy || isActive || plan.id === 'free'}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:cursor-not-allowed"
                  style={{
                    background: isActive
                      ? 'rgba(34,197,94,0.15)'
                      : plan.id === 'free'
                      ? '#1e293b'
                      : plan.color,
                    color: isActive
                      ? '#22c55e'
                      : plan.id === 'free'
                      ? '#475569'
                      : 'white',
                    border: isActive
                      ? '1px solid rgba(34,197,94,0.3)'
                      : 'none',
                    opacity: (plan.id === 'free' && !isActive) ? 0.5 : 1,
                  }}
                >
                  {isBusy ? (
                    <span className="flex items-center justify-center gap-2">
                      <span style={{
                        width:14, height:14,
                        border:'2px solid rgba(255,255,255,0.3)',
                        borderTopColor:'white', borderRadius:'50%',
                        display:'inline-block',
                        animation:'spin 0.8s linear infinite',
                      }} />
                      Processing payment...
                    </span>
                  ) : isActive
                    ? '✓ Current Plan'
                    : plan.id === 'free'
                    ? 'Get Started Free'
                    : `Subscribe — ₹${price}/mo`
                  }
                </button>
              </div>
            )
          })}
        </div>

        {/* Feature comparison table */}
        <div className="card mb-12 overflow-hidden">
          <h2 className="text-xl font-black text-white mb-6">Full Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left text-slate-400 font-semibold pb-3 pr-4">Feature</th>
                  {PLANS.map(p => (
                    <th key={p.id} className="text-center pb-3 px-4" style={{ color: p.color }}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Route searches',       '5/day',    'Unlimited', 'Unlimited'],
                  ['Route types',          '1 route',  'All 3',     'All 3'],
                  ['ML congestion AI',     'Basic',    'Advanced',  'Advanced'],
                  ['AI Route Assistant',   '✗',        '✓',         '✓'],
                  ['Best departure time',  '✗',        '✓',         '✓'],
                  ['Places along route',   '✗',        '✓',         '✓'],
                  ['Accident hotspots',    '✗',        '✓',         '✓'],
                  ['Live GPS sharing',     '✗',        '✓',         '✓'],
                  ['Carbon footprint',     '✗',        '✓',         '✓'],
                  ['Trip history',         '7 days',   '90 days',   'Unlimited'],
                  ['Fleet management',     '✗',        '✗',         '✓'],
                  ['Team accounts',        '✗',        '✗',         '5 users'],
                  ['Priority support',     '✗',        '✗',         '✓'],
                  ['API access',           '✗',        '✗',         '✓'],
                ].map(([feature, ...vals], i) => (
                  <tr key={i} className={`border-b border-dark-700/50 ${i % 2 === 0 ? '' : 'bg-dark-700/20'}`}>
                    <td className="py-3 pr-4 text-slate-300">{feature}</td>
                    {vals.map((v, j) => (
                      <td key={j} className="py-3 px-4 text-center">
                        <span style={{
                          color: v === '✓' ? '#22c55e'
                            : v === '✗' ? '#475569'
                            : PLANS[j].color,
                          fontWeight: v === '✓' || v === '✗' ? 700 : 500,
                        }}>
                          {v}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes! Cancel your subscription anytime from your account. No questions asked. You keep features until end of billing period.',
              },
              {
                q: 'Is my payment secure?',
                a: 'Yes. All payments are processed by Razorpay — India\'s most trusted payment gateway used by Swiggy, Zomato, and Paytm.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 7-day money-back guarantee for all paid plans. Contact us within 7 days of purchase.',
              },
              {
                q: 'Can I switch plans?',
                a: 'Yes! Upgrade or downgrade anytime. When upgrading, you get access immediately. Downgrade takes effect at next billing cycle.',
              },
              {
                q: 'What payment methods are accepted?',
                a: 'All major credit/debit cards, UPI (GPay, PhonePe, Paytm), net banking, and EMI options via Razorpay.',
              },
              {
                q: 'Is there a student discount?',
                a: 'Yes! Students get 50% off on Pro plan. Email us your college ID at support@routeiq.app to claim.',
              },
            ].map((faq, i) => (
              <div key={i} className="card hover:border-dark-600 transition-all">
                <h3 className="text-sm font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/20 rounded-2xl p-10">
          <h2 className="text-2xl font-black text-white mb-3">
            Ready to navigate smarter?
          </h2>
          <p className="text-slate-400 mb-6">
            Join thousands of Indian drivers using RouteIQ every day
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleSubscribe(PLANS[1])}
              className="btn-primary px-8 py-3"
            >
              Start Pro — ₹{getPrice(PLANS[1])}/mo
            </button>
            <button
              onClick={() => window.location.href = '/map'}
              className="btn-secondary px-8 py-3"
            >
              Try Free First
            </button>
          </div>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}