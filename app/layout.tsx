import type { Metadata } from 'next'
import './globals.css'
import AuthStatus from "./components/AuthStatus";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: 'DK News Super - 뉴스 리터러시 플랫폼',
  description: '뉴스 리터러시를 위한 플랫폼',
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
      </head>
      <body>
        <AuthStatus />
        {children}
        <Footer />
      </body>
    </html>
  )
} 