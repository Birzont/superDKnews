import type { Metadata, Viewport } from 'next'
import './globals.css'
import AuthStatus from "./components/AuthStatus";
import Footer from "./components/Footer";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import PWAStatus from "./components/PWAStatus";
import PWAManualInstall from "./components/PWAManualInstall";

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
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1F2937',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8954061105695598"
          crossOrigin="anonymous"
        ></script>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DKnewsSUPER" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1F2937" />
        <meta name="msapplication-tap-highlight" content="no" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW 등록 성공:', registration.scope);
                    })
                    .catch(function(registrationError) {
                      console.log('SW 등록 실패:', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <AuthStatus />
        <PWAStatus />
        <PWAManualInstall />
        {children}
        <Footer />
        <PWAInstallPrompt />
      </body>
    </html>
  )
} 