'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAManualInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isPWA, setIsPWA] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isChrome, setIsChrome] = useState(false)
  const [isSafari, setIsSafari] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // PWA 모드인지 확인
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = (window.navigator as any).standalone === true
      setIsPWA(isStandalone || isInApp)
    }

    // 플랫폼 및 브라우저 확인
    const checkPlatform = () => {
      const userAgent = navigator.userAgent
      const isAndroidDevice = /Android/.test(userAgent)
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent)
      const isChromeBrowser = /Chrome/.test(userAgent) && !/Edge/.test(userAgent)
      const isSafariBrowser = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
      
      setIsAndroid(isAndroidDevice)
      setIsIOS(isIOSDevice)
      setIsChrome(isChromeBrowser)
      setIsSafari(isSafariBrowser)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowButton(true)
    }

    checkPWA()
    checkPlatform()

    // PWA가 아닌 경우에만 설치 버튼 표시
    if (!isPWA) {
      window.addEventListener('beforeinstallprompt', handler)
      
      // 2초 후에 수동 설치 버튼 표시 (더 빠르게)
      const timer = setTimeout(() => {
        if (!isPWA) {
          setShowButton(true)
        }
      }, 2000)

      return () => {
        window.removeEventListener('beforeinstallprompt', handler)
        clearTimeout(timer)
      }
    }
  }, [isPWA])

  const handleInstallClick = async () => {
    setIsInstalling(true)
    
    try {
      if (deferredPrompt) {
        // Chrome/Android의 경우 브라우저 설치 프롬프트 사용
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
          console.log('사용자가 PWA 설치를 수락했습니다')
          setShowButton(false)
        } else {
          console.log('사용자가 PWA 설치를 거부했습니다')
          // 거부해도 수동 설치 가이드 제공
          showManualInstallGuide()
        }

        setDeferredPrompt(null)
      } else {
        // 수동 설치 가이드 표시
        showManualInstallGuide()
      }
    } catch (error) {
      console.error('설치 중 오류:', error)
      showManualInstallGuide()
    } finally {
      setIsInstalling(false)
    }
  }

  const showManualInstallGuide = () => {
    if (isIOS && isSafari) {
      alert(`📱 iOS Safari에서 설치하는 방법:

1️⃣ Safari 하단의 공유 버튼(□↑)을 탭하세요
2️⃣ "홈 화면에 추가"를 선택하세요
3️⃣ "추가"를 탭하세요

✅ 완료! 이제 홈 화면에서 앱처럼 사용할 수 있습니다!`)
    } else if (isAndroid && isChrome) {
      alert(`📱 Android Chrome에서 설치하는 방법:

1️⃣ 브라우저 주소창 옆의 메뉴 버튼(⋮)을 탭하세요
2️⃣ "앱 설치" 또는 "홈 화면에 추가"를 선택하세요
3️⃣ "설치"를 탭하세요

💡 또는 주소창에 "설치" 아이콘이 나타나면 그것을 탭하세요!`)
    } else if (isIOS) {
      alert(`📱 iOS에서 설치하는 방법:

1️⃣ 브라우저 하단의 공유 버튼(□↑)을 탭하세요
2️⃣ "홈 화면에 추가"를 선택하세요
3️⃣ "추가"를 탭하세요

✅ 완료! 이제 홈 화면에서 앱처럼 사용할 수 있습니다!`)
    } else if (isAndroid) {
      alert(`📱 Android에서 설치하는 방법:

1️⃣ 브라우저 메뉴 버튼(⋮)을 탭하세요
2️⃣ "앱 설치" 또는 "홈 화면에 추가"를 선택하세요
3️⃣ "설치"를 탭하세요

💡 또는 주소창에 "설치" 아이콘이 나타나면 그것을 탭하세요!`)
    } else {
      alert(`💻 데스크톱에서 설치하는 방법:

1️⃣ 브라우저 주소창 옆의 설치 아이콘(📱)을 클릭하세요
2️⃣ "설치"를 클릭하세요

💡 또는 브라우저 메뉴에서 "앱 설치"를 찾아보세요!`)
    }
  }

  // PWA 모드이거나 버튼이 표시되지 않으면 렌더링하지 않음
  if (isPWA || !showButton) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isInstalling ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium">설치 중...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">
              {isIOS ? '📱 홈 화면에 추가' : '📱 앱 설치'}
            </span>
          </>
        )}
      </button>
    </div>
  )
} 