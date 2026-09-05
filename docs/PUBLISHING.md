# 글 작성과 공개 흐름

## 글은 Git으로 관리합니다

관리자 화면에서 글을 업로드하지 않습니다. 글과 이미지를 저장소에 작성하고 Git으로 버전을 관리합니다. 현재 admin API는 **수동 재인덱싱과 통계 조회용**이며, 게시글 작성·수정·삭제 API는 없습니다.

```text
content/blog/{slug}/index.mdx + images
              ↓
로컬 미리보기 → status: published
              ↓
Git commit / push
              ↓
프론트 빌드·배포 + 동일 커밋의 Spring 콘텐츠 갱신
              ↓
글 페이지 공개 + 검색 인덱스 갱신
```

## 로컬 작성

1. `frontend/content/blog/my-new-post/` 디렉터리를 만듭니다. slug는 영문 소문자·숫자·하이픈을 사용하며, blog와 jungle 전체에서 고유해야 합니다.
2. `index.mdx`와 이미지를 같은 폴더에 넣습니다.
3. 글을 작성하는 동안 `status: "draft"`로 둡니다. 개발 서버에서는 초안을 볼 수 있고 production 빌드와 Spring 검색에서는 제외됩니다.
4. `npm run dev`로 미리 봅니다. 실행 중 이미지를 추가했다면 `npm run sync:assets`를 실행합니다.
5. 공개할 때 `status: "published"`로 변경하고, 실제 글에서는 `demo` 표시를 제거합니다.
6. 커밋·푸시합니다.

```mdx
---
title: "오늘 이해한 문제"
description: "문제와 해결 과정을 한 문장으로 소개합니다."
date: "2026-09-05"
category: "Backend"
tags: ["spring", "http"]
status: "draft"
thumbnail: "./thumbnail.png"
---

## 문제를 만난 배경

본문을 작성합니다.

![요청 처리 흐름](./request-flow.png)

<Caption>그림이 설명하는 내용을 적습니다.</Caption>
```

서버는 공개 글의 제목·설명·카테고리·태그 등을 읽어 검색에 사용합니다. 본문은 프론트가 직접 MDX에서 렌더링합니다. 글 저장 후 로컬 Spring은 최대 약 30초 내에 메타데이터 변경을 반영합니다.

## 현재 완료된 것과 배포 연결

로컬 Docker의 Spring에는 작업 폴더의 `frontend/content`가 읽기 전용으로 연결되어 있습니다. 따라서 로컬 파일 변경은 별도 업로드 없이 서버가 읽습니다.

**현재 Git push만으로 공개 사이트와 원격 Spring 콘텐츠가 자동 갱신되지는 않습니다.** 추가된 GitHub Actions는 검증용이며 배포 워크플로가 아닙니다. Vercel 계정·프로젝트와 원격 Spring 서버는 아직 연결하지 않았습니다.

공개 운영 시에는 다음 두 작업을 같은 커밋을 기준으로 연결합니다.

- Vercel이 `frontend/`를 빌드하고 배포합니다.
- Spring 서버에 해당 커밋의 `frontend/content/`를 배포합니다. Spring은 자동 스캔 또는 인증된 수동 재인덱싱으로 반영합니다.

Spring의 `/admin/reindex`를 호출하는 것만으로 Git 저장소를 내려받지는 않습니다. **먼저 서버에 최신 콘텐츠가 있어야 합니다.** 글 삭제·draft 전환도 프론트 재배포와 서버 콘텐츠 갱신을 함께 진행해야 화면과 검색이 일치합니다.

브라우저에서 글을 쓰는 방식이 필요해지면 Git 커밋을 생성하는 편집기를 별도로 붙일 수 있지만, 현재는 파일 작성 → Git 게시 방식입니다.
