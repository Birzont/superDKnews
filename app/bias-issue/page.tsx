"use client"

import SideNav from '../components/SideNav'
import RealTimeNewsGrid from '../components/RealTimeNewsGrid'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function BiasIssuePage() {
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBiasIssues()
  }, [])

  const fetchBiasIssues = async () => {
    setLoading(true)
    // 진보 또는 보수 비율이 70% 이상인 이슈만
    const { data, error } = await supabase
      .from('issue_table')
      .select('*')
      .or('progressive_ratio.gte.70,conservative_ratio.gte.70')
      .order('created_at', { ascending: false })
    setIssues(data || [])
    setLoading(false)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNav />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bias Issue</h1>
            <p className="text-gray-600">진보 또는 보수 비율이 70% 이상인 이슈만 모아봅니다.</p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">뉴스를 불러오는 중...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {issues.map((issue) => (
                <RealTimeNewsGrid key={issue.id} selectedCategory={issue.category} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 