"use client"

import SideNav from './components/SideNav'
import RealTimeNewsGrid from './components/RealTimeNewsGrid'
import { useState } from 'react'
import { Search, X } from 'lucide-react'

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
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // 검색 실행 (RealTimeNewsGrid에서 처리)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNav />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-left font-pretendard">뉴스 리터러시</h1>
            <p className="text-base text-gray-500 text-left font-pretendard">다양한 관점의 뉴스를 읽고 분석해보세요</p>
          </div>
          
          {/* 검색 기능 */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="키워드를 입력하여 뉴스를 검색하세요..."
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <div className="mt-2 text-sm text-gray-600 text-center">
                  <span className="font-medium">"{searchQuery}"</span>로 검색 중...
                </div>
              )}
            </form>
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

          {/* 선택된 카테고리와 검색어 prop 전달 */}
          <RealTimeNewsGrid 
            selectedCategory={selectedCategory} 
            searchQuery={searchQuery}
          />
        </div>
      </main>
    </div>
  )
} 