"use client"

import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface ChatbotProps {
  isOpen: boolean
  onClose: () => void
}

interface Issue {
  id: string;
  related_major_issue: string;
  conservative_title: string;
  conservative_body: string;
  centrist_title: string;
  centrist_body: string;
  progressive_title: string;
  progressive_body: string;
  conservative_count: number;
  centrist_count: number;
  progressive_count: number;
  article_count: number;
}

export default function NewsGuideChatbot({ isOpen, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: '안녕하세요! 시사 뉴스 가이드입니다. 🗞️\n\n진보/보수/중도 개념을 배우거나, 실제 기사에서 각 성향별 관점 차이를 분석해보고 싶으시다면 언제든 말씀해주세요!\n\n💡 도움말:\n• "진보란?" - 진보 개념 학습\n• "보수란?" - 보수 개념 학습\n• "중도란?" - 중도 개념 학습\n• "기사 분석" - 실제 기사에서 성향별 차이 분석\n• "시사 상식" - 국제/외교 상식',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentIssues, setCurrentIssues] = useState<Issue[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchCurrentIssues()
  }, [])

  const fetchCurrentIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issue_table')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (error) throw error
      setCurrentIssues(data || [])
    } catch (error) {
      console.error('이슈 데이터 로딩 실패:', error)
    }
  }

  const knowledgeBase = {
    진보: {
      개념: "진보(進步)는 사회의 변화와 발전을 추구하는 정치적 성향입니다.",
      특징: [
        "사회적 평등과 공정성 중시",
        "정부의 적극적 역할 지지",
        "노동자 권리와 복지 확대",
        "환경보호와 지속가능한 발전",
        "다문화주의와 포용적 사회 지향"
      ],
      정책방향: {
        경제: "재분배 정책, 최저임금 인상, 공공서비스 확대",
        사회: "복지 확대, 차별 금지, 인권 보호",
        외교: "다자주의, 국제협력, 평화외교",
        국방: "대화와 협상 중시, 군비축소"
      },
      언론특징: [
        "정부 정책에 대한 비판적 시각",
        "사회적 약자 관점에서의 보도",
        "진보적 가치 강조",
        "변화와 개혁의 필요성 부각"
      ]
    },
    보수: {
      개념: "보수(保守)는 전통적 가치와 질서를 유지하려는 정치적 성향입니다.",
      특징: [
        "전통과 질서 중시",
        "자유시장 경제 지지",
        "강력한 국가안보 추구",
        "가족과 공동체 가치 강조",
        "점진적 변화 선호"
      ],
      정책방향: {
        경제: "시장경제 원리, 규제 완화, 기업 친화적 정책",
        사회: "전통적 가치 보호, 개인 책임 강조",
        외교: "동맹국과의 강화, 국가이익 우선",
        국방: "강력한 국방력 구축, 안보 우선"
      },
      언론특징: [
        "정부 정책에 대한 지지적 시각",
        "국가안보와 질서 중시",
        "보수적 가치 강조",
        "안정과 전통의 중요성 부각"
      ]
    },
    중도: {
      개념: "중도(中道)는 극단적 입장을 피하고 실용적 해결책을 추구하는 정치적 성향입니다.",
      특징: [
        "실용주의와 합리성 중시",
        "양쪽 입장의 장점 수용",
        "대화와 타협 지향",
        "현실적 문제해결 추구",
        "이념보다 실질적 성과 중시"
      ],
      정책방향: {
        경제: "균형잡힌 경제정책, 시장과 정부 역할 조화",
        사회: "포용적 사회정책, 대화와 타협",
        외교: "균형외교, 실용적 국제관계",
        국방: "적절한 국방력, 평화적 해결 추구"
      },
      언론특징: [
        "객관적이고 균형잡힌 보도",
        "양쪽 입장 모두 제시",
        "실용적 관점에서의 분석",
        "극단적 표현 지양"
      ]
    }
  }

  const generateResponse = async (userInput: string): Promise<string> => {
    const input = userInput.toLowerCase().trim()
    
    // 진보/보수/중도 개념 질문
    if (input.includes('진보') && (input.includes('뭐') || input.includes('란') || input.includes('개념'))) {
      const 진보 = knowledgeBase.진보
      return `📚 **진보(進步)란?**\n\n${진보.개념}\n\n**주요 특징:**\n${진보.특징.map(f => `• ${f}`).join('\n')}\n\n**정책 방향:**\n• 경제: ${진보.정책방향.경제}\n• 사회: ${진보.정책방향.사회}\n• 외교: ${진보.정책방향.외교}\n• 국방: ${진보.정책방향.국방}\n\n**언론 특징:**\n${진보.언론특징.map(f => `• ${f}`).join('\n')}`
    }
    
    if (input.includes('보수') && (input.includes('뭐') || input.includes('란') || input.includes('개념'))) {
      const 보수 = knowledgeBase.보수
      return `📚 **보수(保守)란?**\n\n${보수.개념}\n\n**주요 특징:**\n${보수.특징.map(f => `• ${f}`).join('\n')}\n\n**정책 방향:**\n• 경제: ${보수.정책방향.경제}\n• 사회: ${보수.정책방향.사회}\n• 외교: ${보수.정책방향.외교}\n• 국방: ${보수.정책방향.국방}\n\n**언론 특징:**\n${보수.언론특징.map(f => `• ${f}`).join('\n')}`
    }
    
    if (input.includes('중도') && (input.includes('뭐') || input.includes('란') || input.includes('개념'))) {
      const 중도 = knowledgeBase.중도
      return `📚 **중도(中道)란?**\n\n${중도.개념}\n\n**주요 특징:**\n${중도.특징.map(f => `• ${f}`).join('\n')}\n\n**정책 방향:**\n• 경제: ${중도.정책방향.경제}\n• 사회: ${중도.정책방향.사회}\n• 외교: ${중도.정책방향.외교}\n• 국방: ${중도.정책방향.국방}\n\n**언론 특징:**\n${중도.언론특징.map(f => `• ${f}`).join('\n')}`
    }
    
    // 기사 분석
    if (input.includes('기사') || input.includes('분석') || input.includes('비교')) {
      if (currentIssues.length === 0) {
        return `📰 **기사 분석**\n\n현재 분석할 수 있는 기사가 없습니다. 잠시 후 다시 시도해주세요.`
      }
      
      const latestIssue = currentIssues[0]
      const total = latestIssue.article_count || 1
      const consRatio = Math.round((latestIssue.conservative_count / total) * 100)
      const centRatio = Math.round((latestIssue.centrist_count / total) * 100)
      const progRatio = Math.round((latestIssue.progressive_count / total) * 100)
      
      return `📰 **실제 기사 분석: ${latestIssue.related_major_issue}**\n\n**기사 분포:**\n• 진보: ${progRatio}% (${latestIssue.progressive_count}개)\n• 중도: ${centRatio}% (${latestIssue.centrist_count}개)\n• 보수: ${consRatio}% (${latestIssue.conservative_count}개)\n\n**진보적 관점:**\n제목: ${latestIssue.progressive_title}\n내용: ${latestIssue.progressive_body?.substring(0, 200)}...\n\n**중도적 관점:**\n제목: ${latestIssue.centrist_title}\n내용: ${latestIssue.centrist_body?.substring(0, 200)}...\n\n**보수적 관점:**\n제목: ${latestIssue.conservative_title}\n내용: ${latestIssue.conservative_body?.substring(0, 200)}...\n\n💡 **분석 포인트:**\n• 제목에서 강조하는 키워드의 차이\n• 서술 방식과 톤의 차이\n• 인용하는 인물이나 기관의 차이\n• 배경 설명의 비중 차이`
    }
    
    // 시사 상식
    if (input.includes('시사') || input.includes('상식') || input.includes('외교')) {
      return `🌍 **시사 상식**\n\n**주요 국제기구:**\n• UN(유엔): 국제평화와 안보 유지\n• WTO(세계무역기구): 국제무역 규칙 관리\n• IMF(국제통화기금): 국제금융 안정\n• NATO(북대서양조약기구): 서방 안보동맹\n\n**한국의 주요 외교관계:**\n• 한미동맹: 한국 안보의 핵심\n• 한중관계: 경제협력과 전략적 동반자\n• 한일관계: 역사문제와 경제협력\n• 북핵문제: 한반도 평화의 핵심 이슈\n\n**최근 주요 이슈:**\n• 미중 무역갈등\n• 러시아-우크라이나 전쟁\n• 기후변화 대응\n• 디지털 경제 규제`
    }
    
    // 도움말
    if (input.includes('도움') || input.includes('help') || input.includes('뭐')) {
      return `💡 **뉴스 가이드 도움말**\n\n**개념 학습:**\n• "진보란?" - 진보 개념과 특징\n• "보수란?" - 보수 개념과 특징\n• "중도란?" - 중도 개념과 특징\n\n**실제 기사 분석:**\n• "기사 분석" - 실제 기사에서 성향별 차이 분석\n• "비교" - 최신 이슈의 성향별 관점 비교\n\n**시사 상식:**\n• "시사 상식" - 국제기구와 외교관계\n\n무엇이든 궁금한 것이 있으시면 언제든 물어보세요! 😊`
    }
    
    // 기본 응답
    return `🤔 "${userInput}"에 대한 질문이군요!\n\n다음 중 어떤 것을 도와드릴까요?\n\n📚 **개념 학습**\n• "진보란?" - 진보 개념 학습\n• "보수란?" - 보수 개념 학습\n• "중도란?" - 중도 개념 학습\n\n📰 **실제 기사 분석**\n• "기사 분석" - 실제 기사에서 성향별 차이 분석\n• "비교" - 최신 이슈의 성향별 관점 비교\n\n🌍 **시사 상식**\n• "시사 상식" - 국제기구와 외교관계\n\n도움이 필요하시면 "도움말"이라고 말씀해주세요!`
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
            <span className="text-blue-600 text-lg">🗞️</span>
          </div>
          <div>
            <h3 className="font-semibold">뉴스 가이드</h3>
            <p className="text-xs text-blue-100">시사 입문자를 위한 친구</p>
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
            placeholder="질문을 입력하세요..."
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