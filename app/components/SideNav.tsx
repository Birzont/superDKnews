'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Building2, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'

export default function SideNav() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [open, setOpen] = useState(false)

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
      name: 'Bias Issue',
      href: '/bias-issue',
      icon: FileText,
    },
    {
      name: 'Controversial Issue',
      href: '/controversial-issue',
      icon: Building2,
    },
    {
      name: 'Media Trend Flow',
      href: '/mediatrendflow',
      icon: FileText,
    },
  ]

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button className="md:hidden fixed top-4 left-4 z-50 bg-white rounded-full p-2 shadow" onClick={() => setOpen(!open)}>
        <Menu size={28} />
      </button>
      {/* 사이드바 */}
      <div className={`fixed md:static top-0 left-0 z-40 w-72 h-screen bg-white border-r border-gray-200 p-4 flex flex-col justify-between transition-transform duration-200 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} md:block`}> 
        <div>
          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/KakaoTalk_Photo_2025-07-15-12-54-41.jpeg"
              alt="뉴스 리터러시 로고"
              width={96}
              height={96}
              className="w-24 h-24 object-contain mb-2"
              priority
              placeholder="blur"
              blurDataURL="/KakaoTalk_Photo_2025-07-15-12-54-41.jpeg"
            />
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
                  onClick={() => setOpen(false)}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
} 