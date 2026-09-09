"use client";

import Link from "next/link";
import type { PointerEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  A11y,
  Autoplay,
  EffectFade,
  Navigation,
  Pagination,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import styles from "./home-hero.module.css";

export default function HomeHero() {
  function followPointer(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    const bullets = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        ".swiper-pagination-bullet",
      ),
    );
    // Measure fixed hit areas so the animated dots cannot shift their own targets.
    const sizes = bullets.map((bullet) => {
      const rect = bullet.getBoundingClientRect();
      const distance = Math.hypot(
        event.clientX - (rect.left + rect.width / 2),
        event.clientY - (rect.top + rect.height / 2),
      );
      const proximity = Math.max(0, 1 - distance / 90);
      return 12 + 8 * proximity * proximity;
    });
    bullets.forEach((bullet, index) => {
      bullet.style.setProperty("--indicator-size", `${sizes[index]}px`);
    });
  }

  function resetIndicators(event: PointerEvent<HTMLElement>) {
    event.currentTarget
      .querySelectorAll<HTMLElement>(".swiper-pagination-bullet")
      .forEach((bullet) => bullet.style.removeProperty("--indicator-size"));
  }

  return (
    <section
      aria-label="개발자 소개, 정글 이야기와 기술 블로그 정리"
      onPointerMove={followPointer}
      onPointerLeave={resetIndicators}
      onPointerCancel={resetIndicators}
    >
      <Swiper
        spaceBetween={30}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        rewind
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          pauseOnMouseEnter: true,
          disableOnInteraction: false,
        }}
        modules={[EffectFade, Navigation, Pagination, A11y, Autoplay]}
        a11y={{
          prevSlideMessage: "이전 슬라이드",
          nextSlideMessage: "다음 슬라이드",
          paginationBulletMessage: "{{index}}번 슬라이드로 이동",
          slideLabelMessage: "{{slidesLength}}개 중 {{index}}번째 슬라이드",
        }}
        className={styles.slider}
      >
        <SwiperSlide className={styles.introSlide}>
          <div className="shell home-intro">
            <div className="intro-topline">
              <span className="eyebrow">
                <i className="status-dot" /> A DEVELOPER’S FIELD NOTES
              </span>
            </div>
            <h1>
              안녕하세요
              <br />
              <span>
                개발자{" "}
                <Link href="/about" className="name-highlight">
                  김용민
                </Link>
                입니다.
              </span>
            </h1>
            <div className="intro-bottom">
              <p>
                코드 너머의 이유를 찾아가는 과정
                <br />
                작은 궁금증부터 직접 만든 것들까지 여기 기록합니다
              </p>
              <div className="intro-topics">
                BACKEND <span>/</span> SYSTEMS
              </div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="jungle-feature">
            <div className="shell jungle-feature-inner">
              <div>
                <span className="eyebrow">LEARNING IN THE JUNGLE</span>
                <h2>
                  몰입의 시간,
                  <br />
                  나의 정글 이야기.
                </h2>
                <p>
                  알고리즘부터 운영체제까지.
                  <br />
                  직접 부딪히고 이해하며 쌓아가는 학습의 발자취.
                </p>
                <Link className="pill-link" href="/jungle">
                  정글 기록 살펴보기 <ArrowUpRight size={18} />
                </Link>
              </div>
              <div className="jungle-art" aria-hidden="true">
                <span className="jungle-ring ring-one" />
                <span className="jungle-ring ring-two" />
                <span className="jungle-ring ring-three" />
                <div className="jungle-art-label">
                  INTO
                  <br />
                  THE
                  <br />
                  <em>JUNGLE.</em>
                </div>
                <span className="jungle-coordinate">
                  37° 16′ N &nbsp; 127° 02′ E
                </span>
                <span className="jungle-star">✳</span>
              </div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className={styles.techFeature}>
            <div className={`shell ${styles.techInner}`}>
              <div>
                <span className="eyebrow">TECH BLOG NOTES</span>
                <h2>
                  읽고, 이해하고,
                  <br />
                  기술 블로그 정리.
                </h2>
                <p>
                  다양한 서비스의 기술과 문제 해결 과정.
                  <br />
                  기술 블로그를 읽고 배운 내용을 모았습니다.
                </p>
                <Link className="pill-link" href="/tech-blog">
                  기술 블로그 정리 살펴보기 <ArrowUpRight size={18} />
                </Link>
              </div>
              <div className={styles.techArt} aria-hidden="true">
                <span className={styles.techArtLabel}>
                  READ.
                  <br />
                  THINK.
                  <br />
                  <em>RECORD.</em>
                </span>
                <span className={styles.techArtCaption}>
                  IDEAS WORTH KEEPING
                </span>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </section>
  );
}
