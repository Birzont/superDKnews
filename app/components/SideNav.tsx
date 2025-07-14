'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Building2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SideNav() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser()
      setIsAdmin(data.user?.email === 'herry0515@naver.com')
    }
    checkAdmin()
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAdmin()
    })
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Bias issue',
      href: '/bias-issue',
      icon: FileText,
    },
    {
      name: 'Controversial issue',
      href: '/controversial-issue',
      icon: Building2,
    },
  ]

  return (
    <div className="w-72 h-screen bg-white border-r border-gray-200 p-4 flex flex-col justify-between">
      <div>
        <div className="mb-8 flex flex-col items-center">
          <img src="https://d0gyunkim.github.io/superDKnews-res/superdknews.png" alt="DK News Super Logo" className="w-24 h-24 object-contain mb-2" />
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
                    ? 'bg-gray-100 text-gray-900 border border-gray-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
} 