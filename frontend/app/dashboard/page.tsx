'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-dashboard-backend-7dha.onrender.com'

const MARKETING_QUOTES = [
  { quote: "The aim of marketing is to know and understand the customer so well the product or service fits them and sells itself.", author: "Philip Kotler" },
  { quote: "Content is fire. Social media is gasoline.", author: "Jay Baer" },
  { quote: "Marketing is no longer about the stuff that you make, but about the stories you tell.", author: "Seth Godin" },
  { quote: "Don't be afraid to get creative and experiment with your marketing.", author: "Mike Volpe" },
  { quote: "The best marketing doesn't feel like marketing.", author: "Tom Fishburne" },
  { quote: "Make your marketing so useful people would pay for it.", author: "Jay Baer" },
  { quote: "Good marketing makes the company look smart. Great marketing makes the customer feel smart.", author: "Joe Chernov" },
  { quote: "Social media is not just an activity; it is an investment of valuable time and resources.", author: "Sean Gardner" },
  { quote: "Your brand is what other people say about you when you're not in the room.", author: "Jeff Bezos" },
  { quote: "Marketing is really just about sharing your passion.", author: "Michael Hyatt" },
  { quote: "If you make customers unhappy in the physical world, they might each tell 6 friends. If you make customers unhappy on the Internet, they can each tell 6,000 friends.", author: "Jeff Bezos" },
  { quote: "Customers don't care about your solution. They care about their problems.", author: "Dave McClure" },
  { quote: "Marketing without data is like driving with your eyes closed.", author: "Dan Zarrella" },
  { quote: "Traditional marketing talks at people. Content marketing talks with them.", author: "Doug Kessler" },
  { quote: "Stop selling. Start helping.", author: "Zig Ziglar" },
  { quote: "People do not buy goods and services. They buy relations, stories and magic.", author: "Seth Godin" },
  { quote: "Marketing is a contest for people's attention.", author: "Seth Godin" },
  { quote: "The consumer is not a moron. She's your wife.", author: "David Ogilvy" },
  { quote: "I notice increasing reluctance on the part of marketing executives to use judgment; they are coming to rely too much on research, and they use it as a drunkard uses a lamp post for support, rather than for illumination.", author: "David Ogilvy" },
  { quote: "On the average, five times as many people read the headline as read the body copy. When you have written your headline, you have spent eighty cents out of your dollar.", author: "David Ogilvy" },
  { quote: "If it doesn't sell, it isn't creative.", author: "David Ogilvy" },
  { quote: "Advertising is what you pay for, publicity is what you pray for.", author: "Unknown" },
  { quote: "Content builds relationships. Relationships are built on trust. Trust drives revenue.", author: "Andrew Davis" },
  { quote: "Marketing is telling the world you're a rock star. Content Marketing is showing the world you are one.", author: "Robert Rose" },
  { quote: "The best way to engage honestly with the marketplace via Twitter is to never use the words 'engage,' 'honestly,' or 'marketplace.'", author: "Jeffrey Zeldman" },
  { quote: "Don't push people to where you want to be; meet them where they are.", author: "Meghan Keaney Anderson" },
  { quote: "Either write something worth reading or do something worth writing.", author: "Benjamin Franklin" },
  { quote: "Build something 100 people love, not something 1 million people kind of like.", author: "Brian Chesky" },
  { quote: "Ideas are commodity. Execution of them is not.", author: "Michael Dell" },
  { quote: "Know what your customers want most and what your company does best. Focus on where those two meet.", author: "Kevin Stirtz" },
  { quote: "Doing business without advertising is like winking at a girl in the dark. You know what you are doing, but nobody else does.", author: "Steuart Henderson Britt" },
  { quote: "Our jobs as marketers are to understand how the customer wants to buy and help them to do so.", author: "Bryan Eisenberg" },
  { quote: "The customer's perception is your reality.", author: "Kate Zabriskie" },
  { quote: "Marketing is really theater. It's like staging a performance.", author: "John Sculley" },
  { quote: "There is only one winning strategy. It is to carefully define the target market and direct a superior offering to that target market.", author: "Philip Kotler" },
  { quote: "Data beats opinions.", author: "Jim Barksdale" },
  { quote: "Great marketing is the art of telling true stories to people who want to hear them.", author: "Seth Godin" },
  { quote: "Content is the reason search began in the first place.", author: "Lee Odden" },
  { quote: "Every contact we have with a customer influences whether or not they'll come back. We have to be great every time or we'll lose them.", author: "Kevin Stirtz" },
  { quote: "If you can't explain it simply, you don't understand it well enough.", author: "Albert Einstein" },
  { quote: "Good advertising does not just circulate information. It penetrates the public mind with desires and belief.", author: "Leo Burnett" },
  { quote: "Treat your customers like they own you. Because they do.", author: "Mark Cuban" },
  { quote: "A brand is no longer what we tell the consumer it is – it is what consumers tell each other it is.", author: "Scott Cook" },
  { quote: "Marketing's job is never done. It's about perpetual motion. We must continue to innovate every day.", author: "Beth Comstock" },
  { quote: "Too many companies want their brands to reflect some idealised, perfected image of themselves. As a consequence, their brands acquire no texture, no character and no public trust.", author: "Richard Branson" },
  { quote: "Brands that ignore their customers and prospects will find themselves ignored in return.", author: "Brian Solis" },
  { quote: "Every great business is built on friendship.", author: "JC Penney" },
  { quote: "In the modern world of business, it is useless to be a creative, original thinker unless you can also sell what you create.", author: "David Ogilvy" },
  { quote: "Positioning is not what you do to a product. Positioning is what you do to the mind of the prospect.", author: "Al Ries" },
  { quote: "The key is to set realistic customer expectations, and then not to just meet them, but to exceed them — preferably in unexpected and helpful ways.", author: "Richard Branson" },
  { quote: "Chase the vision, not the money; the money will end up following you.", author: "Tony Hsieh" },
  { quote: "Make the customer the hero of your story.", author: "Ann Handley" },
  { quote: "There is no such thing as soft sell and hard sell. There is only smart sell and stupid sell.", author: "Charles Brower" },
  { quote: "A satisfied customer is the best business strategy of all.", author: "Michael LeBoeuf" },
  { quote: "Authenticity, honesty, and personal voice underlie much of what's successful on the Web.", author: "Rick Levine" },
  { quote: "Marketing is the generous act of helping someone solve a problem. Their problem.", author: "Seth Godin" },
  { quote: "Your brand is a story unfolding across all customer touch points.", author: "Jonah Sachs" },
  { quote: "Marketing isn't about what you make, it's about what you do.", author: "Seth Godin" },
  { quote: "You can't just ask customers what they want and then try to give that to them. By the time you get it built, they'll want something new.", author: "Steve Jobs" },
  { quote: "Strategy without tactics is the slowest route to victory. Tactics without strategy is the noise before defeat.", author: "Sun Tzu" },
  { quote: "The aim of marketing is to make selling superfluous.", author: "Peter Drucker" },
  { quote: "Marketing is too important to be left to the marketing department.", author: "David Packard" },
  { quote: "If you're not telling a story with your marketing, you're simply making noise.", author: "Seth Godin" },
  { quote: "In marketing I've seen only one strategy that can't miss – and that is to market to your best customers first, your best prospects second and the rest of the world last.", author: "John Romero" },
  { quote: "Make the logo bigger is not a strategy.", author: "Bobby Lehew" },
  { quote: "Marketing takes a day to learn. Unfortunately it takes a lifetime to master.", author: "Philip Kotler" },
  { quote: "Forget about likes and follows – focus on leads and revenue.", author: "Jay Baer" },
  { quote: "The difference between the right word and the almost right word is the difference between lightning and a lightning bug.", author: "Mark Twain" },
  { quote: "It's not what you sell that matters as much as how you sell it.", author: "Brian Halligan" },
  { quote: "Marketing is so much more than just advertising – it's about creating experiences.", author: "Arianna Huffington" },
  { quote: "Good SEO work only gets better over time. It's only search engine tricks that need to keep changing when the ranking algorithms change.", author: "Jill Whalen" },
  { quote: "Brands are built on what people are saying about you, not what you're saying about yourself.", author: "Guy Kawasaki" },
  { quote: "People don't buy for logical reasons. They buy for emotional reasons.", author: "Zig Ziglar" },
  { quote: "Word of mouth marketing has always been important. Today, it's more important than ever because of the power of the Internet.", author: "Joe Pulizzi" },
  { quote: "Marketing is about values. It's a complicated and noisy world, and we're not going to get a chance to get people to remember much about us. No company is. So we have to be really clear about what we want them to know about us.", author: "Steve Jobs" },
  { quote: "Good content isn't about good storytelling. It's about telling a true story well.", author: "Ann Handley" },
  { quote: "The brands that can connect with client in a real way will win.", author: "Gary Vaynerchuk" },
  { quote: "The more informative your advertising, the more persuasive it will be.", author: "David Ogilvy" },
  { quote: "Marketing is no longer about the stuff you sell, but the stuff you share.", author: "Unknown" },
  { quote: "Create content that teaches. You can't give up. You need to be consistently awesome.", author: "Neil Patel" },
  { quote: "If you're not spending 80% of your time marketing and 20% of your time making your product, you're going to fail.", author: "Naval Ravikant" },
  { quote: "Build your own dreams, or someone else will hire you to build theirs.", author: "Farrah Gray" },
  { quote: "Right content, right person, right time.", author: "Brian Carroll" },
  { quote: "Marketing is enthusiasm transferred to the customer.", author: "Gregory Ciotti" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Story is just data with a soul.", author: "Brené Brown" },
  { quote: "Permission marketing turns strangers into friends and friends into loyal customers.", author: "Seth Godin" },
  { quote: "Your website isn't the center of your universe. Your Facebook page isn't the center of your universe. Your mobile app isn't the center of your universe. The customer is the center of your universe.", author: "Bruce Ernst" },
  { quote: "In today's world, you get what you share, not what you keep.", author: "Marcus Sheridan" },
  { quote: "Always deliver more than expected.", author: "Larry Page" },
  { quote: "You can't sell anything if you can't tell anything.", author: "Beth Comstock" },
  { quote: "Price is what you pay. Value is what you get.", author: "Warren Buffett" },
  { quote: "Conversion is not a marketing tactic. It's a result. The result of a well-executed strategy.", author: "Brian Massey" },
  { quote: "We see our customers as invited guests to a party, and we are the hosts. It's our job every day to make every important aspect of the customer experience a little bit better.", author: "Jeff Bezos" },
  { quote: "Marketing is the ability to hit the mark.", author: "Anonymous" },
  { quote: "The medium is the message.", author: "Marshall McLuhan" },
  { quote: "Don't find customers for your products, find products for your customers.", author: "Seth Godin" },
  { quote: "If you're attacking your market from multiple positions and your competition isn't, you have all the advantage and it will show up in your increased success and income.", author: "Jay Abraham" },
  { quote: "We don't have a choice on whether we do social media, the question is how well we do it.", author: "Erik Qualman" },
  { quote: "Get closer than ever to your customers. So close that you tell them what they need well before they realize it themselves.", author: "Steve Jobs" },
  { quote: "Marketing strategy is a series of integrated actions leading to a sustainable competitive advantage.", author: "John Sculley" },
  { quote: "The consumer isn't a moron; she is your wife. You insult her intelligence if you assume that a mere slogan and a few vapid adjectives will persuade her to buy anything.", author: "David Ogilvy" },
  { quote: "Successful people are always looking for opportunities to help others. Unsuccessful people are always asking, 'What's in it for me?'", author: "Brian Tracy" },
  { quote: "Marketing isn't done TO you, it's done WITH you.", author: "Anonymous" },
  { quote: "Yesterday's home runs don't win today's games.", author: "Babe Ruth" },
  { quote: "If you can dream it, you can do it.", author: "Walt Disney" },
]

interface User {
  id: number
  email: string
  full_name?: string
  role: string
  quota: number
}

interface Job {
  id: number
  domain: string
  status: string
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [domain, setDomain] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [quote] = useState(() => MARKETING_QUOTES[Math.floor(Math.random() * MARKETING_QUOTES.length)])
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetch(`${API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setUser(data)
        if (data.role === 'admin') {
          router.push('/admin')
        }
        setLoading(false)
      })
      .catch(() => router.push('/login'))

    setJobs([])
  }, [router])

  const handleAnalyze = async () => {
    if (!domain.trim()) {
      alert('Please enter a domain')
      return
    }

    setAnalyzing(true)
    setTimeout(() => {
      alert('Analysis feature coming soon!')
      setAnalyzing(false)
    }, 2000)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getQuotaPercentage = () => {
    const maxQuota = 999
    return Math.min((user?.quota || 0) / maxQuota * 100, 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-blue-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-white opacity-20"></div>
        </div>
        <p className="text-white text-lg mt-6 animate-pulse">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Header */}
      <header className="relative bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                <span className="text-2xl font-bold text-white">AG</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Grinners</h1>
                <p className="text-sm text-purple-300">Marketing Intelligence Platform</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token')
                router.push('/login')
              }}
              className="group px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-medium shadow-lg hover:shadow-red-500/50 transition transform hover:scale-105"
            >
              <span className="group-hover:hidden">Logout</span>
              <span className="hidden group-hover:inline">👋 Goodbye</span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Greeting + Quote Section */}
        <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-500 hover:shadow-purple-500/20">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                {getGreeting()}, {user?.full_name || user?.email.split('@')[0]}!
                <span className="animate-wave inline-block">👋</span>
              </h2>
              <p className="text-purple-200 text-lg">Ready to revolutionize your marketing strategy?</p>
            </div>
            {user?.role === 'admin' && (
              <span className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm font-bold shadow-lg shadow-purple-500/50 animate-pulse">
                👑 ADMIN
              </span>
            )}
          </div>

          <style jsx>{`
            @keyframes wave {
              0%, 100% { transform: rotate(0deg); }
              10%, 30% { transform: rotate(14deg); }
              20% { transform: rotate(-8deg); }
              40% { transform: rotate(-4deg); }
              50% { transform: rotate(10deg); }
            }
            .animate-wave {
              animation: wave 2.5s infinite;
              transform-origin: 70% 70%;
            }
          `}</style>

          {/* Quote with enhanced styling */}
          <div className="relative mt-6 p-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl border-l-4 border-purple-400 backdrop-blur-sm group-hover:border-purple-300 transition-all duration-300">
            <div className="absolute -top-4 -left-4 text-6xl text-purple-400 opacity-30">"</div>
            <div className="relative">
              <p className="text-white text-xl leading-relaxed font-light italic mb-4 pl-8">
                {quote.quote}
              </p>
              <div className="flex items-center justify-end gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-400"></div>
                <p className="text-purple-300 font-bold text-lg">
                  — {quote.author}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards with enhanced design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quota Card with progress bar */}
          <div className="group relative bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-600/0 group-hover:from-purple-500/10 group-hover:to-purple-600/10 transition-all duration-300"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-purple-200 text-sm font-semibold uppercase tracking-wider mb-2">Quota Remaining</p>
                  <p className="text-5xl font-bold text-white">{user?.quota}</p>
                  <p className="text-purple-300 text-sm mt-1">analyses available</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <span className="text-3xl">🎯</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-3 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-purple-500/50"
                  style={{ width: `${getQuotaPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Total Jobs Card */}
          <div className="group relative bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-600/0 group-hover:from-green-500/10 group-hover:to-emerald-600/10 transition-all duration-300"></div>
            <div className="relative">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-green-200 text-sm font-semibold uppercase tracking-wider mb-2">Total Analyses</p>
                  <p className="text-5xl font-bold text-white">{jobs.length}</p>
                  <p className="text-green-300 text-sm mt-1">completed & pending</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300">
                  <span className="text-3xl">📊</span>
                </div>
              </div>
            </div>
          </div>

          {/* Completed Card */}
          <div className="group relative bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-600/0 group-hover:from-blue-500/10 group-hover:to-indigo-600/10 transition-all duration-300"></div>
            <div className="relative">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-2">Completed</p>
                  <p className="text-5xl font-bold text-white">{jobs.filter(j => j.status === 'completed').length}</p>
                  <p className="text-blue-300 text-sm mt-1">successful analyses</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <span className="text-3xl">✅</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create New Analysis */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-3xl font-bold text-white">Launch New Analysis</h3>
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter your domain (e.g., fitiedu.com)"
              className="flex-1 px-6 py-4 bg-white/10 border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-purple-200 text-lg backdrop-blur-sm transition-all"
              disabled={analyzing}
            />
            <button
              onClick={handleAnalyze}
              disabled={analyzing || user?.quota === 0}
              className="group px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 text-lg relative overflow-hidden"
            >
              <span className="relative z-10">
                {analyzing ? 'Analyzing...' : 'Analyze Now'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
            </button>
          </div>
          {user?.quota === 0 && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-200 text-sm font-semibold">⚠️ Quota limit reached. Contact administrator for more analyses.</p>
            </div>
          )}
        </div>

        {/* Analysis History */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-3xl font-bold text-white">Analysis History</h3>
          </div>
          {jobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block animate-bounce mb-6">
                <span className="text-8xl">🎯</span>
              </div>
              <p className="text-purple-200 text-xl font-light">No analyses yet. Launch your first one above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job.id} className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {job.domain[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-white group-hover:text-purple-300 transition-colors">
                          {job.domain.toUpperCase()}
                        </h4>
                        <p className="text-sm text-purple-300 mt-1">
                          {new Date(job.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-5 py-2.5 rounded-full text-sm font-bold shadow-lg ${
                      job.status === 'completed' 
                        ? 'bg-green-500/20 text-green-300 border border-green-400/50' 
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/50'
                    }`}>
                      {job.status === 'completed' ? '✅ Completed' : '⏳ Processing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
