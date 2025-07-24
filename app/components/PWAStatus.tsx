'use client'

import { useState, useEffect } from 'react'

export default function PWAStatus() {
  const [isPWA, setIsPWA] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // PWA 모드 확인
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = (window.navigator as any).standalone === true
      setIsPWA(isStandalone || isInApp)
    }

    // 온라인 상태 확인
    const checkOnline = () => {
      setIsOnline(navigator.onLine)
    }

    checkPWA()
    checkOnline()

    // 이벤트 리스너 등록
    window.addEventListener('online', checkOnline)
    window.addEventListener('offline', checkOnline)
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkPWA)

    return () => {
      window.removeEventListener('online', checkOnline)
      window.removeEventListener('offline', checkOnline)
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkPWA)
    }
  }, [])

  if (!isPWA) return null

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {isOnline ? '온라인' : '오프라인'}
          </span>
        </div>
        <div className="mt-1">
          <span className="text-xs text-gray-500">PWA 모드</span>
        </div>
      </div>
    </div>
  )
} 