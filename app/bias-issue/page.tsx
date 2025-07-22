"use client"

import SideNav from '../components/SideNav'
import RealTimeNewsGrid from '../components/RealTimeNewsGrid'
import BackButton from '../components/BackButton'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function BiasIssuePage() {
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('정치')
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

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

  useEffect(() => {
    fetchBiasIssues()
  }, [selectedCategory])

  // 브라우저 히스토리 관리
  useEffect(() => {
    const currentUrl = new URL(window.location.href)
    if (selectedCategory !== '정치') {
      currentUrl.searchParams.set('category', selectedCategory)
    }
    if (searchQuery) {
      currentUrl.searchParams.set('search', searchQuery)
    }
    
    window.history.replaceState(
      { 
        category: selectedCategory, 
        search: searchQuery,
        timestamp: Date.now()
      }, 
      '', 
      currentUrl.toString()
    )
  }, [selectedCategory, searchQuery])

  // 카테고리 변경 시 히스토리 업데이트
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    
    const currentUrl = new URL(window.location.href)
    if (category !== '정치') {
      currentUrl.searchParams.set('category', category)
    } else {
      currentUrl.searchParams.delete('category')
    }
    
    window.history.pushState(
      { 
        category, 
        search: searchQuery,
        timestamp: Date.now()
      }, 
      '', 
      currentUrl.toString()
    )
  }

  // 브라우저 뒤로가기/앞으로가기 처리
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        setSelectedCategory(event.state.category || '정치')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const fetchBiasIssues = async () => {
    setLoading(true)
    // article_count 대비 보수 또는 진보 비율이 70% 이상인 이슈만
    const { data, error } = await supabase
      .from('issue_table')
      .select('*')
      .eq('category', selectedCategory)
      .order('created_at', { ascending: false })
    // 필터링: conservative_count/article_count >= 0.7 또는 progressive_count/article_count >= 0.7
    const filtered = (data || []).filter(issue => {
      const total = issue.article_count || 0
      if (!total) return false
      const cons = issue.conservative_count || 0
      const prog = issue.progressive_count || 0
      // 기존 조건: 보수 또는 진보 비율이 70% 이상
      // 추가 조건: 진보가 0이거나 보수가 0인 경우도 포함
      return cons / total >= 0.7 || prog / total >= 0.7 || cons === 0 || prog === 0
    })
    
    // 보수 %가 높은 순으로 정렬
    const sorted = filtered.sort((a, b) => {
      const aTotal = a.article_count || 0
      const bTotal = b.article_count || 0
      const aConsRatio = aTotal > 0 ? (a.conservative_count || 0) / aTotal : 0
      const bConsRatio = bTotal > 0 ? (b.conservative_count || 0) / bTotal : 0
      return bConsRatio - aConsRatio // 내림차순 정렬 (높은 순)
    })
    
    setIssues(sorted)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav />
      <div className="flex-1 flex flex-col">
        {/* 메인 콘텐츠 */}
        <div className="flex-1 p-6">
          {/* 뒤로가기 버튼 */}
          <BackButton />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-left font-pretendard">보도 사각지대</h1>
            <p className="text-base text-gray-500 text-left font-pretendard">
              {searchQuery 
                ? `"${searchQuery}" 검색 결과 - ${selectedCategory} 카테고리의 특정 진영만 보도하는 주제`
                : `${selectedCategory} 카테고리의 특정 진영만 보도하는 주제를 찾아, 언론의 공백을 확인해보세요.`
              }
            </p>
          </div>

          {/* 카테고리 네비게이션 */}
          <div className="bg-white border border-gray-200 rounded-lg px-6 py-4 mb-6">
            <div className="flex space-x-1 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => handleCategoryChange(category.key)}
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

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">뉴스를 불러오는 중...</span>
            </div>
          ) : (
            <RealTimeNewsGrid 
              selectedCategory={selectedCategory} 
              issuesOverride={issues} 
              searchQuery={searchQuery}
            />
          )}
        </div>
      </div>
    </div>
  )
} 