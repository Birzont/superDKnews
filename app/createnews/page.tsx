'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface MediaOutlet {
  id: string
  media_url: string
  media_description: string
  media_article_count: number
  media_ideology: number
  media_info: string
}

export default function CreateNewsPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: '',
    ideology: 5,
    imageUrl: '',
    authorMediaOutletId: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [mediaOutlets, setMediaOutlets] = useState<MediaOutlet[]>([])
  const [isLoadingOutlets, setIsLoadingOutlets] = useState(true)

  // 미디어 아웃렛 목록 가져오기
  useEffect(() => {
    const fetchMediaOutlets = async () => {
      try {
        const { data, error } = await supabase
          .from('media_outlets')
          .select('id, media_url, media_description, media_article_count, media_ideology, media_info')
          .order('media_article_count', { ascending: false }) // 기사 수가 많은 순으로 정렬

        if (error) {
          console.error('Error fetching media outlets:', error)
        } else {
          setMediaOutlets(data || [])
        }
      } catch (error) {
        console.error('Unexpected error fetching media outlets:', error)
      } finally {
        setIsLoadingOutlets(false)
      }
    }

    fetchMediaOutlets()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('newspaper_articles')
        .insert([
          {
            newspaper_post_id: crypto.randomUUID(),
            author_media_outlet_id: formData.authorMediaOutletId,
            news_post_title: formData.title,
            news_post_description: formData.description,
            news_post_url: formData.url || null,
            news_post_ideology: formData.ideology,
            image_url: formData.imageUrl || null,
            category: formData.category
          }
        ])

      if (error) {
        console.error('Error inserting news:', error)
        alert('뉴스 생성 중 오류가 발생했습니다: ' + error.message)
      } else {
        alert('뉴스가 성공적으로 생성되었습니다!')
        // 폼 초기화
        setFormData({
          title: '',
          description: '',
          url: '',
          category: '',
          ideology: 5,
          imageUrl: '',
          authorMediaOutletId: ''
        })
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('뉴스 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getIdeologyText = (ideology: number) => {
    if (ideology <= 3) return '진보'
    if (ideology <= 5) return '중도'
    return '보수'
  }

  const getMediaName = (mediaUrl: string) => {
    try {
      const url = new URL(mediaUrl)
      return url.hostname.replace('www.', '').replace('.co.kr', '').replace('.com', '')
    } catch {
      return mediaUrl
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          홈으로 돌아가기
        </Link>

        <div className="bg-white rounded-12 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">새 뉴스 생성</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                뉴스 제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="뉴스 제목을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                뉴스 설명 *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="뉴스에 대한 설명을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                뉴스 URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/news"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">카테고리를 선택하세요</option>
                <option value="정치">정치</option>
                <option value="경제">경제</option>
                <option value="사회">사회</option>
                <option value="기술">기술</option>
                <option value="환경">환경</option>
                <option value="교육">교육</option>
                <option value="건강">건강</option>
                <option value="문화">문화</option>
                <option value="스포츠">스포츠</option>
              </select>
            </div>

            <div>
              <label htmlFor="authorMediaOutletId" className="block text-sm font-medium text-gray-700 mb-2">
                미디어 아웃렛 *
              </label>
              {isLoadingOutlets ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-12 bg-gray-50">
                  미디어 아웃렛 목록을 불러오는 중...
                </div>
              ) : (
                <select
                  id="authorMediaOutletId"
                  name="authorMediaOutletId"
                  value={formData.authorMediaOutletId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">미디어 아웃렛을 선택하세요</option>
                  {mediaOutlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id}>
                      {getMediaName(outlet.media_url)} ({getIdeologyText(outlet.media_ideology)}) - {outlet.media_article_count}개 기사
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="ideology" className="block text-sm font-medium text-gray-700 mb-2">
                이념 성향 (1-10) *
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  id="ideology"
                  name="ideology"
                  min="1"
                  max="10"
                  value={formData.ideology}
                  onChange={handleChange}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-600 min-w-[60px]">
                  {formData.ideology}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>진보</span>
                <span>중도</span>
                <span>보수</span>
              </div>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                이미지 URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading || isLoadingOutlets}
                className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-12 hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? '업로드 중...' : '뉴스 생성하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 