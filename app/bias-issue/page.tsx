"use client"

import SideNav from '../components/SideNav'
import RealTimeNewsGrid from '../components/RealTimeNewsGrid'
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
      <main className="flex-1 overflow-auto bg-gradient-to-b from-gray-100 to-white relative">
        {/* 상단 헤더 */}
        <div className="w-[1600px] mx-auto pt-10 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-left font-pretendard">보도 사각지대</h1>
          <p className="text-base text-gray-500 text-left font-pretendard">언론에서 덜 다뤄진 이슈들을 확인하세요.</p>
        </div>
        {/* 중앙 카드 */}
        <div className="w-[1600px] mx-auto mt-12 mb-8 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* 카테고리 탭 */}
            <div className="flex space-x-1 mb-8">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
            {/* 뉴스 그리드 */}
            <RealTimeNewsGrid 
              selectedCategory={selectedCategory} 
              issuesOverride={issues}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </main>
    </div>
  )
} 