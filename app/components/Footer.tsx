import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 회사 정보 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-pretendard">한누네 주식회사</h3>
            <div className="space-y-2 text-sm text-gray-300 font-pretendard">
              <p>대표자: 김도균</p>
              <p>사업자등록번호: 123-45-67890</p>
              <p>통신판매업 신고번호: 2025-서울마포-0000</p>
              <p>주소: 서울특별시 마포구 와우산로 94 홍익대학교</p>
              <p>대표전화: 010-3863-1636</p>
              <p>이메일: rlaehrbs0515@khu.ac.kr</p>
            </div>
          </div>

          {/* 회사 링크 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-pretendard">회사</h3>
            <ul className="space-y-2 text-sm text-gray-300 font-pretendard">
              <li><Link href="#" className="hover:text-white transition-colors">한누네 소개</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">뉴스레터 구독</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">광고 및 제휴 문의</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">인재 채용</Link></li>
            </ul>
          </div>

          {/* 서비스 링크 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-pretendard">서비스</h3>
            <ul className="space-y-2 text-sm text-gray-300 font-pretendard">
              <li><Link href="#" className="hover:text-white transition-colors">서비스 이용약관</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">고객센터</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">앱 다운로드</Link></li>
            </ul>
          </div>
        </div>

        {/* 저작권 정보 */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400 font-pretendard">
            © 2025 한누네 주식회사. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 