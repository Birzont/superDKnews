"use client"

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface IssueSpecificChatbotProps {
  isOpen: boolean
  onClose: () => void
  issueData: any
  articles: any[]
}

export default function IssueSpecificChatbot({ isOpen, onClose, issueData, articles }: IssueSpecificChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: `안녕하세요! "${issueData?.related_major_issue || '이 사안'}"에 대한 전용 가이드입니다. 🗞️\n\n이 사안에 대해 궁금한 점이 있으시면 언제든 말씀해주세요!\n\n💡 도움말:\n• "사안 요약" - 이 사안의 핵심 내용\n• "성향별 차이" - 진보/중도/보수 관점 비교\n• "관련 기사" - 포함된 기사들 정보\n• "배경 설명" - 사안의 배경과 맥락\n• "관련 이슈" - 연관된 다른 사안들`,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateResponse = async (userInput: string): Promise<string> => {
    const input = userInput.toLowerCase().trim()
    
    // 사안 요약
    if (input.includes('요약') || input.includes('핵심') || input.includes('개요')) {
      return `📋 **사안 요약: ${issueData?.related_major_issue}**\n\n**기본 정보:**\n• 총 기사 수: ${issueData?.article_count || 0}개\n• 진보: ${issueData?.progressive_count || 0}개\n• 중도: ${issueData?.centrist_count || 0}개\n• 보수: ${issueData?.conservative_count || 0}개\n\n**진보적 관점:**\n${issueData?.progressive_title || '제목 없음'}\n${issueData?.progressive_body?.substring(0, 200) || '내용 없음'}...\n\n**중도적 관점:**\n${issueData?.centrist_title || '제목 없음'}\n${issueData?.centrist_body?.substring(0, 200) || '내용 없음'}...\n\n**보수적 관점:**\n${issueData?.conservative_title || '제목 없음'}\n${issueData?.conservative_body?.substring(0, 200) || '내용 없음'}...`
    }
    
    // 성향별 차이
    if (input.includes('성향') || input.includes('차이') || input.includes('비교') || input.includes('관점')) {
      const total = issueData?.article_count || 1
      const consRatio = Math.round(((issueData?.conservative_count || 0) / total) * 100)
      const centRatio = Math.round(((issueData?.centrist_count || 0) / total) * 100)
      const progRatio = Math.round(((issueData?.progressive_count || 0) / total) * 100)
      
      return `🔍 **성향별 관점 차이 분석**\n\n**기사 분포:**\n• 진보: ${progRatio}% (${issueData?.progressive_count || 0}개)\n• 중도: ${centRatio}% (${issueData?.centrist_count || 0}개)\n• 보수: ${consRatio}% (${issueData?.conservative_count || 0}개)\n\n**진보적 관점의 특징:**\n${issueData?.progressive_title || '제목 없음'}\n• ${issueData?.progressive_body?.substring(0, 150) || '내용 없음'}...\n\n**중도적 관점의 특징:**\n${issueData?.centrist_title || '제목 없음'}\n• ${issueData?.centrist_body?.substring(0, 150) || '내용 없음'}...\n\n**보수적 관점의 특징:**\n${issueData?.conservative_title || '제목 없음'}\n• ${issueData?.conservative_body?.substring(0, 150) || '내용 없음'}...\n\n💡 **분석 포인트:**\n• 제목에서 강조하는 키워드의 차이\n• 서술 방식과 톤의 차이\n• 인용하는 인물이나 기관의 차이\n• 배경 설명의 비중 차이`
    }
    
    // 관련 기사
    if (input.includes('기사') || input.includes('뉴스') || input.includes('언론')) {
      if (articles.length === 0) {
        return `📰 **관련 기사 정보**\n\n현재 ${issueData?.article_count || 0}개의 기사가 포함되어 있지만, 상세 정보를 불러올 수 없습니다.`
      }
      
      const progressiveArticles = articles.filter(a => a.press_ideology && a.press_ideology <= 3)
      const moderateArticles = articles.filter(a => a.press_ideology && a.press_ideology > 3 && a.press_ideology <= 5)
      const conservativeArticles = articles.filter(a => a.press_ideology && a.press_ideology > 5)
      
      return `📰 **포함된 기사 정보**\n\n**총 기사 수:** ${articles.length}개\n\n**성향별 분류:**\n• 진보: ${progressiveArticles.length}개\n• 중도: ${moderateArticles.length}개\n• 보수: ${conservativeArticles.length}개\n\n**주요 언론사:**\n${Array.from(new Set(articles.map(a => a.press))).slice(0, 5).join(', ')}\n\n**최신 기사:**\n${articles[0]?.title || '제목 없음'}\n- ${articles[0]?.press || '언론사 없음'} | ${articles[0]?.date ? new Date(articles[0].date).toLocaleDateString('ko-KR') : '날짜 없음'}`
    }
    
    // 배경 설명
    if (input.includes('배경') || input.includes('맥락') || input.includes('상황') || input.includes('전후')) {
      return `📚 **사안 배경 및 맥락**\n\n**사안명:** ${issueData?.related_major_issue}\n\n**발생 시점:** ${issueData?.date ? new Date(issueData.date).toLocaleDateString('ko-KR') : '날짜 정보 없음'}\n\n**관련 키워드:**\n${issueData?.keywords || '키워드 정보 없음'}\n\n**주요 특징:**\n• 이 사안은 ${issueData?.article_count || 0}개의 기사에서 다뤄진 주요 이슈입니다\n• 진보/중도/보수 언론사들이 각각 다른 관점에서 보도했습니다\n• 사회적 논쟁이 되고 있는 핵심 사안으로 보입니다\n\n**관련 기관/인물:**\n${issueData?.institution || '관련 기관 정보 없음'}`
    }
    
    // 관련 이슈
    if (input.includes('관련') || input.includes('연관') || input.includes('비슷') || input.includes('유사')) {
      return `🔗 **관련 이슈 및 연관 사안**\n\n**현재 사안:** ${issueData?.related_major_issue}\n\n**관련 분야:**\n• 정치: 정부 정책, 국회 논의\n• 사회: 여론 반응, 시민 의견\n• 경제: 경제적 영향, 정책 효과\n• 외교: 국제적 맥락, 외교 관계\n\n**유사한 이슈들:**\n• 정부 정책 관련 논란\n• 여야 간 정치적 갈등\n• 사회적 합의 도출 과정\n• 언론의 보도 방식 차이\n\n**참고할 만한 사안들:**\n• 최근 유사한 정치적 논란\n• 같은 주제의 다른 관점\n• 연관된 정책 이슈들`
    }
    
    // 도움말
    if (input.includes('도움') || input.includes('help') || input.includes('뭐')) {
      return `💡 **사안별 가이드 도움말**\n\n**사안 정보:**\n• "사안 요약" - 이 사안의 핵심 내용\n• "배경 설명" - 사안의 배경과 맥락\n\n**성향별 분석:**\n• "성향별 차이" - 진보/중도/보수 관점 비교\n• "관점 분석" - 각 성향별 특징 분석\n\n**기사 정보:**\n• "관련 기사" - 포함된 기사들 정보\n• "언론사별" - 언론사별 보도 차이\n\n**연관 정보:**\n• "관련 이슈" - 연관된 다른 사안들\n• "유사 사안" - 비슷한 정치적 논란\n\n무엇이든 궁금한 것이 있으시면 언제든 물어보세요! 😊`
    }
    
    // 기본 응답
    return `🤔 "${userInput}"에 대한 질문이군요!\n\n이 사안에 대해 다음 중 어떤 것을 도와드릴까요?\n\n📋 **사안 정보**\n• "사안 요약" - 이 사안의 핵심 내용\n• "배경 설명" - 사안의 배경과 맥락\n\n🔍 **성향별 분석**\n• "성향별 차이" - 진보/중도/보수 관점 비교\n• "관점 분석" - 각 성향별 특징 분석\n\n📰 **기사 정보**\n• "관련 기사" - 포함된 기사들 정보\n• "언론사별" - 언론사별 보도 차이\n\n🔗 **연관 정보**\n• "관련 이슈" - 연관된 다른 사안들\n• "유사 사안" - 비슷한 정치적 논란\n\n도움이 필요하시면 "도움말"이라고 말씀해주세요!`
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // 봇 응답 생성
    const response = await generateResponse(inputValue)
    
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* 헤더 */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center border-b border-blue-500">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-lg">📋</span>
          </div>
          <div>
            <h3 className="font-semibold">사안별 가이드</h3>
            <p className="text-xs text-blue-100">이 사안에 대한 전용 도우미</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="이 사안에 대해 질문하세요..."
            className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
} 