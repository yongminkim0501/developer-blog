# 페이지 가이드 — 라우트별 구성과 이미지 연결

이 문서는 프론트엔드(`frontend/`)의 각 라우트가 어떤 데이터를 보여주고, 화면에 나오는 이미지가 실제로 어디서 오는지를 정리합니다. 코드를 새로 만들지 않아도 "이 페이지는 왜 이 이미지가 뜨지?"를 바로 찾을 수 있게 하는 것이 목적입니다.

---

## 1. 이미지가 화면까지 오는 경로 (전체 그림)

```text
frontend/content/{blog|jungle|projects}/{slug}/
├── index.mdx          ← frontmatter의 thumbnail 필드
├── thumbnail.svg       ← 목록/카드/히어로에 쓰는 대표 이미지
└── diagram.png 등       ← 본문 중간에 삽입하는 이미지
        ↓  (npm run dev / npm run build 전 predev·prebuild 훅)
scripts/sync-assets.mjs
        ↓  mdx/ts/js/json을 뺀 나머지 파일만 복사
frontend/public/content/{collection}/{slug}/...
        ↓  Next.js가 public/ 을 그대로 static 서빙
브라우저: /content/{collection}/{slug}/thumbnail.svg
```

핵심 지점은 두 곳입니다.

- **`frontend/scripts/sync-assets.mjs`** — `content/`를 훑어서 `.mdx/.ts/.tsx/.js/.jsx/.json`이 아닌 파일(이미지 등)만 `public/content/`로 그대로 복사합니다. `npm run dev`/`npm run build`가 실행될 때 `predev`/`prebuild` 훅으로 자동 실행되고, 개발 서버가 떠 있는 중에 이미지를 추가/변경했을 때는 `npm run sync:assets`를 수동으로 다시 돌리거나 서버를 재시작해야 합니다. 복사된 `public/content/`는 Git에 커밋하지 않습니다(`.gitignore`).
- **`frontend/lib/content/index.ts`의 `assetUrl(collection, slug, src)`** — MDX frontmatter나 본문에서 쓰는 상대 경로(`./thumbnail.svg`)를 실제 웹 경로(`/content/blog/pintos-priority-donation/thumbnail.svg`)로 바꿔줍니다. `./`로 시작하지 않는 경로(외부 URL 등)는 그대로 둡니다.

즉 **글 작성자는 MDX 안에서 항상 상대 경로만 쓰면 되고**, 실제 URL 변환은 `allContent()`(썸네일)와 `Article`의 커스텀 `img` 렌더러(본문 이미지) 두 곳에서 자동으로 처리됩니다.

---

## 2. 콘텐츠 로딩 흐름 (이미지가 아닌, 전체 데이터)

- `lib/content/index.ts`의 `allContent(collection)`이 `content/{collection}/*/index.mdx`를 전부 읽어 frontmatter(`gray-matter`)를 파싱하고, `thumbnail` 필드가 있으면 `assetUrl()`로 변환해 `Post.thumbnail`에 채워 넣습니다.
- `posts()`는 `blog` + `jungle`을 합쳐 최신순으로 정렬한 배열입니다. **`projects`는 `posts()`에 포함되지 않고 `allContent("projects")`로 따로 불러옵니다.**
- `status: "draft"`인 글은 `NODE_ENV === "production"`일 때만 걸러집니다. 즉 로컬 개발 서버(`npm run dev`)에서는 draft도 보이고, `npm run build` 결과물에서는 빠집니다.

---

## 3. 라우트별 가이드

### `/` — 홈 (`app/page.tsx`)

