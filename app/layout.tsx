import type { Metadata, Viewport } from 'next'
import './globals.css'
import AuthStatus from "./components/AuthStatus";
import Footer from "./components/Footer";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import PWAStatus from "./components/PWAStatus";
import PWAManualInstall from "./components/PWAManualInstall";
import PWAFloatingInstall from "./components/PWAFloatingInstall";

export const metadata: Metadata = {
  title: 'DK News Super - 뉴스 리터러시 플랫폼',
  description: '뉴스 리터러시를 위한 플랫폼',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DKnewsSUPER',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#1F2937',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <AuthStatus />
        <PWAInstallPrompt />
        <PWAStatus />
        <PWAManualInstall />
        <PWAFloatingInstall />
        {children}
        <Footer />
      </body>
    </html>
  )
} 