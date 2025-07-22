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
  }, [])

  const fetchBiasIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('is_bias_issue', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setIssues(data || [])
    } catch (error) {
      console.error('Error fetching bias issues:', error)
    } finally {
      setLoading(false)
    }
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
              issuesOverride={issues.filter(issue => issue.category === selectedCategory)}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </main>
    </div>
  )
} 