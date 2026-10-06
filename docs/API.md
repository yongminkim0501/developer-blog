# Spring API — Phase 2

Spring Boot 4.1.1 / Java 21 / PostgreSQL 17 / Spring Data JPA / Flyway.

MDX 원본은 `frontend/content/`에 유지합니다. `blog`와 `jungle`의 `published` 글만 읽고 메타데이터를 PostgreSQL에 저장합니다. 프로젝트 소개는 프론트의 MDX 렌더링을 유지합니다. 본문 복제, CMS, LLM, RAG는 이번 구현에 포함하지 않습니다.

## 연결 구조

```text
Browser
  └─ SearchService / ViewService (HTTP adapters)
      └─ Next.js /api/v1/search, /api/v1/posts/{slug}/views
          └─ Spring Boot :8080
              └─ PostgreSQL :5432

MDX (read-only mount)
  └─ startup + 30-second index refresh
      └─ PostgreSQL metadata index
```

`BACKEND_URL`은 Next.js 서버 전용 환경 변수입니다. 기본값은 `http://127.0.0.1:8080`입니다. 프론트의 공개 프록시는 검색, 조회수, 방문 통계만 전달하며, 관리자 인증 헤더나 임의 경로는 전달하지 않습니다. 브라우저에서 Spring에 직접 접근하지 않으므로 CORS 허용이 필요하지 않습니다.

2026-09-07 독립 Brain 페이지와 `ChatService` 데모 구현을 제거했습니다. 기존 `SearchService`와 `ViewService`는 유지합니다. 챗봇은 추후 검색 기능과 통합할 계획이며, `/api/v1/chat`·실제 AI 연결·SSE는 구현하지 않았습니다.

## 응답

```json
{"success":true,"data":{}}
```

```json
{"success":false,"error":{"code":"POST_NOT_FOUND","message":"게시글을 찾을 수 없습니다."}}
```

| HTTP | code | 의미 |
| --- | --- | --- |
| 400 | INVALID_REQUEST | 필수 값 누락, UUID/날짜 형식, 검색 길이, 통계 기간 오류 |
| 401 | UNAUTHORIZED | 관리자 토큰 누락·불일치 또는 설정되지 않은 관리자 API |
| 404 | POST_NOT_FOUND | 존재하지 않거나 비공개인 글 |
| 404 | NOT_FOUND | Spring API 경로 없음 |
| 500 | INDEX_FAILED | 잘못된 MDX 또는 콘텐츠 경로 오류. 기존 인덱스 유지 |
| 500 | INTERNAL_SERVER_ERROR | 서버 내부 오류 |
| 503 | BACKEND_UNAVAILABLE | Next.js 프록시에서 Spring 연결 실패 또는 제한 시간 초과 |

## 검색

`GET /api/v1/search?q=priority+donation`

