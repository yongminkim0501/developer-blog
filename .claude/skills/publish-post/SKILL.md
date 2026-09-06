---
name: publish-post
description: Turn a pasted raw draft (Notion/Velog export, messy markdown, screenshots or image paths) into a clean MDX post in this blog repo. Use whenever the user pastes blog content and images/thumbnails to add to the site, without needing to re-explain the frontmatter/category/image rules each time.
---

# Publish a blog post from a pasted draft

This repo is `yongminkim0501/developer-blog`. Frontend is Next.js App Router with MDX
content under `frontend/content/{blog,jungle,projects}/{slug}/index.mdx`. This skill
encodes the exact workflow built up over many real posts — follow it so nothing needs
re-explaining next time.

## 0. Read the human-facing guide first

`docs/WRITING_GUIDE.md` has the canonical rules (blog vs jungle, category/tags/series/
project/week, status, body formatting templates). This skill adds the parts that guide
doesn't cover: image-placeholder handling, a real bug workaround, and the verify/publish
mechanics. Read both.

## 1. Decide collection, slug, frontmatter

- **jungle vs blog**: 크래프톤 정글 진행 중 배운 것(주차 있음) → `content/jungle/{slug}/`.
  그 외 전부 → `content/blog/{slug}/`. Both render at the same public URL
  `/blog/{slug}` — jungle only additionally shows up grouped in `/jungle/{week}`.
- **slug**: English, kebab-case, descriptive of the content (not the Korean title).
- **category**: reuse an existing one if it fits — check what's actually in use first:
  `grep -h '^category:' frontend/content/*/*/index.mdx | sort -u`. As of this writing:
  `Backend`, `Operating System`, `Dev Log`, `Python`, `Graphics`, `Capstone`,
  `Spring 오픈소스`, `AX 인재전쟁`, `Jungle`, `Personal Project`. It's fine to add a new
  one when content genuinely doesn't fit (e.g. `Graphics` was added for an image-format/
  color-quantization post) — just don't fragment further than necessary.
- **series**: only when this post is genuinely a continuation of an existing multi-part
  thread. Check `grep -h '^series:' frontend/content/*/*/index.mdx | sort -u` first. A
  single-topic post gets no `series` field at all (see `docs/WRITING_GUIDE.md` §4).
- **project/week**: jungle posts get `project: "krafton-jungle"` + `week: N`. Infer the
  week from what the user says ("2주차", "이것도 2주차") — if truly ambiguous, ask.
- **status**: always start as `"draft"`. Only flip to `"published"` when the user
  explicitly says to publish (see §5) — never assume.
- **thumbnail**: if the user attaches one, copy it into the post folder as
  `thumbnail.png`. If they don't and this post continues a week/series that already has
  one, reuse that exact file (`cp`, not a symlink) rather than asking for a new one.

## 2. Clean the body into proper MDX

- **Raw HTML `<img src="./x.png" width="...">` tags do NOT get the site's asset-path
  rewrite** (`assetUrl()` in `lib/content/index.ts` only rewrites markdown `![]()`
  syntax, not literal HTML `<img>` — confirmed bug, not a theory). Always convert to
  `![alt](./file.png)`. Small screenshots don't need an explicit width — `.prose img`
  has `max-width:100%; height:auto` with no forced `width:100%`, so they render at
  natural size.
- Strip Tailwind classes off pasted `<mark class="bg-yellow-200 ...">` — content-dir MDX
  isn't in Tailwind's scan globs so the class does nothing. Keep bare `<mark>`; browsers
  apply a default yellow highlight.
- Only `##`/`###` show up in the "ON THIS PAGE" TOC. If the raw draft uses `####` for
  what are actually top-level sections, promote them. Minor sub-labels (e.g. 장점/단점
  under a format name) can stay as `####` if TOC visibility isn't needed, or get
  promoted to `###` for a longer post where more TOC entries help navigation — use
  judgment based on post length.
- Fix escaped markdown / stray Notion-export artifacts (`\*\*`, smart quotes, etc.).

## 3. Placing images at `[Image #N]` markers

The user's pasted draft typically contains `![](https://velog.velcdn.com/...)` URL
placeholders (or literal `[Image #N]` markers), and separately attaches local
screenshots or gives local file paths, usually ending the message with something like
*"이미지 순서는 [Image #76] [Image #77] 이렇게야"* or *"이미지 위치엔 이거"*.

- That trailing sentence is an instruction to **you**, not body content — never include
  it in the published post.
- Match attachments to placeholders **in the order both appear** (first placeholder ↔
  first attached image, etc.) — cross-check by eyeballing what each screenshot actually
  shows against the surrounding text before committing to the mapping.
- Copy each local file into `content/{collection}/{slug}/` with a descriptive filename
  (`stack-frame.png`, not `image1.png`), and write meaningful `alt` text — it's slated
  for future RAG indexing per the writing guide.
- Local screenshot paths look like
  `/var/folders/.../TemporaryItems/NSIRD_screencaptureui_*/스크린샷 ....png` — quote
  them in shell commands (they contain spaces).

## 4. Verify before reporting done — every time

```bash
cd frontend
npm run sync:assets   # re-copies content/ images into public/content/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/blog/{slug}   # expect 200
# confirm every image path resolved (not left as a literal "./file.png"):
curl -s http://localhost:3000/blog/{slug} | grep -o '{filename}\.png'
# sanity-check heading/TOC structure:
curl -s http://localhost:3000/blog/{slug} | grep -o '<h[1-3][^>]*>[^<]*'
```

Note: **all** posts serve at `/blog/{slug}`, including jungle ones — `/jungle/{week}` is
only the week-archive listing page, not the individual post route.

Report back per post in the same compact style each time: file path, category/series/
week decision (with a one-line reason if it's a judgment call), image placement order,
verification result. If the user mentioned a batch total ("12개 더"), track and state the
running count of drafts remaining.

## 5. Publishing (only when the user explicitly says so)

Trigger phrases: "이제 배포하자", "전부 published로 바꿔줘", etc. — never do this
unprompted, drafts stay local-only otherwise.

```bash
cd frontend/content
grep -rl 'status: "draft"' */*/index.mdx        # confirm the exact set being flipped
# flip each with sed or Edit: status: "draft" -> status: "published"
grep -rl 'demo: true' ../content 2>/dev/null    # must be empty — real posts never carry this field
cd .. && npm run build                          # must succeed before pushing
```

Then, from the repo root:

```bash
git add frontend/content/{collection}/{slug} ...   # name each new post dir explicitly
git commit -m "..."                                 # never git add -A — the repo has
                                                      # unrelated untracked dirs (e.g.
                                                      # toss-clone-coding/) and Next.js
                                                      # regenerates frontend/next-env.d.ts
                                                      # on every build; leave both alone
git push origin main
```

Vercel auto-deploys on push to `main` (GitHub integration already wired up). Poll with
`vercel ls` / `vercel inspect <url>` (or a Monitor loop) until the new deployment shows
`Ready`, then confirm on the real domain:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://www.todaytech.me/blog/{slug}
```
