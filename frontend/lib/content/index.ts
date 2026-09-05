import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import type { Collection, Post } from "@/types";
export function allContent(collection: Collection): Post[] {
  const base = path.join(process.cwd(), "content", collection);
  if (!fs.existsSync(base)) return [];
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => {
      const file = path.join(base, d.name, "index.mdx");
      if (!fs.existsSync(file)) return [];
      const { data, content } = matter(fs.readFileSync(file, "utf8"));
      if (data.status === "draft" && process.env.NODE_ENV === "production")
        return [];
      for (const key of ["title", "description", "status"])
        if (typeof data[key] !== "string")
          throw new Error(`${file}: ${key} is required`);
      if (
        collection !== "projects" &&
        !["draft", "published"].includes(data.status)
      )
        throw new Error(`${file}: invalid status`);
      const date =
        data.date instanceof Date
          ? data.date.toISOString().slice(0, 10)
          : String(data.date || "2026-09-05");
      return [
        {
          ...data,
          slug: d.name,
          collection,
          title: data.title,
          description: data.description,
          status: data.status,
          date,
          category: data.category || "Project",
          tags: data.tags || [],
          body: content,
          readingTime: Math.max(
            1,
            Math.ceil(content.split(/\s+/).length / 180),
          ),
          thumbnail: data.thumbnail
            ? assetUrl(collection, d.name, data.thumbnail)
            : undefined,
        } as Post,
      ];
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
export function posts() {
  return [...allContent("blog"), ...allContent("jungle")].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}
export function postUrl(post: Pick<Post, "collection" | "slug">) {
  return `/${post.collection === "projects" ? "projects" : "blog"}/${post.slug}`;
}
export function assetUrl(collection: string, slug: string, src: string) {
  return src.startsWith("./")
    ? `/content/${collection}/${slug}/${src.slice(2)}`
    : src;
}
export function headings(body: string) {
  const slugger = new GithubSlugger();
  return body
    .replace(/```[\s\S]*?```/g, "")
    .split("\n")
    .flatMap((line) => {
      const m = /^(#{2,3}) (.+)$/.exec(line);
      return m
        ? [{ level: m[1].length, text: m[2], id: slugger.slug(m[2]) }]
        : [];
    });
}
export function dateLabel(date: string) {
  return date.replaceAll("-", ".");
}
