import SideNav from './components/SideNav'
import RealTimeNewsGrid from './components/RealTimeNewsGrid'

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-50">
      <SideNav />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">뉴스 리터러시</h1>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">기훈 안녕</button>
            <p className="text-gray-600">다양한 관점의 뉴스를 읽고 분석해보세요</p>
          </div>
          
          <RealTimeNewsGrid />
        </div>
      </main>
    </div>
  )
} 