- `q`는 필수이며 최대 200자입니다. 빈 문자열은 최신 공개 글을 조회합니다.
- 제목, 설명, 카테고리, 태그를 대소문자 구분 없이 부분 일치로 검색합니다.
- 공백으로 나눈 검색어가 모두 일치해야 합니다(AND). `%`, `_`, `\`는 와일드카드로 취급하지 않습니다.
- 최대 50건, 게시일 내림차순 / slug 오름차순입니다. 형태소·의미 기반 검색이나 본문 검색은 포함하지 않습니다.
- PostgreSQL `pg_trgm` 인덱스를 사용하는 메타데이터 검색입니다.

```json
{
  "success": true,
  "data": {
    "query": "pintos",
    "results": [{
      "slug": "pintos-priority-donation",
      "title": "Pintos에서 Priority Donation을 이해하기",
      "description": "우선순위 역전부터 중첩된 기부까지.",
      "category": "Operating System",
      "tags": ["pintos", "scheduler"]
    }]
  }
}
```

## 조회수

`GET /api/v1/posts/{slug}/views`

```json
{"success":true,"data":{"slug":"pintos-priority-donation","views":12}}
```

`POST /api/v1/posts/{slug}/views`

```json
{"visitorId":"941a3370-3b3a-437e-a4b5-fdd45d48e440"}
```

응답은 GET과 동일합니다. 프론트는 `localStorage`에 생성한 익명 UUID를 전달합니다. **동일 브라우저·동일 글·동일 한국 날짜(Asia/Seoul)에는 한 번** 집계합니다. 새 탭이나 새로고침도 같은 식별자를 사용하며 다음 날짜의 방문은 다시 집계합니다. 이전 UTC 기준의 집계 기록은 재작성하지 않고 보존합니다. 변경 적용 시 기존 세션 식별자 대신 지속되는 브라우저 식별자를 생성합니다.

DB의 고유 제약과 `ON CONFLICT`로 재시도·React Strict Mode·동시 요청 중복을 처리하고, 일별 집계는 원자적으로 증가시킵니다. 방문 UUID는 SHA-256 해시로만 저장하며, 중복 판정 행은 인덱싱 작업에서 2일 전 기준으로 정리합니다. 일별 누적 집계는 유지합니다. IP, User-Agent, 질문 내용은 수집하지 않습니다.

스토리지가 차단된 브라우저에서는 카운트를 읽기만 합니다. 조회수 API 오류가 글 읽기를 막지 않으며, 실패한 숫자는 `—`로 표시합니다. 서버 장애를 숨기기 위한 0회 표시나 자동 목업 전환은 하지 않습니다. 목록 카드는 통계에 포함된 조회수를 읽기만 하고 글 상세 페이지에서만 해당 글의 조회수를 기록합니다.

## 블로그 방문 통계

`GET /api/v1/stats`는 집계 없이 통계와 공개 글별 조회수를 한 번에 반환합니다.

```json
{"success":true,"data":{"date":"2026-10-06","timeZone":"Asia/Seoul","todayVisitors":12,"totalVisitors":340,"totalViews":1024,"postViews":{"pintos-priority-donation":12}}}
```

`POST /api/v1/stats/visits`는 조회수와 동일한 `{ "visitorId": "UUID" }` 요청을 받아 사이트 방문을 기록하고 위와 같은 통계를 반환합니다.

- 오늘 방문: 같은 브라우저가 여러 글과 페이지를 보아도 한국 시간 기준 하루 한 번입니다.
- 누적 방문: 일별 방문 수의 합계입니다. 서로 다른 날짜에 방문하면 다시 더합니다. 기능 적용 전의 방문 수를 추정하거나 소급하지 않습니다.
- 전체 조회: 현재 공개된 글들의 누적 조회수 합계입니다. 비공개 글의 집계는 보존하되 공개 응답에서는 제외합니다.
- `postViews`: 조회 이력이 없는 공개 글도 0으로 포함합니다. 인덱스에 없는 글은 포함하지 않으며 UI에서는 `—`를 표시합니다.

방문자 UUID는 조회수와 같은 브라우저 식별자를 사용하며 DB에는 해시만 저장합니다. 중복 판정 행은 2일 전 기준으로 정리하고 일별 누적 값은 유지합니다. 브라우저 데이터 삭제·기기 변경에 따라 다시 집계되므로 실제 고유한 사람 수를 뜻하지 않습니다. 동시 요청은 DB 고유 제약과 원자적 증가로 중복을 방지합니다.

화면은 공통 푸터에 오늘 방문·누적 방문·전체 조회를 표시합니다. 페이지 이동, 글 조회 기록 완료, 탭 복귀 시 통계를 갱신합니다. `NEXT_PUBLIC_DATA_MODE=mock`에서는 통계 표시와 집계를 모두 비활성화합니다.

## 메타데이터 인덱싱

시작할 때 전체 동기화하고 기본 30초마다 다시 확인합니다. 메타데이터 해시가 같으면 갱신하지 않습니다. 글 삭제 또는 draft 전환은 공개 상태만 내리며, 기존 집계는 유지합니다. 재공개하면 기존 집계를 이어갑니다.

모든 파일을 검증한 뒤 하나의 트랜잭션에서 반영합니다. 잘못된 YAML, 중복 slug, 잘못된 날짜 또는 누락된 콘텐츠 디렉터리가 있으면 해당 동기화는 롤백합니다. 초기 동기화 실패 시 서버 시작도 실패합니다. 이후 동기화 실패 시에는 마지막 정상 인덱스가 유지됩니다. MDX 본문은 DB에 저장하지 않습니다.

서버가 보는 콘텐츠 디렉터리와 프론트 배포에는 동일한 Git 커밋의 콘텐츠를 사용합니다. 본문·정적 페이지 변경에는 프론트 재빌드가 필요합니다. GitHub 변경분 감지·배포 조정은 후속 자동화 단계입니다.

### 수동 동기화

`POST /api/v1/admin/reindex`

헤더: `X-Admin-Token: <BLOG_ADMIN_TOKEN>`

```json
{"success":true,"data":{"published":5,"updated":1,"unchanged":4,"unpublished":0}}
```

저장소에서 직접 읽으므로 요청 본문은 없습니다. 초기 구현은 전체 메타데이터를 확인하는 방식이며, 변경된 항목만 DB에 갱신합니다.

## 통계

`GET /api/v1/admin/analytics?from=2026-09-01&to=2026-09-05`

헤더: `X-Admin-Token: <BLOG_ADMIN_TOKEN>`

날짜는 UTC 기준이며 양 끝을 포함합니다. 생략하면 오늘까지 30일, 최대 366일입니다. 현재 공개 상태인 글만 합산합니다.

```json
{
  "success": true,
  "data": {
    "from": "2026-09-04",
    "to": "2026-09-05",
    "publishedPosts": 5,
    "views": 3,
    "daily": [{"date":"2026-09-04","views":0},{"date":"2026-09-05","views":3}],
    "popularPosts": [{"slug":"pintos-priority-donation","title":"Pintos…","views":3}]
  }
}
```

관리자 토큰은 최소 32자여야 하며, 미설정 또는 짧은 값이면 관리자 API를 사용할 수 없습니다. 토큰은 브라우저 번들에 포함하지 않습니다. 별도 통계 대시보드 UI는 추가하지 않았습니다.

## 상태 확인

`GET /actuator/health`

```json
{"status":"UP"}
```

실제 응답에는 Spring의 health group 목록이 추가될 수 있습니다. 외부 상세 상태는 노출하지 않습니다.
