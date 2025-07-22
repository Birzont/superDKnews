"use client"

import { useState } from 'react'
import NewsGuideChatbot from './NewsGuideChatbot'

export default function ChatbotToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center z-[9999] group border-2 border-white"
        aria-label="뉴스 가이드 챗봇 열기"
      >
        <div className="relative">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          
          {/* 알림 뱃지 */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse border border-white"></div>
        </div>
        
        {/* 툴팁 */}
        <div className="absolute right-20 bottom-2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
          뉴스 가이드 챗봇
        </div>
      </button>

      {/* 챗봇 컴포넌트 */}
      <NewsGuideChatbot 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  )
} 