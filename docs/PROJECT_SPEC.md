# Personal Tech Blog — Project Spec

> 진행 상태 갱신: 2026-09-07. 아래 현재 상태 이후의 명세는 최초 설계 기록이며, 후속 사용자 요청으로 바뀐 홈 구성과 챗봇 계획은 현재 상태를 우선합니다. 현재 화면은 [PAGES.md](./PAGES.md), API는 [API.md](./API.md)를 따릅니다.

## 현재 진행 상태

- 2026-09-07 기준 최신 UI 변경을 반영했습니다. 홈의 소개·정글 영역은 Swiper 페이드 슬라이더로 통합했으며, 마지막 슬라이드에서 다음 버튼을 누르면 첫 슬라이드로 되감기고 반대 방향도 순환합니다. `swiper` 의존성과 접근성 가능한 네비게이션·페이지네이션을 추가했습니다.
- 글 상세는 제목 영역을 본문 목차 열과 분리해 화면 오른쪽까지 확장하고, 본문에는 상단에 고정되는 목차 열을 유지합니다. 1050px 이하에서는 목차를 숨겨 본문 가로 폭과 모바일 가독성을 확보합니다.
- 관련 변경은 `frontend/components/home-hero.tsx`, `frontend/components/home-hero.module.css`, `frontend/components/article.tsx`, `frontend/app/globals.css`와 관련 E2E 테스트에 반영했습니다.

