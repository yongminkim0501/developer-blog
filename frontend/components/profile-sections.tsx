import { ArrowUpRight } from "lucide-react";

const experience = [
  {
    period: "2026.08 – 2027.01",
    org: "크래프톤 정글 SW-AI랩 13기",
    role: "진행 중",
  },
  {
    period: "2020.03 – 2026.08",
    org: "한양대학교 ERICA 컴퓨터학부",
    role: "학사 졸업",
  },
  {
    period: "2025.07 – 2026.06",
    org: "롯데이노베이트 산학협력 캡스톤디자인",
    role: "기업 현직자 멘토링 · 격주/월 1회 비대면",
  },
];
const projects = [
  {
    title: "SHOW-GY",
    description:
      "AI 기반 업무 문서 요약 및 편집 시스템. 롯데이노베이트 산학 캡스톤 — 팀장.",
    tag: "🏆 우수상",
    href: "https://github.com/yongminkim0501/SHOW-GY",
  },
  {
    title: "AX 인재전쟁 — 기획 충돌 탐지 Codex 플러그인",
    description:
      "Z3 Solver 기반 기획 충돌 탐지 Codex 플러그인 (개인 프로젝트).",
    tag: "예비후보작",
    href: "https://github.com/yongminkim0501/AX-mediterapy-codex-plugin",
  },
  {
    title: "JungleGym",
    description:
      "정글 헬스장 인원 현황과 개인 오운완을 기록하는 서비스. 백엔드 담당, 현재 마이그레이션 진행 중.",
    tag: "미니 프로젝트",
    href: "https://github.com/yongminkim0501/JungleGym",
  },
  {
    title: "Spring | FastAPI Gateway 부하 테스트",
    description:
      "게이트웨이의 스레드 모델이 꼬리 지연(P99)에 미치는 차이를 수치로 확인하는 사이드 프로젝트.",
    tag: "진행 중",
    href: "https://github.com/yongminkim0501/spring-load-la",
  },
];

export function ExperienceList() {
  return (
    <div className="timeline-list">
      {experience.map((e) => (
        <div className="timeline-row" key={e.org}>
          <span className="timeline-period">{e.period}</span>
          <div>
            <strong>{e.org}</strong>
            <span className="timeline-role">{e.role}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AwardsList() {
  return (
    <div className="timeline-list">
      <div className="timeline-row">
        <span className="timeline-period">2026</span>
        <div>
          <strong>
            🥉 ERICA 소프트웨어융합대학 캡스톤디자인 경진대회 우수상 (3위)
          </strong>
          <span className="timeline-role">
            AI 기반 업무 문서 요약 및 편집 시스템 · 팀장
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProfileProjects() {
  return (
    <div className="about-project-list">
      {projects.map((p) => (
        <a
          key={p.title}
          href={p.href}
          target="_blank"
          rel="noreferrer"
          className="about-project-row"
        >
          <div>
            <span className="about-project-tag">{p.tag}</span>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
          </div>
          <ArrowUpRight size={20} />
        </a>
      ))}
    </div>
  );
}
