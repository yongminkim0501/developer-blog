"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  ArrowUpRight,
  LoaderCircle,
} from "lucide-react";
import { useServices } from "./providers";
import type { SearchItem } from "@/types";
const links = [
  ["기록", "/blog"],
  ["프로젝트", "/projects"],
  ["소개", "/about"],
];
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false),
    [menu, setMenu] = useState(false),
    [query, setQuery] = useState(""),
    [results, setResults] = useState<SearchItem[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const { resolvedTheme, setTheme } = useTheme();
  const { search } = useServices();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await search.search(query, controller.signal);
        if (result.success) setResults(result.data.results);
        else setError(result.error.message);
      } catch {
        if (!controller.signal.aborted)
          setError("검색 중 문제가 생겼어요. 다시 시도해주세요.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 120);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open, search]);
  return (
    <>
      <header className="site-header">
        <div className="shell header-inner">
          <Link className="wordmark" href="/" aria-label="DEV.LOG 홈">
            dev<span className="logo-dot">.</span>log
            <span className="wordmark-star">✳</span>
          </Link>
          <nav className="desktop-nav" aria-label="주 메뉴">
            {links.map(([name, url]) => (
              <Link
                key={url}
                href={url}
                aria-current={pathname.startsWith(url) ? "page" : undefined}
              >
                {name}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="search-trigger"
              onClick={() => setOpen(true)}
              aria-label="글 검색"
            >
              <Search size={17} />
              <span>검색</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              className="icon-button theme-toggle"
              aria-label="테마 전환"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              <Sun className="sun" size={18} />
              <Moon className="moon" size={18} />
            </button>
            <Dialog.Root open={menu} onOpenChange={setMenu}>
              <Dialog.Trigger asChild>
                <button
                  className="icon-button mobile-menu"
                  aria-label="메뉴 열기"
                >
                  <Menu size={21} />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="menu-panel">
                  <Dialog.Title>둘러보기</Dialog.Title>
                  <Dialog.Description className="sr-only">
                    블로그 메뉴
                  </Dialog.Description>
                  <Dialog.Close className="dialog-close" aria-label="닫기">
                    <X />
                  </Dialog.Close>
                  {links.map(([name, url]) => (
                    <Link key={url} href={url} onClick={() => setMenu(false)}>
                      {name}
                      <ArrowUpRight size={20} />
                    </Link>
                  ))}
                  <Link href="/brain" onClick={() => setMenu(false)}>
                    Ask my brain <ArrowUpRight size={20} />
                  </Link>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </header>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="search-dialog">
            <Dialog.Title className="search-title">
              어떤 기록을 찾고 있나요?
            </Dialog.Title>
            <Dialog.Description>
              제목, 주제, 태그로 검색해보세요.
            </Dialog.Description>
            <Dialog.Close className="dialog-close" aria-label="검색 닫기">
              <X size={20} />
            </Dialog.Close>
            <div className="search-field">
              <Search size={20} />
              <input
                aria-label="검색어"
                placeholder="Pintos, 메모리, 블로그…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {loading && <LoaderCircle size={18} className="spin" />}
            </div>
            <div className="search-results" aria-live="polite">
              {error ? (
                <p>{error}</p>
              ) : (
                results.map((p) => (
                  <Link
                    href={`/blog/${p.slug}`}
                    key={p.slug}
                    onClick={() => setOpen(false)}
                  >
                    <small>{p.category}</small>
                    <strong>{p.title}</strong>
                    <ArrowUpRight size={18} />
                  </Link>
                ))
              )}
              {!loading && !error && !results.length && (
                <p>일치하는 기록이 없어요. 다른 키워드를 입력해보세요.</p>
              )}
            </div>
            <div className="dialog-hint">
              기록 속에서, 다음 힌트를 찾아보세요. <kbd>ESC 닫기</kbd>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