| 섹션 | 데이터 출처 | 이미지 |
| --- | --- | --- |
| 인트로 (타이틀/설명) | 하드코딩된 텍스트 | 없음 |
| Jungle 배너 | 텍스트 + CSS로 그린 원형 장식(`jungle-art`) | 실제 이미지 파일 없음, 전부 CSS 장식 |
| Recent Notes (3개) | `posts().slice(0, 3)`, featured 여부와 관계없이 최신순 | 각 글의 `thumbnail` → `PostCard`의 `post-cover`. 썸네일이 없으면 `fallback-cover`로 대체 |
| 지나온 시간·수상 | `components/profile-sections.tsx`의 `ExperienceList`와 `AwardsList` | 없음. 데스크톱 두 열, 모바일 한 열 |
| 프로젝트 4개 | 같은 파일의 `ProfileProjects`, 소개 페이지와 공유 | 없음. 설명·태그·GitHub 링크 표시 |

2026-09-07 기준 위 표 순서로 표시합니다. 대표 글 섹션, 홈의 `<ProjectStory />`, Brain 배너는 제거했습니다. 홈 프로젝트는 `/projects`의 MDX 목록과 별도로 관리합니다.

### `/blog` — 전체 기록 (`app/blog/page.tsx` → `components/archive.tsx`)

- `posts()` 전체를 `Archive` 컴포넌트에 넘김 → 내부에서 `PostGrid` → `PostCard` 반복.
- 카드 이미지 소스는 홈과 동일하게 각 글의 `thumbnail`.
- 상단 `category-nav`의 링크(Operating System/Backend/Dev Log)는 하드코딩된 필터 목록이며 실제 있는 카테고리와 무관하게 항상 노출됩니다.

### `/blog/[slug]` — 글 상세 (`app/blog/[slug]/page.tsx` → `components/article.tsx`)

- `generateStaticParams`가 `posts()`의 모든 slug로 정적 페이지를 미리 생성합니다.
- 이미지가 나오는 지점 두 곳:
  1. **히어로 이미지**: `post.thumbnail`이 있으면 글 제목 아래 `<img className="article-hero">`로 큰 이미지 표시.
  2. **본문 이미지**: MDX 본문의 `![설명](./파일명)`은 `MDXRemote`의 `components.img` 커스텀 렌더러를 거칩니다. 이 렌더러가 `assetUrl(post.collection, post.slug, src)`로 상대 경로를 실제 경로로 바꿔줍니다. 따라서 **본문에서는 항상 같은 폴더의 상대 경로(`./diagram.png`)만 쓰면 됩니다.**
- 조회수(`ViewCount` 컴포넌트)는 `post.collection !== "projects"`이고 `published` 상태일 때만 표시 — 이미지는 아니지만 이 페이지의 핵심 API 연동 지점입니다.
- 관련 글(`related`)은 같은 카테고리이거나 태그가 겹치는 글 중 최대 3개, 이전/다음 글은 정렬된 배열에서 앞뒤 인덱스로 계산합니다.

### `/jungle` — 정글 아카이브 (`app/jungle/page.tsx`)

- `posts()` 중 `project === "krafton-jungle"`인 글만 모아 `week` 기준으로 그룹화, `PostGrid`로 주차별 섹션을 렌더.
- 이미지는 `/blog`와 동일하게 각 글의 `thumbnail` (카드 컴포넌트를 그대로 재사용하기 때문).

### `/jungle/[week]` — 주차별 상세 (`app/jungle/[week]/page.tsx` → `Archive`)

- `project === "krafton-jungle" && week === N`인 글만 필터링해 `Archive`에 전달. 이미지 흐름은 `/blog`와 동일.

### `/projects` — 프로젝트 목록 (`app/projects/page.tsx`)

- `allContent("projects")`를 직접 순회하며 카드가 아니라 리스트 레이아웃(`project-list`)을 손으로 그립니다.
- 이미지는 `<img src={p.thumbnail} />`로 **`PostCard`를 거치지 않고 직접** 렌더링합니다(썸네일이 없을 때의 fallback 처리가 없다는 뜻이므로, 프로젝트 글은 `thumbnail`이 필수라고 보면 됩니다).

### `/projects/[slug]` — 프로젝트 상세 (`app/projects/[slug]/page.tsx` → `Article`)

