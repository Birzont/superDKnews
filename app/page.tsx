"use client"

import SideNav from './components/SideNav'
import RealTimeNewsGrid from './components/RealTimeNewsGrid'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function Home() {
  // 카테고리 상태 관리
  const categories = [
    { key: '정치', label: '정치' },
    { key: '경제', label: '경제' },
    { key: '사회', label: '사회' },
    { key: '국제', label: '국제' },
    { key: '문화', label: '문화' },
    { key: '스포츠', label: '스포츠' },
    { key: 'IT/과학', label: 'IT/과학' },
    { key: '생활/건강', label: '생활/건강' },
  ]
  const [selectedCategory, setSelectedCategory] = useState('정치')
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav />
      <div className="flex-1 flex flex-col">
        {/* 메인 콘텐츠 */}
        <div className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-left font-pretendard">뉴스 한누네</h1>
            <p className="text-base text-gray-500 text-left font-pretendard">
              {searchQuery 
                ? `"${searchQuery}" 검색 결과 - 오늘의 주요 이슈를 진보·중도·보수 관점으로 한눈에 비교해보세요`
                : "오늘의 주요 이슈를 진보·중도·보수 관점으로 한눈에 비교해보세요."
              }
            </p>
          </div>

          {/* 카테고리 네비게이션 */}
          <div className="bg-white border border-gray-200 rounded-lg px-6 py-4 mb-6">
            <div className="flex space-x-1 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <RealTimeNewsGrid 
            selectedCategory={selectedCategory} 
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </div>
  )
} 