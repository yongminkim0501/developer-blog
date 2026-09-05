# DEV.LOG Spring API

공개 MDX 메타데이터 인덱싱, 검색, 조회수, 관리자 통계를 제공합니다.

## Docker 실행 (저장소 루트)

```bash
python3 scripts/setup-local.py
docker compose up -d --build
```

PostgreSQL은 localhost:55432, API는 localhost:8080에서 실행됩니다. 로컬 자격 증명은 Git에서 제외되는 루트 `.env`에 처음 한 번 생성하며, 기존 파일을 덮어쓰지 않습니다.

```bash
curl 'http://localhost:8080/actuator/health'
curl 'http://localhost:8080/api/v1/search?q=pintos'
docker compose logs -f backend
docker compose down
```

`docker compose down`은 데이터 볼륨을 보존합니다. Docker의 `-v` 옵션은 데이터를 삭제하므로 일반 종료에 사용하지 않습니다.

## IDE / Gradle 실행

Java 21 이상과 Docker가 필요합니다. Gradle Wrapper를 포함했으므로 Gradle 별도 설치는 필요하지 않습니다.

저장소 루트에서:

```bash
python3 scripts/setup-local.py
docker compose up -d db
set -a
source .env
set +a
cd backend
./gradlew bootRun
```

`blog.content-root` 기본값은 `../frontend/content`입니다. 컨테이너에서는 `/content`를 읽기 전용으로 마운트합니다.

## 테스트

```bash
cd backend
./gradlew test bootJar
```

Testcontainers가 격리된 PostgreSQL 컨테이너와 임시 MDX 디렉터리를 생성합니다. 실행 중인 개발 DB와 실제 글은 변경하지 않습니다. 검색 계약, SQL 와일드카드 처리, 초안 제외, 수정·삭제·재공개, 깨진 MDX의 롤백, 동시 조회 집계, 일별 중복 판정, 관리자 인증과 통계를 검증합니다.

## 환경 변수

| 변수 | 기본값 / 용도 |
| --- | --- |
| `DATABASE_URL` | `jdbc:postgresql://localhost:55432/devlog` |
| `DATABASE_USERNAME` | `devlog` |
| `DATABASE_PASSWORD` | 필수 |
| `BLOG_CONTENT_ROOT` | `../frontend/content` (`BLOG_CONTENT_SOURCE=local`일 때만 사용) |
| `BLOG_ADMIN_TOKEN` | 관리자 전용 토큰. 미설정 시 관리자 API 비활성 |
| `BLOG_INDEX_ENABLED` | `true` |
| `BLOG_INDEX_INTERVAL_MS` | `30000` |
| `PORT` | `8080` |
| `BLOG_CONTENT_SOURCE` | `local`(기본) 또는 `github` |
| `BLOG_CONTENT_GITHUB_REPO` | `github`일 때 필수, 예: `yongminkim0501/developer-blog` |
| `BLOG_CONTENT_GITHUB_BRANCH` | `main` |
| `BLOG_CONTENT_GITHUB_PATH` | `frontend/content` |
| `BLOG_CONTENT_GITHUB_TOKEN` | GitHub read-only PAT. 미설정 시 시간당 60회 제한(공개 저장소도 30초 주기 폴링엔 부족) |

스키마는 Flyway migration으로 관리하고 Hibernate는 스키마 일치 여부만 검증합니다.

### 콘텐츠 소스: 로컬 vs GitHub

기본값(`local`)은 지금까지처럼 `BLOG_CONTENT_ROOT`가 가리키는 로컬 디렉터리(또는 docker volume mount)를 읽습니다. 프론트(Vercel)와 백엔드가 서로 다른 서버에 배포되어 파일시스템을 공유할 수 없는 환경(Railway 등)에서는 `BLOG_CONTENT_SOURCE=github`로 설정하면, 백엔드가 매 재인덱싱마다 GitHub API로 `frontend/content`를 직접 조회합니다. 글 작성 방식(`npm run new`, 폴더 구조, frontmatter)은 전혀 바뀌지 않고, 백엔드가 콘텐츠를 읽어오는 경로만 바뀝니다.

API 요청·응답과 인덱싱 규칙은 [docs/API.md](../docs/API.md)를 참고하세요. AI/RAG와 Chat SSE는 후속 단계입니다.