- `allContent("projects")`에서 slug로 글을 찾아 `/blog/[slug]`와 동일한 `Article` 컴포넌트를 재사용합니다. 히어로 이미지·본문 이미지 처리 방식도 동일합니다.
- 현재 `<ProjectStory />` 컴포넌트는 MDX 안에서 사용 가능하지만(README에 명시), 이는 "이 블로그(dev-log) 프로젝트" 전용 소개 컴포넌트이고 이미지 대신 스크롤 애니메이션으로 스토리를 보여줍니다. 다른 프로젝트 글에서 그대로 쓰면 안 되고, 프로젝트별로 맞는 설명 방식을 새로 작성해야 합니다.
- 관련 글(`related`)은 `posts()`(blog+jungle)에서 `project === slug`인 글, 즉 "이 프로젝트를 하면서 쓴 글" 목록입니다.

### `/categories`, `/categories/[category]`, `/tags/[tag]`, `/series/[series]`

- 목록 페이지(`/categories`)는 텍스트 링크 목록만 있고 이미지 없음.
- 상세 페이지 3종은 전부 `Archive` 컴포넌트를 재사용하므로 이미지 흐름은 `/blog`와 동일 (`PostCard`의 `thumbnail`).

### `/about` — 소개 (`app/about/page.tsx`)

- 이미지 없음. `about-visual` 블록은 전부 CSS/텍스트로 만든 장식(사진 없는 "STAY CURIOUS." 카드).

- 경력·수상·프로젝트 목록은 `components/profile-sections.tsx`를 통해 홈과 공유합니다. 소개 페이지의 경력·수상은 기존의 개별 섹션 구성을 유지합니다.

### 제거한 라우트: `/brain`

- 2026-09-07 독립 챗봇 페이지와 데모 컴포넌트를 삭제했습니다. `/brain`은 404이며 모바일 메뉴·푸터에도 진입 링크가 없습니다. 챗봇은 추후 기존 검색과 통합할 계획입니다.

### 헤더 / 검색 다이얼로그 (`components/header.tsx`)

- 모든 페이지 상단에 공통으로 들어가는 컴포넌트(`app/layout.tsx`에서 렌더).
- ⌘K/Ctrl+K로 여는 검색 다이얼로그는 이미지 없이 제목/카테고리 텍스트만 보여주며, `useServices().search`(→ `frontend/lib/api/proxy.ts` → Spring `/api/v1/search`)로 실시간 검색합니다.

---

## 4. 카드 컴포넌트가 이미지를 못 찾을 때

`components/post-card.tsx`의 `PostCard`는 `post.thumbnail`이 없으면 `<img>` 대신 카테고리 이름이 적힌 단색 블록(`fallback-cover`)을 그립니다. 반면 `/projects` 목록과 `Article`의 히어로 이미지는 이런 fallback이 없으므로, **`blog`/`jungle` 글은 썸네일이 선택 사항, `projects` 글은 사실상 필수**라고 생각하면 됩니다.

## 5. 글 쓸 때 이미지 체크리스트

1. `content/{blog|jungle|projects}/{slug}/` 폴더에 `index.mdx`와 이미지를 함께 넣는다.
2. frontmatter의 `thumbnail`과 본문의 `![]()` 모두 **같은 폴더 기준 상대 경로**(`./thumbnail.svg`)로 쓴다.
3. 개발 서버가 이미 떠 있는 상태에서 이미지를 새로 추가했다면 `npm run sync:assets`를 실행하거나 서버를 재시작한다 (`predev` 훅은 서버를 새로 켤 때만 돈다).
4. 모든 의미 있는 이미지에는 `alt`를 채운다 — `PROJECT_SPEC.md`에 명시된 원칙이며, 나중에 RAG 인덱싱에도 쓰일 설명이다.

관련 문서: 글 작성/공개 절차는 [`docs/PUBLISHING.md`](./PUBLISHING.md), API 계약은 [`docs/API.md`](./API.md), 전체 설계 원칙은 [`docs/PROJECT_SPEC.md`](./PROJECT_SPEC.md) 참고.
