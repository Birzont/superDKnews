import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthStatus from "./components/AuthStatus";

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <AuthStatus />
        {children}
      </body>
    </html>
  )
} 