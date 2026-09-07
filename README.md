# DEV.LOG

개발자 Yongmin의 학습 기록과 프로젝트를 위한 개인 기술 블로그입니다.

## 실행

Docker와 Node.js 22 LTS 이상을 사용합니다. 저장소 루트에서:

```bash
python3 scripts/setup-local.py
docker compose up -d --build
cd frontend
npm ci
npm run dev
```

http://localhost:3000 에서 확인합니다. Spring API는 localhost:8080, PostgreSQL은 localhost:55432입니다. 로컬 DB 비밀번호와 관리자 토큰은 Git에서 제외되는 `.env`에 생성됩니다.

프론트의 `BACKEND_URL` 기본값은 `http://127.0.0.1:8080`입니다. 다른 서버 주소를 사용할 때만 `frontend/.env.local`에 설정합니다. 백엔드 없이 화면만 보려면 개발 서버 시작 또는 빌드 전에 `NEXT_PUBLIC_DATA_MODE=mock`을 설정할 수 있습니다.

## 구현 범위

- Next.js App Router, TypeScript, Tailwind CSS 기반의 독자적인 에디토리얼 디자인
- 홈, 글 목록/상세, 카테고리/태그/시리즈, 정글 주차별 기록, 프로젝트, 소개
- 프로젝트 흐름을 설명하는 데스크톱 sticky 스크롤 연출, 모바일 세로 구성, reduced-motion 대응
- 폴더 단위 MDX, 상대 경로 이미지, 코드 하이라이트/파일명/복사, TOC, 이전/다음/관련 글
- production에서 draft 글 제외
- 키보드 검색(⌘K / Ctrl+K), 접근성 Dialog, 다크 모드, 모바일 메뉴
- Spring Boot 4.1.1 / Java 21 / PostgreSQL 17 / JPA / Flyway
- MDX 공개 메타데이터 자동 인덱싱, 실제 검색 API와 Next.js 서버 프록시
- 일별 중복 판정을 적용한 글 조회수, 인증된 관리자 통계·재인덱싱 API
- SearchService / ViewService의 HTTP Adapter
- 챗봇은 현재 제공하지 않으며, 추후 검색 기능과 통합 예정

초기 학습 글 5개는 **샘플 콘텐츠**입니다. 작성자의 실제 경험으로 가장하지 않으며, `demo: true` 표시를 사용합니다. 프로젝트 소개는 현재 설계와 구현 범위를 설명합니다. 실제 글 최소 3개 작성, GitHub/Vercel 연결 및 실제 배포는 아직 완료되지 않았습니다.

## 글 쓰기

**글은 admin이 아니라 Git으로 게시합니다.** 전체 흐름과 아직 연결되지 않은 자동 배포 단계는 [docs/PUBLISHING.md](docs/PUBLISHING.md)에 정리했습니다.

```text
frontend/content/blog/my-note/
├── index.mdx
├── thumbnail.svg
└── diagram.png
```

```mdx
---
title: "오늘 이해한 것"
description: "글의 짧은 소개"
date: "2026-09-05"
category: "Backend"
tags: ["http"]
status: "published"
thumbnail: "./thumbnail.svg"
---

## 시작하며

![요청이 서버로 전달되는 구조](./diagram.png)

<Caption>그림의 맥락을 설명합니다.</Caption>

<Callout>다시 살펴볼 핵심 개념</Callout>
```

- 실제 글로 교체할 때 `demo`를 제거합니다. 공개 전에는 `status: "draft"`를 사용합니다.
- `featured: true`는 홈 대표 글에 사용합니다. 홈은 최신 대표 글을 최대 2개 보여줍니다.
- `series`로 시리즈를 묶습니다. 정글 기록은 `project: "krafton-jungle"`, `week: 4`처럼 분류합니다.
- 정글 글은 `content/jungle/`에서도 작성하며, 상세 URL은 `/blog/{slug}`입니다. blog와 jungle 사이에 slug가 겹치지 않게 작성합니다.
- 프로젝트는 `content/projects/{slug}/index.mdx`에 작성합니다. `status`는 `in-progress` 또는 `completed`, `tech`와 선택적인 `github`를 사용합니다.
- 코드 블록에 `title="filename.ts"`를 넣으면 파일명이 표시됩니다.
- 현재 `<ProjectStory />`는 DEV.LOG 프로젝트 전용 소개입니다. 다른 프로젝트에는 해당 프로젝트에 맞는 설명 컴포넌트를 작성합니다.
- 이미지 파일은 개발 서버 시작 및 빌드 때 `public/content/`로 복사됩니다. 개발 중 이미지를 추가/변경하면 `npm run sync:assets`를 실행하거나 개발 서버를 재시작합니다. 생성된 이미지 복사본은 Git에 커밋하지 않습니다.
- MDX는 저장소에 있는 신뢰할 수 있는 작성자의 콘텐츠만 사용합니다.

## 검증

```bash
cd frontend
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

E2E 테스트는 production build를 대상으로 로컬 서버를 실행합니다. 기존 서버가 있으면 재사용합니다. `BROWSER_EXECUTABLE`로 이미 설치된 Chromium 실행 파일을 지정할 수도 있습니다.

백엔드 검증은 Docker 실행 후 `cd backend && ./gradlew test bootJar`로 진행합니다. 실제 Spring 연결을 포함한 브라우저 검증은 프론트 빌드 후 `BACKEND_INTEGRATION=1 npm run test:e2e`로 실행합니다. 기본 E2E는 API 응답을 격리한 화면 테스트입니다.

상세 설정은 [backend/README.md](backend/README.md), API 계약은 [docs/API.md](docs/API.md)에 있습니다.

## 배포 준비

Vercel에 저장소를 연결하고 Root Directory를 `frontend`로 지정합니다. Framework Preset은 Next.js, Build Command는 `npm run build`입니다. 배포 연결 뒤 Git push에 따라 빌드하도록 설정하면 됩니다. Spring 서버와 PostgreSQL은 별도로 실행하고 Vercel의 서버 환경 변수 `BACKEND_URL`에 API 주소를 지정합니다. 서버의 콘텐츠 마운트와 프론트는 동일한 커밋을 사용합니다. 계정 연결·프로젝트 생성·공개 배포는 수행하지 않았습니다.

## 디렉터리

- `frontend/`: 실제 블로그
- `backend/`: Spring Boot API
- `compose.yaml`: 로컬 PostgreSQL 및 Spring API
- `docs/API.md`: Phase 2 API와 데이터 처리 규칙
- `docs/PROJECT_SPEC.md`: 최초 명세
- `docs/DESIGN.md`: 합의한 디자인 원칙과 레퍼런스 적용 범위
- `toss-clone-coding/`: 시각 원칙 분석용 레퍼런스, 블로그에서 import하거나 빌드하지 않음

브랜드 자산·제품 화면·문구를 레퍼런스에서 복제하지 않았습니다. 썸네일은 이 블로그를 위해 만든 SVG이며, Pretendard는 공식 npm 배포본을 사용합니다. 글꼴 라이선스는 `frontend/public/fonts/OFL.txt`에 있습니다.
