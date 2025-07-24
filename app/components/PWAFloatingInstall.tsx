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

export default function PWAFloatingInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isPWA, setIsPWA] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isChrome, setIsChrome] = useState(false)
  const [isSafari, setIsSafari] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

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
      
      // 1초 후에 플로팅 설치 버튼 표시 (매우 빠르게)
      const timer = setTimeout(() => {
        if (!isPWA) {
          setShowButton(true)
        }
      }, 1000)

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
    <div className="fixed bottom-6 right-6 z-50">
      {/* 툴팁 */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-3 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium mb-1">📱 앱 설치</p>
              <p className="text-gray-300 text-xs leading-relaxed">
                DKnewsSUPER를 홈 화면에 추가하여 더 빠르게 접근하고 오프라인에서도 사용하세요!
              </p>
            </div>
          </div>
          {/* 화살표 */}
          <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
      
      {/* 플로팅 설치 버튼 */}
      <button
        onClick={handleInstallClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={isInstalling}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isInstalling ? (
          <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  )
} 