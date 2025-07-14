"use client"

import SideNav from '../components/SideNav'

export default function ControversialIssuePage() {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-gray-700 text-center">
          국내의 논쟁적인 이슈만 모아봅니다
        </div>
      </main>
    </div>
  )
} 