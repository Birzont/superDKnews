'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Building2, Plus } from 'lucide-react'

export default function SideNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Create News',
      href: '/createnews',
      icon: FileText,
    },
    {
      name: 'Create Org',
      href: '/createorg',
      icon: Building2,
    },
    {
      name: 'Add Post',
      href: '/addpost',
      icon: Plus,
    },
  ]

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">DK News Super</h1>
        <p className="text-sm text-gray-600">뉴스 리터러시 플랫폼</p>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-12 transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="mt-8 flex flex-col space-y-2">
        <Link href="/login">
          <button className="w-full py-2 px-4 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition">로그인</button>
        </Link>
        <Link href="/signup">
          <button className="w-full py-2 px-4 rounded bg-green-500 text-white font-semibold hover:bg-green-600 transition">회원가입</button>
        </Link>
      </div>
    </div>
  )
} 