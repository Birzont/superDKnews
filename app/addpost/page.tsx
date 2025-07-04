'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Check, Plus, X, Save } from 'lucide-react'
import SideNav from '../components/SideNav'
import { useRouter } from 'next/navigation'

interface NewsArticle {
  newspaper_post_id: string
  news_post_title: string
  news_post_description: string
  news_post_url: string
  image_url: string | null
  category: string | null
  major_cat_n: number | null
  created_at: string
}

interface HomepageArticle {
  news_post_id: string
  article_count: number
  included_article_ids: string
  included_article_ai_summary_titles: string
  included_article_ai_summary_descriptions_right: string
  included_article_ai_summary_descriptions_left: string
  included_article_ai_summary_descriptions_center: string
  ai_summary_title: string
  ai_summary_description: string
}

export default function AddPostPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [selectedArticles, setSelectedArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [summaryTitle, setSummaryTitle] = useState('')
  const [summaryDescriptionRight, setSummaryDescriptionRight] = useState('')
  const [summaryDescriptionLeft, setSummaryDescriptionLeft] = useState('')
  const [summaryDescriptionCenter, setSummaryDescriptionCenter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [homepageCategory, setHomepageCategory] = useState('')
  const [homepageImageUrl, setHomepageImageUrl] = useState('')
  const [majorCatN, setMajorCatN] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email === 'herry0515@naver.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.replace('/');
      }
    };
    checkAdmin();
  }, [router]);

  useEffect(() => {
    fetchArticles()
  }, [])

  useEffect(() => {
    fetchArticles()
    // eslint-disable-next-line
  }, [majorCatN, categoryFilter])

  // major cat이나 카테고리가 변경될 때 해당하는 기사들을 자동으로 선택
  useEffect(() => {
    if (majorCatN || categoryFilter) {
      const filteredArticles = articles.filter(article => {
        const matchesMajorCat = !majorCatN || article.major_cat_n === parseInt(majorCatN)
        const matchesCategory = !categoryFilter || article.category === categoryFilter
        return matchesMajorCat && matchesCategory
      })
      setSelectedArticles(filteredArticles)
    } else {
      // 필터가 없으면 선택 해제
      setSelectedArticles([])
    }
  }, [majorCatN, categoryFilter, articles])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('newspaper_articles')
        .select('*')
        .order('created_at', { ascending: false })

      if (majorCatN) {
        query = query.eq('major_cat_n', majorCatN)
      }
      if (categoryFilter) {
        query = query.eq('category', categoryFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setArticles(data || [])
    } catch (error) {
      console.error('기사 로딩 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleArticleSelection = (article: NewsArticle) => {
    setSelectedArticles(prev => {
      const isSelected = prev.some(a => a.newspaper_post_id === article.newspaper_post_id)
      if (isSelected) {
        return prev.filter(a => a.newspaper_post_id !== article.newspaper_post_id)
      } else {
        return [...prev, article]
      }
    })
  }

  const removeSelectedArticle = (articleId: string) => {
    setSelectedArticles(prev => prev.filter(a => a.newspaper_post_id !== articleId))
  }

  const saveHomepageArticle = async () => {
    if (selectedArticles.length === 0) {
      alert('최소 하나의 기사를 선택해주세요.')
      return
    }

    if (!summaryTitle.trim() || !summaryDescriptionRight.trim() || !summaryDescriptionLeft.trim() || !summaryDescriptionCenter.trim()) {
      alert('요약 제목과 모든 성향별 설명을 입력해주세요.')
      return
    }

    if (!homepageCategory) {
      alert('카테고리를 선택해주세요.')
      return
    }

    if (!homepageImageUrl.trim()) {
      alert('이미지 URL을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const homepageArticle = {
        article_count: selectedArticles.length,
        included_article_ids: selectedArticles.map(a => a.newspaper_post_id).join(','),
        included_article_ai_summary_titles: summaryTitle,
        included_article_ai_summary_descriptions_right: summaryDescriptionRight,
        included_article_ai_summary_descriptions_left: summaryDescriptionLeft,
        included_article_ai_summary_descriptions_center: summaryDescriptionCenter,
        category: homepageCategory,
        imageurl: homepageImageUrl,
      }

      const { error } = await supabase
        .from('homepage_articles')
        .insert([homepageArticle])

      if (error) throw error

      alert('성공적으로 저장되었습니다!')
      setSelectedArticles([])
      setSummaryTitle('')
      setSummaryDescriptionRight('')
      setSummaryDescriptionLeft('')
      setSummaryDescriptionCenter('')
      setHomepageCategory('')
      setHomepageImageUrl('')
    } catch (error) {
      console.error('저장 중 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.news_post_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.news_post_description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || article.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // 고정 카테고리 목록
  const fixedCategories = [
    '정치',
    '경제',
    '사회',
    '국제',
    '문화',
    '스포츠',
    'IT/과학',
    '생활/건강',
  ];

  // 자동 기사/요약 채우기 함수
  const handleAutoFillFromHomepageArticles = async () => {
    if (!majorCatN || !homepageCategory) {
      alert('Major Cat과 카테고리를 모두 선택하세요.')
      return
    }
    const { data, error } = await supabase
      .from('homepage_articles')
      .select('*')
      .eq('major_cat_n', majorCatN)
      .eq('category', homepageCategory)
      .limit(1)
      .single()
    if (error || !data) {
      alert('조건에 맞는 homepage_articles 데이터가 없습니다.')
      return
    }
    // 요약 필드 자동 입력
    setSummaryTitle(data.included_article_ai_summary_titles || '')
    setSummaryDescriptionRight(data.included_article_ai_summary_descriptions_right || '')
    setSummaryDescriptionLeft(data.included_article_ai_summary_descriptions_left || '')
    setSummaryDescriptionCenter(data.included_article_ai_summary_descriptions_center || '')
    // 기사 자동 선택
    let articleIds: string[] = []
    try {
      articleIds = JSON.parse(data.included_article_ids)
    } catch {
      articleIds = (data.included_article_ids || '').split(',').map((id: string) => id.trim())
    }
    const autoSelected = articles.filter(a => articleIds.includes(a.newspaper_post_id))
    setSelectedArticles(autoSelected)
  }

  if (isAdmin === null) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNav />
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm border-b p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">홈페이지 기사 생성</h1>
          <p className="text-gray-600">뉴스 기사들을 선택하고 요약을 작성하세요</p>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* 왼쪽: 기사 선택 영역 */}
          <div className="w-2/3 p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="flex gap-4 mb-4">
                <div>
                  <select
                    value={majorCatN}
                    onChange={e => setMajorCatN(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mr-2"
                  >
                    <option value="">전체 Major Cat</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="기사 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={categoryFilter || ''}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">모든 카테고리</option>
                  {fixedCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* 모두 포함 버튼 */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSelectedArticles(filteredArticles)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  모두 포함
                </button>
                <button
                  onClick={() => setSelectedArticles([])}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  모두 해제
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredArticles.map((article) => {
                const isSelected = selectedArticles.some(a => a.newspaper_post_id === article.newspaper_post_id)
                return (
                  <div
                    key={article.newspaper_post_id}
                    className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => toggleArticleSelection(article)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {article.news_post_title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-3">
                          {article.news_post_description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {article.category && (
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {article.category}
                            </span>
                          )}
                          <span>
                            {new Date(article.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 오른쪽: 선택된 기사 및 요약 작성 영역 */}
          <div className="w-1/3 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                선택된 기사 ({selectedArticles.length})
              </h2>
              <div className="flex gap-2 mb-4">
                <select
                  value={majorCatN}
                  onChange={e => setMajorCatN(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Major Cat 선택</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                <select
                  value={homepageCategory}
                  onChange={e => setHomepageCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">카테고리 선택</option>
                  {fixedCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAutoFillFromHomepageArticles}
                className="mb-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                기사 자동 추가
              </button>
              
              {selectedArticles.length > 0 && (
                <div className="space-y-3 mb-6">
                  {selectedArticles.map((article) => (
                    <div key={article.newspaper_post_id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                            {article.news_post_title}
                          </h4>
                        </div>
                        <button
                          onClick={() => removeSelectedArticle(article.newspaper_post_id)}
                          className="ml-2 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    요약 제목
                  </label>
                  <input
                    type="text"
                    value={summaryTitle}
                    onChange={(e) => setSummaryTitle(e.target.value)}
                    placeholder="요약 제목을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    요약 설명 (보수)
                  </label>
                  <textarea
                    value={summaryDescriptionRight}
                    onChange={(e) => setSummaryDescriptionRight(e.target.value)}
                    placeholder="요약된 보수성향 기사 설명을 입력하세요"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    요약 설명 (진보)
                  </label>
                  <textarea
                    value={summaryDescriptionLeft}
                    onChange={(e) => setSummaryDescriptionLeft(e.target.value)}
                    placeholder="요약된 진보성향 기사 설명을 입력하세요"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    요약 설명 (중도)
                  </label>
                  <textarea
                    value={summaryDescriptionCenter}
                    onChange={(e) => setSummaryDescriptionCenter(e.target.value)}
                    placeholder="요약된 중도성향 기사 설명을 입력하세요"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이미지 URL
                  </label>
                  <input
                    type="text"
                    value={homepageImageUrl}
                    onChange={e => setHomepageImageUrl(e.target.value)}
                    placeholder="대표 이미지 URL을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={saveHomepageArticle}
                  disabled={saving || selectedArticles.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      홈페이지 기사 저장
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 