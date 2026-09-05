import { readdir, mkdir, copyFile, rm } from "node:fs/promises";
import path from "node:path";
const source = path.resolve("content"),
  target = path.resolve("public/content");
await rm(target, { recursive: true, force: true });
async function copy(from, to) {
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name),
      dest = path.join(to, entry.name);
    if (entry.isDirectory()) await copy(src, dest);
    else if (!/\.(mdx?|tsx?|jsx?|json)$/i.test(entry.name))
      await copyFile(src, dest);
  }
}
await copy(source, target);
console.log("Post-local images synced.");
