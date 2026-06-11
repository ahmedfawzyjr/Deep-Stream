import type { Metadata } from 'next'
import '../index.css'

export const metadata: Metadata = {
  title: 'DeepKick: AI-Powered Football Prediction & World Cup Analytics',
  description: 'Premium real-time sports prediction dashboard powered by DeepMind-level architectures.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="dark-theme">{children}</body>
    </html>
  )
}
