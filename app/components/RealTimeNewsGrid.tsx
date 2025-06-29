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
  included_article_ai_summary_descriptions: string | null
  imageurl: string | null
}

interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export default function RealTimeNewsGrid() {
  const [articles, setArticles] = useState<HomepageArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // 초기 데이터 로드
  useEffect(() => {
    fetchArticles()
  }, [])

  // 실시간 구독 설정
  useEffect(() => {
    const channel = supabase
      .channel('homepage_articles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'homepage_articles'
        },
        (payload) => {
          console.log('Real-time change detected:', payload)
          
          // 토스트 알림 추가
          const toastId = Date.now().toString()
          let message = ''
          let type: 'success' | 'error' | 'info' = 'info'
          
          if (payload.eventType === 'INSERT') {
            message = '새로운 뉴스가 추가되었습니다!'
            type = 'success'
            setArticles(prev => [...prev, payload.new as HomepageArticle])
          } else if (payload.eventType === 'UPDATE') {
            message = '뉴스가 업데이트되었습니다!'
            type = 'info'
            setArticles(prev => 
              prev.map(article => 
                article.news_post_id === payload.new.news_post_id 
                  ? payload.new as HomepageArticle 
                  : article
              )
            )
          } else if (payload.eventType === 'DELETE') {
            message = '뉴스가 삭제되었습니다!'
            type = 'error'
            setArticles(prev => 
              prev.filter(article => article.news_post_id !== payload.old.news_post_id)
            )
          }
          
          setToasts(prev => [...prev, { id: toastId, message, type }])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('homepage_articles')
        .select('*')
        .order('news_post_id', { ascending: true })

      if (error) {
        console.error('Error fetching articles:', error)
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
        return
      }

      console.log('Fetched articles:', data)
      setArticles(data || [])
    } catch (err) {
      console.error('Error fetching articles:', err)
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
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
            description={article.included_article_ai_summary_descriptions || '설명 없음'}
            imageUrl={article.imageurl || undefined}
            category="뉴스"
            ideology={5} // 기본값으로 중도 설정
            createdAt={new Date().toISOString()} // 현재 시간으로 설정
          />
        ))}
      </div>
    </>
  )
} 