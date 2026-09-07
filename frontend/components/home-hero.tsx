"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, EffectFade, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import styles from "./home-hero.module.css";

export default function HomeHero() {
  return (
    <section aria-label="개발자 소개와 정글 이야기">
      <Swiper
        spaceBetween={30}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        rewind
        navigation
        pagination={{ clickable: true }}
        modules={[EffectFade, Navigation, Pagination, A11y]}
        a11y={{
          prevSlideMessage: "이전 슬라이드",
          nextSlideMessage: "다음 슬라이드",
          paginationBulletMessage: "{{index}}번 슬라이드로 이동",
          slideLabelMessage: "{{slidesLength}}개 중 {{index}}번째 슬라이드",
        }}
        className={styles.slider}
      >
        <SwiperSlide>
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
      </Swiper>
    </section>
  );
}
