import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { posts } from "@/lib/content";
import Header from "@/components/header";
import { Providers } from "@/components/providers";
import "./globals.css";
const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
});
export const metadata: Metadata = {
  title: {
    default: "DEV.LOG — 배우고, 만들고, 기록합니다.",
    template: "%s · DEV.LOG",
  },
  description:
    "개발자 Yongmin의 학습 기록과 프로젝트. Backend, Systems, Krafton Jungle.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = posts().map(({ slug, title, description, category, tags }) => ({
    slug,
    title,
    description,
    category,
    tags,
  }));
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={pretendard.variable}>
        <Providers items={items}>
          <a className="skip-link" href="#main-content">
            본문으로 건너뛰기
          </a>
          <Header />
          <div id="main-content">{children}</div>
          <footer className="site-footer shell">
            <div className="footer-top">
              <Link className="wordmark" href="/">
                dev<span className="logo-dot">.</span>log
                <span className="wordmark-star">✳</span>
              </Link>
              <p>
                배움은 기록이 되고,
                <br />
                기록은 다음의 나를 만듭니다.
              </p>
              <Link href="/about">
                조금 더 알아보기 <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="footer-bottom">
              <span>© 2026 Yongmin. Built with curiosity.</span>
              <div>
                <Link href="/categories">주제별 기록</Link>
              </div>
              <span>
                계속 배우는 중 <i className="status-dot" />
              </span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
