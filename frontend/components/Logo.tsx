export default function Logo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" opacity="0.2"/>
      <path d="M30 60 L50 30 L70 60 M40 50 L60 50" stroke="url(#logoGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="50" cy="70" r="4" fill="url(#logoGradient)"/>
    </svg>
  )
}
