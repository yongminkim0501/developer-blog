import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import { stdin, stdout } from "node:process";

const rl = readline.createInterface({ input: stdin, output: stdout, terminal: false });
const lines = rl[Symbol.asyncIterator]();
const ask = async (question, fallback = "") => {
  stdout.write(question);
  const { value, done } = await lines.next();
  const answer = (done ? "" : value).trim();
  return answer || fallback;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function yamlList(values) {
  return `[${values.map((v) => `"${v}"`).join(", ")}]`;
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("새 글을 만듭니다. 모르는 항목은 그냥 Enter로 넘어가도 됩니다.\n");

  const collectionChoice = await ask(
    "어디에 쓸 글인가요? 1) blog  2) jungle  3) projects  [1]: ",
    "1",
  );
  const collection = { 1: "blog", 2: "jungle", 3: "projects" }[
    collectionChoice
  ] ?? "blog";

  let slug = "";
  while (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    slug = await ask(
      "URL 주소(영문 소문자, 숫자, 하이픈만) 예: my-new-post\nslug: ",
    );
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
      console.log("  → 영문 소문자/숫자/하이픈만 사용해주세요.\n");
  }

  const dir = path.join(process.cwd(), "content", collection, slug);
  if (await exists(dir)) {
    console.log(`\n이미 "${dir}" 폴더가 있어요. 다른 slug를 사용해주세요.`);
    rl.close();
    return;
  }

  const title = await ask("제목: ");
  const description = await ask("한두 문장 요약: ");

  let frontmatter = [
    `title: "${title}"`,
    `description: "${description}"`,
    `date: "${today()}"`,
    `status: "draft"`,
  ];

  if (collection === "projects") {
    const status = await ask(
      "진행 상태 1) in-progress  2) completed  [1]: ",
      "1",
    );
    const tech = await ask("사용 기술 (쉼표로 구분, 예: Spring, Redis): ");
    const github = await ask("GitHub 주소 (없으면 Enter): ");
    frontmatter = [
      `title: "${title}"`,
      `description: "${description}"`,
      `status: "${status === "2" ? "completed" : "in-progress"}"`,
      tech && `tech: ${yamlList(tech.split(",").map((t) => t.trim()).filter(Boolean))}`,
      github && `github: "${github}"`,
    ].filter(Boolean);
  } else {
    const category = await ask("카테고리 (예: Backend, Operating System): ");
    const tags = await ask("태그 (쉼표로 구분, 예: spring, http): ");
    const series = await ask("시리즈 이름 (없으면 Enter): ");
    const featured = await ask("홈 대표글로 노출할까요? (y/N): ");
    frontmatter.push(`category: "${category || "Backend"}"`);
    frontmatter.push(
      `tags: ${yamlList(tags.split(",").map((t) => t.trim()).filter(Boolean))}`,
    );
    if (series) frontmatter.push(`series: "${series}"`);
    if (/^y(es)?$/i.test(featured)) frontmatter.push(`featured: true`);
    if (collection === "jungle") {
      const week = await ask("정글 몇 주차인가요? (숫자): ");
      frontmatter.push(`project: "krafton-jungle"`);
      if (week) frontmatter.push(`week: ${Number(week) || 1}`);
    }
  }

  const body = `## 시작하며

여기에 내용을 씁니다.

{/* 이미지: ![설명](./thumbnail.png) 처럼 같은 폴더 상대경로로 넣으세요 */}
{/* 이미지 아래 설명: <Caption>설명 텍스트</Caption> */}
{/* 강조 박스: <Callout>강조하고 싶은 문장</Callout> */}
`;

  const mdx = `---\n${frontmatter.join("\n")}\n---\n\n${body}`;

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.mdx"), mdx, "utf8");

  console.log(`\n생성 완료: content/${collection}/${slug}/index.mdx`);
  console.log(`확인: http://localhost:3000/${collection === "projects" ? "projects" : "blog"}/${slug}`);
  console.log(`다 쓰면 index.mdx에서 status를 "published"로 바꾸세요.`);
  rl.close();
}

main();
