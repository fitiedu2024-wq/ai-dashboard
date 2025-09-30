import './globals.css'

export const metadata = {
  title: 'AI Marketing Dashboard',
  description: 'AI-powered marketing analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar">
      <body>{children}</body>
    </html>
  )
}
