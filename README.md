# DK News Super - 뉴스 리터러시 플랫폼

뉴스 리터러시를 위한 현대적인 웹 플랫폼입니다. 다양한 관점의 뉴스를 읽고 분석할 수 있습니다.

## 기능

- **메인 페이지**: 뉴스 카드들을 그리드 형태로 표시
- **뉴스 상세 페이지**: 개별 뉴스의 상세 정보 표시
- **뉴스 생성**: 새로운 뉴스 기사 추가 (Supabase 연동)
- **조직 생성**: 뉴스 미디어 조직 정보 추가
- **이념 성향 표시**: 뉴스와 조직의 이념 성향을 시각적으로 표시

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Client**: @supabase/supabase-js

## 환경 설정

### 1. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. 프로젝트 설정에서 URL과 anon key를 복사합니다.

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. 데이터베이스 스키마

Supabase SQL 편집기에서 다음 SQL을 실행하여 테이블을 생성합니다:

```sql
-- 미디어 아웃렛 테이블 생성
CREATE TABLE media_outlets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_url TEXT NOT NULL,
  media_description TEXT,
  media_article_count INTEGER DEFAULT 0,
  media_ideology INTEGER NOT NULL,
  media_info TEXT
);

-- 뉴스 아티클 테이블 생성
CREATE TABLE newspaper_articles (
  newspaper_post_id UUID PRIMARY KEY,
  author_media_outlet_id UUID REFERENCES media_outlets(id),
  news_post_title TEXT NOT NULL,
  news_post_description TEXT NOT NULL,
  news_post_url TEXT,
  news_post_ideology INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT NOT NULL
);

-- 샘플 미디어 아웃렛 데이터 삽입
INSERT INTO media_outlets (media_url, media_description, media_article_count, media_ideology, media_info) VALUES
('https://www.hani.co.kr', '진보 성향의 종합일간지', 1250, 2, '한겨레신문'),
('https://www.chosun.com', '보수 성향의 종합일간지', 2100, 8, '조선일보'),
('https://www.joongang.co.kr', '중도 성향의 종합일간지', 1800, 5, '중앙일보'),
('https://www.donga.com', '중도 성향의 종합일간지', 1650, 6, '동아일보'),
('https://www.khan.co.kr', '진보 성향의 종합일간지', 950, 3, '경향신문'),
('https://www.seoul.co.kr', '중도 성향의 종합일간지', 1200, 5, '서울신문'),
('https://www.kmib.co.kr', '보수 성향의 종합일간지', 1400, 7, '국민일보'),
('https://www.segye.com', '보수 성향의 종합일간지', 1100, 8, '세계일보'),
('https://www.pressian.com', '진보 성향의 인터넷 언론', 800, 2, '프레시안'),
('https://www.ohmynews.com', '진보 성향의 인터넷 언론', 750, 2, '오마이뉴스');
```

## 데이터베이스 스키마

### newspaper_articles 테이블

```sql
CREATE TABLE newspaper_articles (
  newspaper_post_id UUID PRIMARY KEY,
  author_media_outlet_id UUID REFERENCES media_outlets(id),
  news_post_title TEXT NOT NULL,
  news_post_description TEXT NOT NULL,
  news_post_url TEXT,
  news_post_ideology INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT NOT NULL
);
```

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정 (위의 환경 설정 섹션 참조)

3. 개발 서버 실행:
```bash
npm run dev
```

4. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 페이지 구조

- `/` - 메인 페이지 (뉴스 목록)
- `/post/[id]` - 뉴스 상세 페이지
- `/createnews` - 뉴스 생성 페이지 (Supabase 연동)
- `/createorg` - 조직 생성 페이지

## 디자인 특징

- 전체적인 border-radius: 12px
- 반응형 디자인
- 모던한 UI/UX
- 이념 성향에 따른 색상 구분 (진보: 빨강, 중도: 노랑, 보수: 파랑)

## 개발 예정 기능

- [x] Supabase 데이터베이스 연동
- [ ] 사용자 인증
- [ ] 뉴스 검색 및 필터링
- [ ] 댓글 시스템
- [ ] 뉴스 북마크
- [ ] 이념 성향 분석 도구 