- GitHub `main`에 화면 개편 커밋 [`8b913c5`](https://github.com/yongminkim0501/developer-blog/commit/8b913c57d5dcc67749857b3d8a5bc3462b389142) 반영 완료. 기존 글 작성 가이드 커밋 `4dd3bb7`도 함께 반영했습니다.
- 홈 순서: 소개 → 정글 배너 → 최신 기록 3개 → 지나온 시간·수상 → 프로젝트 4개. 대표 글과 블로그 설계 스크롤 섹션은 홈에서 제거했습니다. 설계 스크롤은 프로젝트 상세에 유지합니다.
- 지나온 시간과 수상은 데스크톱에서 한 섹션의 두 열, 모바일에서 한 열로 표시합니다. 경력·수상·프로젝트는 소개 페이지와 `components/profile-sections.tsx`를 공유합니다.
- 다크모드 배경은 zinc-800(`#27272a`), 섹션 제목·보조 링크는 흰색입니다. H1의 ‘개발자 김용민입니다.’는 각 테마의 액센트 색상을 사용합니다.
- 독립 챗봇 페이지(`/brain`), 홈 배너, 모바일 메뉴·푸터 링크, 데모 스트리밍 구현을 제거했습니다. 기존 검색은 유지하며, 챗봇은 나중에 검색과 통합할 계획입니다. 통합 UI·LLM·RAG는 아직 구현하지 않았습니다.
- 실제 공개 글은 16개(blog 5개, jungle 11개), 프로젝트 MDX는 1개입니다. 초기 샘플 글은 제거했습니다. 홈의 포트폴리오 프로젝트 4개는 MDX 프로젝트 목록과 별개입니다.
- Spring 검색·조회수·통계 백엔드와 로컬/GitHub 콘텐츠 소스가 구현되어 있습니다. GitHub 푸시는 확인했으며, 공개 사이트 배포와 원격 백엔드 반영 여부는 이번 작업에서 확인하지 않았습니다.

### 이번 변경의 검증

- 프로덕션 빌드, TypeScript 검사, 변경한 프론트 코드의 ESLint 검사 통과.
- 단위 테스트 6개 및 홈·검색·모바일·검색 장애 관련 E2E 4개 통과. 전체 E2E 통과를 의미하지는 않습니다. 남아 있는 일부 테스트는 삭제된 샘플 글 주소를 참조하므로 실제 콘텐츠 기준으로 후속 정리가 필요합니다.
- 1440px/390px에서 홈 순서·경력/수상·프로젝트 표시와 가로 넘침 확인. 다크/라이트 색상, 소개 페이지 콘텐츠, `/brain`의 404 응답 확인.

### 글 상세 정렬 개선 (2026-09-07)

- 글 상세의 제목·설명·작성자 정보·대표 이미지·뒤로 가기를 본문 컨테이너와 같은 기준으로 정렬했습니다. 프로젝트 상세의 일반 본문도 같은 너비로 정렬하며 넓은 설계 스크롤 영역은 유지합니다.
- 글 2개와 프로젝트 상세에서 1440px/1051px/820px/390px 기준으로 제목·이미지·본문의 시작점과 너비 일치, 가로 넘침 없음을 확인했습니다.
- 프로덕션 빌드, TypeScript 및 변경 컴포넌트의 ESLint 검사를 통과했습니다.

---

## 1. 프로젝트 개요

Markdown/MDX와 Git을 CMS처럼 사용하는 개인 기술 블로그를 구축한다.

주요 콘텐츠는 크래프톤 정글 학습 기록, 기술 공부, 트러블슈팅, 사이드 프로젝트 회고다. 초기 목표는 **글을 쓰고 읽는 경험이 좋은 블로그**를 완성하는 것이며, 이후 Spring Boot 기반 검색/통계와 개인 글 기반 RAG 챗봇을 추가한다.

핵심 흐름:

```text
공부 / 개발
   ↓
MDX 작성 + 이미지
   ↓
Git Commit / Push
   ↓
자동 배포
   ↓
Blog
   ↓ (향후)
Search / RAG / Ask My Brain
```

### 핵심 원칙

1. Git이 CMS다.
2. MDX가 콘텐츠의 Source of Truth다.
3. 글과 해당 글의 이미지는 같은 디렉터리에서 관리한다.
4. Frontend를 먼저 완성한다.
5. 초기에는 Spring Backend를 구현하지 않는다.
6. Search/Chat UI는 최종 API 규약과 동일한 Mock Adapter를 사용한다.
7. 디자인은 Dashboard가 아니라 **Editorial / Newsroom 스타일**을 지향한다.
8. UI 컴포넌트보다 Typography, Image, Grid, Whitespace를 디자인의 중심으로 사용한다.

---

## 2. 기술 스택

### Frontend

- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS
- shadcn/ui — Dialog, Sheet 등 필요한 primitive 위주로 제한적으로 사용
- MDX

### Backend — Phase 2 이후

- Java 21+
- Spring Boot
- Spring Data JPA
- Spring AI
- PostgreSQL
- pgvector

### Infrastructure

- GitHub
- GitHub Actions
- Vercel
- Docker — Backend 도입 이후

---

# 3. Repository

```text
personal-blog/
├── frontend/
├── backend/                 # Phase 2에서 생성
├── docs/
│   ├── PROJECT_SPEC.md
│   └── API.md               # Backend 작업 시작 시 분리 가능
└── README.md
```

첫 구현에서는 `frontend/`만 작업한다.

---

# 4. 디자인 방향

## 4.1 Design Concept

전체 디자인은 **콘텐츠 중심의 Editorial / Tech Newsroom** 스타일로 구성한다.

참고하는 감각은 다음과 같다.

- 큰 페이지 타이틀
- 과감한 여백
- 대표 콘텐츠를 크게 보여주는 Hero Card
- 이미지 중심의 콘텐츠 탐색
- 명확한 Typography hierarchy
- 최소한의 border와 shadow
- 제한적인 색상 사용
- 큰 border radius의 이미지/대표 카드
- 콘텐츠가 UI보다 먼저 보이는 구조

피해야 할 디자인:

- Admin Dashboard 같은 화면
- `Posts 42`, `Projects 5` 같은 통계 카드 중심 Home
- 모든 영역을 Card로 감싸는 구성
- 과도한 border/shadow
- 지나치게 많은 Badge
- 강한 gradient 남용
- 의미 없는 애니메이션
- 전형적인 AI SaaS Dashboard 스타일

## 4.2 Visual Principles

```text
Typography
+ Whitespace
+ Grid
+ Image
+ Radius
```

이 다섯 가지를 핵심 디자인 요소로 사용한다.

색상은 UI 자체보다 게시글 이미지가 담당하도록 한다.

### Layout

- 넓은 화면을 사용하되 중앙 max-width 적용
- Desktop 기준 약 1200~1320px 콘텐츠 영역
- Article 본문은 약 720~780px
- Section 간 vertical spacing을 충분히 확보
- Mobile first responsive

### Typography

- 페이지 제목은 크고 강하게
- 본문은 읽기 편한 line-height 유지
- metadata는 작고 조용하게
- 제목/본문/metadata 간 hierarchy를 명확하게 구분

### Components

Card를 기본 레이아웃 단위로 사용하지 않는다.

`shadcn/ui`는 다음과 같이 실제 interaction이 필요한 곳에 주로 사용한다.

- Dialog
- Command/Search
- Sheet
- Dropdown
- Tooltip
- Button primitive

---

# 5. Frontend Routes

```text
/
/blog
/blog/[slug]
/categories
/categories/[category]
/tags/[tag]
/series/[series]
/jungle
/jungle/[week]
/projects
/projects/[slug]
/brain
/about
```

---

# 6. Home

Home은 Dashboard가 아닌 **개인 개발 매거진의 Front Page**처럼 구성한다.

예상 구조:

```text
DEV.LOG

배우고 만들면서
이해한 것들을 기록합니다.

Backend · Systems · Krafton Jungle


Featured

┌──────────────────────┐  ┌──────────────────────┐
│                      │  │                      │
│      Hero Image      │  │      Hero Image      │
│                      │  │                      │
│ KRAFTON JUNGLE       │  │ PROJECT              │
│                      │  │                      │
│ Pintos에서 Priority  │  │ API Gateway를        │
│ Donation을 구현하며   │  │ 만들면서 배운 것      │
└──────────────────────┘  └──────────────────────┘


Recent Posts
────────────────────────────────────────────

      Image             Image             Image

      Malloc Lab        Virtual Memory    Web Server
      회고               이해하기           구현기


Krafton Jungle                                  →

정글에서 공부한 것들을 시간순으로 모았습니다.

[                 Wide Visual                  ]


Projects                                        →

프로젝트 목록...
```

Home에서 불필요한 통계 Dashboard를 만들지 않는다.

---

# 7. Blog List

Route:

```text
/blog
```

상단에는 큰 타이틀과 짧은 설명을 둔다.

```text
BLOG

개발하면서 배우고,
삽질하고, 이해한 것들을 기록합니다.
```

최신/대표 게시글 1~2개를 큰 이미지 카드로 보여주고 이후 글은 grid/list 형태로 배치한다.

각 게시글은 다음 정보를 가진다.

- Thumbnail
- Title
- Description — 필요한 경우
- Date
- Category
- Reading Time

Tag는 화면을 복잡하게 만들지 않는 선에서 제한적으로 노출한다.

---

# 8. Blog Detail

Route:

```text
/blog/[slug]
```

글 상세는 다른 페이지보다 더 미니멀하게 구성한다.

```text
Operating System · 2026.09.05

Pintos에서
Priority Donation을
구현하며 이해한 것

우선순위 역전 문제부터 Nested Donation까지
구현하면서 이해한 내용을 기록했다.

[                 Hero Image                 ]

                 Article Body
                 max 720~780px

                 ...

Tags

Previous / Next

Related Posts
```

지원 기능:

- MDX
- Heading anchor
- Table of Contents
- Syntax Highlight
- Code filename
- Copy button
- Image
- Image caption
- Blockquote
- Table
- Callout
- Previous / Next
- Related Posts

Desktop에서는 TOC를 article 옆 sticky 영역에 둘 수 있다.

---

# 9. 콘텐츠 구조

CMS를 구현하지 않는다.

```text
frontend/content/
├── blog/
├── jungle/
└── projects/
```

## Post = Directory

글 하나를 하나의 directory로 관리한다.

```text
content/blog/pintos-priority-donation/
├── index.mdx
├── thumbnail.png
├── donation-chain.png
├── scheduler-flow.png
└── result.png
```

글과 관련된 asset은 가능한 한 해당 directory에 함께 둔다.

---

# 10. MDX Frontmatter

```yaml
---
title: "Pintos Priority Donation"
description: "Pintos Priority Donation 구현 과정과 고민"
date: "2026-09-05"
category: "Operating System"
tags:
  - pintos
  - scheduler
  - synchronization
series: "Pintos"
project: "krafton-jungle"
week: 8
status: "published"
featured: true
thumbnail: "./thumbnail.png"
---
```

TypeScript:

```ts
export interface PostMetadata {
  title: string
  description: string
  date: string
  category: string
  tags: string[]
  series?: string
  project?: string
  week?: number
  status: "draft" | "published"
  featured?: boolean
  thumbnail?: string
}
```

`draft` 게시물은 production에서 노출하지 않는다.

---

# 11. 이미지 규칙

초기에는 이미지도 Git에서 관리한다.

```text
post/
├── index.mdx
├── thumbnail.png
├── architecture.png
└── result.png
```

MDX에서 상대 경로 사용을 지원한다.

```md
![Priority Donation 구조](./donation-chain.png)
```

모든 의미 있는 이미지에는 alt text를 작성한다.

가능하면 이미지 다음에 설명을 작성한다.

```md
![Priority Donation 과정](./donation-chain.png)

High priority thread가 lock을 기다리면 lock owner에게
priority가 일시적으로 전달된다.
```

이 설명은 향후 RAG indexing에서도 활용할 수 있다.

이미지 규모가 커진 이후에만 S3/R2 migration을 고려한다. MVP에서는 Object Storage를 도입하지 않는다.

---

# 12. Jungle Archive

Route:

```text
/jungle
```

Dashboard timeline보다는 Editorial archive로 구성한다.

```text
KRAFTON JUNGLE

정글에서 공부하고 만들었던 것들을 기록합니다.


Week 01
Algorithm & Data Structure
────────────────────────────────────────

[ Image ]                 [ Image ]
RB Tree를 직접             알고리즘 문제를
구현하며 이해한 것          풀면서 배운 것


Week 04
Malloc Lab
────────────────────────────────────────

[ Image ]    [ Image ]    [ Image ]
...
```

`project: krafton-jungle`, `week` metadata를 이용해 자동 분류한다.

---

# 13. Projects

Route:

```text
/projects
/projects/[slug]
```

프로젝트도 MDX로 관리한다.

```text
content/projects/api-gateway/
├── index.mdx
└── architecture.png
```

예시 metadata:

```yaml
---
title: "API Gateway"
description: "개인 프로젝트 API Gateway"
status: "in-progress"
github: "..."
tech:
  - Spring Boot
  - Redis
  - Docker
---
```

프로젝트 상세에는 다음 내용을 표현할 수 있다.

- Overview
- Architecture
- Tech Stack
- 문제와 해결
- 관련 게시글
- GitHub

---

# 14. Search UI

Frontend Phase에서는 Mock 기반으로 구현한다.

Desktop shortcut:

```text
⌘ K / Ctrl K
```

예:

```text
Search

pintos
────────────────────────
Pintos Priority Donation
Pintos Scheduler
Pintos Memory Management
```

검색 UI 구현과 실제 검색 엔진 구현을 분리한다.

---

# 15. Brain UI

Route:

```text
/brain
```

블로그 디자인을 깨지 않는 미니멀한 대화 화면으로 만든다.

```text
ASK MY BRAIN

내 개발 기록에 질문할 수 있습니다.

User
Priority Donation 구현할 때 뭐가 어려웠어?

Assistant
당시 기록에서는 ...

Sources
Pintos Priority Donation →

[ 질문 입력...                              ]
```

Phase 1에서는 Mock Streaming만 구현한다.

---

# 16. Frontend Directory

```text
frontend/
├── app/
│   ├── page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── categories/
│   ├── tags/
│   ├── series/
│   ├── jungle/
│   ├── projects/
│   ├── brain/
│   └── about/
│
├── components/
│   ├── layout/
│   ├── blog/
│   ├── mdx/
│   ├── search/
│   ├── chat/
│   └── ui/
│
├── content/
│   ├── blog/
│   ├── jungle/
│   └── projects/
│
├── lib/
│   ├── content/
│   ├── api/
│   └── utils/
│
├── types/
└── public/
```

---

# 17. Frontend API Architecture

Component에서 직접 API 호출 로직을 작성하지 않는다.

```text
lib/api/
├── client.ts
├── search.ts
├── posts.ts
└── chat.ts
```

Phase 1에서는 실제 Backend 대신 Mock Adapter를 사용한다.

```text
UI
 ↓
SearchService / ChatService
 ↓
Mock Adapter

Phase 2

UI
 ↓
SearchService / ChatService
 ↓
HTTP Adapter
 ↓
Spring Boot
```

UI가 데이터 공급 방식에 의존하지 않도록 한다.

---

# 18. 일반 API 응답 규약

Chat Streaming을 제외한 Backend API는 다음 형태를 사용한다.

성공:

```json
{
  "success": true,
  "data": {}
}
```

실패:

```json
{
  "success": false,
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "게시글을 찾을 수 없습니다."
  }
}
```

초기 Error Code:

```text
INVALID_REQUEST
POST_NOT_FOUND
SEARCH_FAILED
RATE_LIMIT_EXCEEDED
RAG_CONTEXT_NOT_FOUND
LLM_ERROR
INTERNAL_SERVER_ERROR
```

HTTP Status:

```text
200 정상
400 잘못된 요청
404 리소스 없음
429 Rate Limit
500 Server Error
502 External AI Error
```

---

# 19. Search API — 향후 Backend

```http
GET /api/v1/search?q=priority+donation
```

```json
{
  "success": true,
  "data": {
    "query": "priority donation",
    "results": [
      {
        "slug": "pintos-priority-donation",
        "title": "Pintos Priority Donation",
        "description": "Priority Donation 구현 과정",
        "category": "Operating System",
        "tags": ["pintos", "scheduler"]
      }
    ]
  }
}
```

Phase 1 Mock도 이 구조를 그대로 사용한다.

---

# 20. Chat API — 향후 Backend

```http
POST /api/v1/chat
```

Request:

```json
{
  "message": "Priority Donation 구현하면서 뭐가 어려웠어?"
}
```

응답은 SSE Streaming을 사용한다.

```text
Content-Type: text/event-stream
```

Event Type:

```text
start
token
source
done
error
```

### start

```text
event: start
data: {"requestId":"chat_123"}
```

### token

```text
event: token
data: {"content":"Priority"}
```

### source

```text
event: source
data: {
  "slug":"pintos-priority-donation",
  "title":"Pintos Priority Donation",
  "url":"/blog/pintos-priority-donation",
  "heading":"Nested Donation"
}
```

### done

```text
event: done
data: {
  "requestId":"chat_123",
  "finishReason":"stop"
}
```

### error

```text
event: error
data: {
  "code":"LLM_ERROR",
  "message":"응답 생성 중 오류가 발생했습니다."
}
```

Phase 1의 Mock Chat 역시 동일한 Event 구조를 흉내 낸다.

---

# 21. Backend 역할 — Phase 2+

Spring Boot는 CMS 역할을 하지 않는다.

MDX 원본은 Git에 남긴다.

Backend가 담당하는 기능:

```text
Search
Post Index
View Count
Analytics
Semantic Search
RAG
Chat
```

DB에는 원본 게시글을 복제하기보다 검색/통계/RAG에 필요한 데이터와 metadata를 저장한다.

---

# 22. RAG — Phase 3

```text
MDX
 ↓
Parser
 ↓
Metadata Extraction
 ↓
Chunking
 ↓
Embedding
 ↓
pgvector
 ↓
Similarity Search
 ↓
Context Builder
 ↓
LLM
 ↓
Answer + Sources
```

각 chunk metadata 예시:

```json
{
  "slug": "pintos-priority-donation",
  "title": "Pintos Priority Donation",
  "category": "Operating System",
  "tags": ["pintos", "scheduler"],
  "project": "krafton-jungle",
  "week": 8,
  "heading": "Nested Donation"
}
```

AI 답변은 내 기록에 근거한 내용과 일반 지식을 구분하고 Source를 제공한다.

---

# 23. 개발 순서

## Phase 1 — Frontend Blog

1. Next.js 프로젝트 생성
2. Global typography / spacing / layout 설정
3. Header / Navigation / Footer
4. Home
5. MDX parser
6. Blog List
7. Blog Detail
8. Directory-local Image Rendering
9. Syntax Highlight / Code UX
10. TOC
11. Category / Tag / Series
12. Jungle Archive
13. Projects
14. Responsive
15. Dark Mode
16. Search Mock UI
17. Brain Mock UI + Mock Streaming
18. 실제 글 최소 3개 작성
19. Vercel 배포

### Phase 1 완료 조건

```text
MDX 작성
 +
이미지 같은 폴더에 추가
 ↓
git push
 ↓
자동 build/deploy
 ↓
실제 블로그에서 정상적으로 읽을 수 있음
```

Backend는 이 단계에서 생성하지 않는다.

---

## Phase 2 — Spring Backend

- Spring Boot 프로젝트 생성
- PostgreSQL
- 게시글 metadata indexing
- Search API
- View Count
- Analytics
- Frontend 실제 API 연결

---

## Phase 3 — Ask My Brain

- Spring AI
- MDX parsing/indexing
- Chunking
- Embedding
- pgvector
- Semantic Search
- RAG
- Source Citation
- SSE Streaming Chat

---

## Phase 4 — Automation

```text
git push
 ↓
GitHub Actions
 ├── Frontend Deploy
 └── Changed MDX Detection
          ↓
      Index API
          ↓
      Re-index changed document
```

변경된 문서만 indexing하는 방향으로 구현한다.

---

# 24. Codex 작업 지침

첫 작업에서는 **Phase 1만 구현한다.**

```text
Do not implement the Spring backend yet.

Frontend first.

Use Next.js App Router and TypeScript.
Use Tailwind CSS.
Use shadcn/ui only when an interaction primitive is actually useful.

The visual direction is editorial / tech newsroom, not dashboard UI.
Prioritize typography, whitespace, imagery and grid layout.
Avoid excessive cards, borders, shadows, badges and gradients.

Git is the CMS.
MDX is the source of truth.

Every blog post uses:
content/blog/{slug}/index.mdx

Assets belonging to the post should live in the same directory whenever possible.
Relative image references from MDX must work.

Post metadata must be read from frontmatter.
Draft posts must not appear in production.

Do not create an admin CMS.

Implement Search and Brain with mock adapters first.
Their TypeScript DTOs and event formats must follow the API contracts in this specification.

UI components must not directly depend on mock implementations.
Keep content rendering, UI, and API adapter logic separated.

Do not implement features outside Phase 1 unless required for the frontend architecture.
```

---

# 25. 최종 목표

이 프로젝트의 핵심은 단순히 "직접 만든 블로그"가 아니다.

```text
Learning
   ↓
Writing
   ↓
MDX + Images
   ↓
Git History
   ↓
Blog
   ↓
Searchable Knowledge
   ↓
RAG
   ↓
Conversation with my past knowledge
```

블로그 자체는 **읽고 쓰기 좋은 콘텐츠 플랫폼**으로 단순하게 유지하고, 데이터가 충분히 축적된 뒤 검색과 AI 기능을 그 위에 추가한다.
