'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreateOrgPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    ideology: 5,
    logoUrl: ''
  })
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user?.email === 'herry0515@naver.com') {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
        router.replace('/')
      }
    }
    checkAdmin()
  }, [router])

  if (isAdmin === null) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 여기에 실제 제출 로직을 추가할 예정
    console.log('Form submitted:', formData)
    alert('조직이 성공적으로 생성되었습니다!')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
          <div className="flex items-center mb-8">
            <Building2 size={32} className="text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">새 언론사 생성</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                조직명 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="조직명을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                조직 설명 *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="조직에 대한 설명을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                웹사이트 URL
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
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
              <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                로고 URL
              </label>
              <input
                type="url"
                id="logoUrl"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-12 hover:bg-blue-700 transition-colors"
              >
                조직 생성하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 