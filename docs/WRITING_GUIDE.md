# 글 작성 가이드 — 실제 글 올릴 때 기준

10개 이상 글을 실제로 올리기 전에, 매번 고민하지 않도록 기준을 정리했습니다.

## 1. blog vs jungle — 어디에 쓸지

| 조건 | 폴더 |
| --- | --- |
| 크래프톤 정글 진행 중 배운 것 (주차가 있는 학습 기록) | `content/jungle/{slug}/` |
| 그 외 전부 (사이드 프로젝트, 트러블슈팅, 일반 학습) | `content/blog/{slug}/` |

jungle에 넣을 때만 frontmatter에 `project: "krafton-jungle"` + `week: N`을 같이 씁니다. 둘 다 최종 URL은 `/blog/{slug}`로 동일하게 나가서, 독자 입장에선 차이가 없고 `/jungle` 페이지에 주차별로 묶여 보이는지 여부만 다릅니다.

## 2. category — 큰 주제 버킷

지금 실제로 쓰이는 카테고리 (최신 기준, `grep -h '^category:' frontend/content/*/*/index.mdx | sort -u`로 항상 재확인):

- `Backend`, `Operating System`, `Dev Log` (블로그 자체에 대한 글)
- `Capstone`, `Spring 오픈소스`, `AX 인재전쟁`, `Jungle`, `Python`, `Graphics`

**가능하면 기존 카테고리 중 하나를 재사용하세요.** 새 카테고리는 자유롭게 추가 가능하지만(실제로 `Python`, `Graphics` 등이 이렇게 추가됨), 너무 잘게 쪼개면 `/categories` 페이지가 지저분해집니다. 애매하면 가장 가까운 기존 카테고리로 퉁치고 `tags`로 세분화하는 걸 추천합니다.

## 3. tags — 세부 키워드

- 소문자, 기술/개념 단위로 짧게 (`spring`, `npe`, `http`, `malloc`)
- 한글도 기존에 섞여 있음 (`메모리`, `자료구조`) — 통일 강박 안 가져도 됨
- 3~4개 정도가 적당, 너무 많이 달지 말 것

## 4. series — 여러 편으로 이어지는 주제일 때만

지금 쓰이는 예: `Pintos`, `Malloc Lab`, `Algorithm & Data Structure`, `Web Basics`, `Building in Public`

**한 편으로 끝나는 글이면 `series`를 아예 쓰지 마세요.** 시리즈 페이지(`/series/{이름}`)는 글이 2개 이상 모였을 때 의미가 있습니다.

## 5. project — 포트폴리오 프로젝트와 연결할 때만

- 정글 글 → `project: "krafton-jungle"`
- 사이드 프로젝트 관련 글이고 `content/projects/{slug}/`가 이미 있다면 → `project: "{그 slug}"` (예: `"show-gy"`, `"gateway-loadtest"`) — 해당 프로젝트 상세 페이지의 "관련 글" 목록에 자동으로 뜸
- 관련 프로젝트가 없으면 그냥 생략

## 6. featured — 현재 홈에서 사용하지 않음

2026-09-07 대표 글 섹션을 제거했습니다. 홈의 ‘차곡차곡 쌓이는 기록’은 `featured` 여부와 관계없이 최신 글 3개를 표시합니다. 새 글에 이 필드를 추가할 필요는 없습니다.

## 7. `demo: true` — 실제 글에는 절대 넣지 마세요

초기 샘플 글 5개는 제거했고, 2026-09-07 기준 실제 공개 글 16개가 있습니다. 실제 글에는 `demo` 필드를 넣지 마세요. 샘플 표시 기능 자체는 카드 컴포넌트에 남아 있습니다.

## 8. status — draft로 시작, published로 마무리

```yaml
status: "draft"      # 다듬는 동안, 로컬에서만 보임
status: "published"  # 공개, 검색에도 노출
```

## frontmatter 전체 템플릿 (복붙용)

```yaml
---
title: "글 제목"
description: "한두 문장 요약"
date: "2026-09-06"
category: "Backend"
tags: ["spring", "http"]
status: "draft"
thumbnail: "./thumbnail.png"
---
```

정글 글이면 여기에 추가:
```yaml
project: "krafton-jungle"
week: 9
```

## 9. 본문 쓰는 방식

### 소제목은 `##`/`###`만 (TOC용)

`####`(h4)를 쓰면 화면엔 보이지만 "ON THIS PAGE" 목차엔 안 뜹니다. 목차에 걸리게 하려면 `##`/`###`만 쓰세요.

### 이미지

```mdx
![대체 텍스트](./diagram.png)

<Caption>이미지 아래 작은 설명 (선택)</Caption>
```

같은 폴더에 이미지 파일을 넣고 상대경로로 참조합니다. `alt` 텍스트는 의미 있게 채우세요 (나중에 RAG 인덱싱에도 쓰일 예정).

**주의**: 원본이 raw HTML `<img src="./x.png">` 태그로 돼 있으면 그대로 쓰지 마세요 — 이 태그는 자산 경로 자동 변환(`assetUrl()`)이 적용되지 않아 이미지가 깨집니다. 반드시 위 마크다운 `![]()` 문법으로 바꿔서 넣으세요.

### 코드 블록

````mdx
```java title="ViewService.java"
// 코드
```
````

`title="파일명"`을 넣으면 코드 블록 위에 파일명이 표시됩니다.

### 강조

```mdx
<Callout>강조하고 싶은 핵심 문장</Callout>
```

## 10. 글 종류별 구조 템플릿

### (A) 학습 노트형 (정글/개념 정리)

`pintos-priority-donation` 참고:

```mdx
## 문제 상황 설명

## 핵심 개념 정리 (그림/표 활용)

## 구현하며 부딪힌 지점

## 기록해둘 질문 / 정리
```

### (B) 트러블슈팅/조사형

`spring-ai-streaming-npe` 참고:

```mdx
#### 문제
(한 줄 요약)

#### 문제 설명
(원인 분석, 코드/에러 로그 인용)

#### 재현/확인 이유
#### 확인하지 않아도 되는 부분
#### 확인해야 하는 부분
#### 실험 환경
```

이 구조는 그대로 유지하되, 목차가 필요하면 `####`를 `###`로 한 단계 올리세요.

## 11. 발행 흐름 (반복)

1. `npm run new`로 폴더/frontmatter 자동 생성 (또는 위 템플릿 복붙)
2. `status: "draft"`로 로컬에서 작성 (`npm run dev`로 확인)
3. 다 쓰면 `status: "published"`로 변경, `demo` 필드 없는지 확인
4. `git add / commit / push origin main`
5. 연결된 Vercel 배포 결과와 백엔드 검색 반영을 확인합니다. 자동 반영에는 Vercel Git 연동과 Spring 콘텐츠 소스 설정이 필요합니다. GitHub 소스는 재인덱싱 때 저장소를 조회하고, 로컬 소스는 서버에 최신 콘텐츠를 먼저 전달해야 합니다. 기본 재인덱싱 주기는 30초이며 실제 반영 시점은 운영 설정에 따릅니다. [배포 연결 조건](./PUBLISHING.md#현재-완료된-것과-배포-연결)을 참고하세요.

관련 문서: [`docs/PUBLISHING.md`](./PUBLISHING.md), [`docs/PAGES.md`](./PAGES.md), [`docs/PROJECT_SPEC.md`](./PROJECT_SPEC.md)
