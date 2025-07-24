'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Building2, Menu, ExternalLink, X } from 'lucide-react'
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
      name: '뉴스 한누네',
      href: '/',
      icon: Home,
    },
    {
      name: '보도 사각지대',
      href: '/bias-issue',
      icon: FileText,
    },
    {
      name: '국내 쟁점 사안',
      href: '/controversial-issue',
      icon: Building2,
    },
    {
      name: '이슈별 흐름 아카이브',
      href: '/mediatrendflow',
      icon: FileText,
    },
    {
      name: '사전신청',
      href: 'https://docs.google.com/forms/d/e/1FAIpQLSfgcDFL_rNKWvf_jpSdRsidJ5FSZLBt6L2gyZzTqoS-hFHKJA/viewform?usp=dialog',
      icon: ExternalLink,
      external: true,
    },
  ]

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 bg-white rounded-full p-2 shadow-lg border border-gray-200" 
        onClick={() => setOpen(!open)}
      >
        <Menu size={24} />
      </button>

      {/* 모바일 오버레이 */}
      {open && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div className={`fixed md:static top-0 left-0 z-50 w-80 md:w-72 h-screen bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } md:block`}> 
        {/* 모바일 헤더 */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">메뉴</h2>
          <button 
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-4">
            <div className="mb-6 md:mb-8 flex flex-col items-center">
              <Image
                src="/KakaoTalk_Photo_2025-07-15-12-54-41.jpeg"
                alt="뉴스 리터러시 로고"
                width={96}
                height={96}
                className="w-20 h-20 md:w-24 md:h-24 object-contain mb-3"
                priority
                placeholder="blur"
                blurDataURL="/KakaoTalk_Photo_2025-07-15-12-54-41.jpeg"
              />
              <h3 className="text-sm md:text-base font-semibold text-gray-900 text-center">뉴스 리터러시</h3>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                if (item.external) {
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 px-4 py-3 md:py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
                      onClick={() => setOpen(false)}
                    >
                      <Icon size={20} />
                      <span className="font-medium text-sm md:text-base">{item.name}</span>
                    </a>
                  )
                }
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 md:py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <Icon size={20} />
                    <span className="font-medium text-sm md:text-base">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  )
} 