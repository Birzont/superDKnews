"use client"

import SideNav from '../components/SideNav'

export default function ControversialIssuePage() {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <main className="flex-1 bg-gray-50 px-8 pt-10">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Controversial Issue</h1>
          <p className="text-base text-gray-500">국내의 논쟁적인 이슈만 모아봅니다.</p>
        </div>
      </main>
    </div>
  )
} 