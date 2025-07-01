"use client"

import SideNav from './components/SideNav'
import RealTimeNewsGrid from './components/RealTimeNewsGrid'
import { useState } from 'react'

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

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNav />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">뉴스 리터러시</h1>
            <p className="text-gray-600">다양한 관점의 뉴스를 읽고 분석해보세요</p>
          </div>
          
          {/* 카테고리 네비게이션 */}
          <nav className="flex space-x-8 mb-8 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.key}
                className={`text-lg font-semibold px-4 py-2 rounded transition-colors ${selectedCategory === cat.key ? 'text-black border-b-2 border-black' : 'text-gray-700 hover:text-black'}`}
                onClick={() => setSelectedCategory(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </nav>

          {/* 선택된 카테고리 prop 전달 */}
          <RealTimeNewsGrid selectedCategory={selectedCategory} />
        </div>
      </main>
    </div>
  )
} 