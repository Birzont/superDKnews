"use client"

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import NewsCard from './NewsCard'
import Toast from './RealTimeToast'

interface HomepageArticle {
  news_post_id: string
  article_count: number | null
  included_article_ids: string | null
  included_article_ai_summary_titles: string | null
  included_article_ai_summary_descriptions_right: string | null
  included_article_ai_summary_descriptions_left: string | null
  included_article_ai_summary_descriptions_center: string | null
  imageurl: string | null
}

interface NewspaperArticle {
  newspaper_post_id: string
  news_post_ideology: number
}

interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface IdeologyStats {
  progressive: number;
  moderate: number;
  conservative: number;
  total: number;
  progressivePercent: number;
  moderatePercent: number;
  conservativePercent: number;
}

interface RealTimeNewsGridProps {
  selectedCategory: string
}

export default function RealTimeNewsGrid({ selectedCategory }: RealTimeNewsGridProps) {
  const [articles, setArticles] = useState<HomepageArticle[]>([])
  const [articleIdeologies, setArticleIdeologies] = useState<{[key: string]: number}>({})
  const [articleStats, setArticleStats] = useState<{[key: string]: IdeologyStats}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    fetchArticles()
  }, [selectedCategory])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      setError(null)
      let query = supabase.from('homepage_articles').select('*').eq('category', selectedCategory)
      const { data, error } = await query
      if (error) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
        return
      }
      setArticles(data || [])
      
      // 각 홈페이지 기사의 포함된 기사들의 성향을 계산
      await calculateArticleIdeologiesAndStats(data || [])
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const calculateArticleIdeologiesAndStats = async (homepageArticles: HomepageArticle[]) => {
    const ideologies: {[key: string]: number} = {}
    const stats: {[key: string]: IdeologyStats} = {}
    
    for (const article of homepageArticles) {
      if (!article.included_article_ids) {
        ideologies[article.news_post_id] = 5 // 기본값 중도
        stats[article.news_post_id] = {
          progressive: 0, moderate: 0, conservative: 0, total: 0,
          progressivePercent: 0, moderatePercent: 0, conservativePercent: 0
        }
        continue
      }

      try {
        // included_article_ids를 파싱
        let articleIds: string[] = []
        try {
          // JSON 배열 형태로 저장되어 있다고 가정
          articleIds = JSON.parse(article.included_article_ids) as string[]
        } catch {
          // 쉼표로 구분된 문자열 형태일 수도 있음
          articleIds = article.included_article_ids.split(',').map((id: string) => id.trim())
        }

        if (articleIds.length === 0) {
          ideologies[article.news_post_id] = 5 // 기본값 중도
          stats[article.news_post_id] = {
            progressive: 0, moderate: 0, conservative: 0, total: 0,
            progressivePercent: 0, moderatePercent: 0, conservativePercent: 0
          }
          continue
        }

        // 포함된 기사들의 성향 정보 가져오기
        const { data: newspaperArticles, error } = await supabase
          .from('newspaper_articles')
          .select('newspaper_post_id, news_post_ideology')
          .in('newspaper_post_id', articleIds)

        if (error || !newspaperArticles || newspaperArticles.length === 0) {
          ideologies[article.news_post_id] = 5 // 기본값 중도
          stats[article.news_post_id] = {
            progressive: 0, moderate: 0, conservative: 0, total: 0,
            progressivePercent: 0, moderatePercent: 0, conservativePercent: 0
          }
          continue
        }

        // 평균 성향 계산
        const validIdeologies = newspaperArticles
          .filter(a => a.news_post_ideology != null)
          .map(a => a.news_post_ideology)
        
        if (validIdeologies.length === 0) {
          ideologies[article.news_post_id] = 5 // 기본값 중도
        } else {
          const averageIdeology = validIdeologies.reduce((sum, ideology) => sum + ideology, 0) / validIdeologies.length
          ideologies[article.news_post_id] = Math.round(averageIdeology * 10) / 10 // 소수점 첫째 자리까지 반올림
        }

        // 성향별 개수 및 비율 계산
        let progressive = 0, moderate = 0, conservative = 0
        for (const ideology of validIdeologies) {
          if (ideology <= 3) progressive++
          else if (ideology <= 5) moderate++
          else conservative++
        }
        const total = validIdeologies.length
        stats[article.news_post_id] = {
          progressive,
          moderate,
          conservative,
          total,
          progressivePercent: total ? Math.round((progressive / total) * 100) : 0,
          moderatePercent: total ? Math.round((moderate / total) * 100) : 0,
          conservativePercent: total ? Math.round((conservative / total) * 100) : 0
        }
      } catch (err) {
        console.error('성향 계산 중 오류:', err)
        ideologies[article.news_post_id] = 5 // 기본값 중도
        stats[article.news_post_id] = {
          progressive: 0, moderate: 0, conservative: 0, total: 0,
          progressivePercent: 0, moderatePercent: 0, conservativePercent: 0
        }
      }
    }
    
    setArticleIdeologies(ideologies)
    setArticleStats(stats)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">뉴스를 불러오는 중...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchArticles}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">표시할 뉴스가 없습니다.</p>
          <button
            onClick={fetchArticles}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 토스트 알림들 */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      {/* 뉴스 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <NewsCard
            key={article.news_post_id}
            id={article.news_post_id}
            title={article.included_article_ai_summary_titles || '제목 없음'}
            description={
              (article.included_article_ai_summary_descriptions_right || '') + '\n' +
              (article.included_article_ai_summary_descriptions_left || '') + '\n' +
              (article.included_article_ai_summary_descriptions_center || '') || '설명 없음'
            }
            imageUrl={article.imageurl || undefined}
            category="뉴스"
            ideology={articleIdeologies[article.news_post_id] || 5}
            createdAt={new Date().toISOString()} // 현재 시간으로 설정
            ideologyStats={articleStats[article.news_post_id]}
          />
        ))}
      </div>
    </>
  )
} 