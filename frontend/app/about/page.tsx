import Link from "next/link";
import { ArrowUpRight, Github, Mail } from "lucide-react";
import {
  siSpring,
  siNestjs,
  siFastapi,
  siDjango,
  siFlask,
  siMysql,
  siMariadb,
  siMongodb,
  siRedis,
  siJenkins,
  siDocker,
  siGooglegemini,
  siClaude,
  siLangchain,
  siPytorch,
  siHuggingface,
  siJira,
  siNotion,
  siGithub,
} from "simple-icons";
export const metadata = { title: "소개" };
function initials(name: string) {
  const words = name.split(" ");
  return (
    words.length > 1
      ? words.map((w) => w[0]).join("")
      : name.slice(0, 3)
  ).toUpperCase();
}
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
const stack = [
  {
    label: "Backend",
    items: [
      { name: "Spring", icon: siSpring },
      { name: "NestJS", icon: siNestjs },
      { name: "FastAPI", icon: siFastapi },
      { name: "Django", icon: siDjango },
      { name: "Flask", icon: siFlask },
    ],
  },
  {
    label: "Database & Cache",
    items: [
      { name: "MySQL", icon: siMysql },
      { name: "MariaDB", icon: siMariadb },
      { name: "MongoDB", icon: siMongodb },
      { name: "Redis", icon: siRedis },
    ],
  },
  {
    label: "Infrastructure & CI/CD",
    items: [
      { name: "AWS", icon: undefined },
      { name: "Jenkins", icon: siJenkins },
      { name: "Docker", icon: siDocker },
    ],
  },
  {
    label: "AI & LLM",
    items: [
      { name: "OpenAI API", icon: undefined },
      { name: "Gemini API", icon: siGooglegemini },
      { name: "Claude API", icon: siClaude },
      { name: "Spring AI", icon: undefined },
      { name: "LangChain", icon: siLangchain },
      { name: "PyTorch", icon: siPytorch },
      { name: "Hugging Face", icon: siHuggingface },
    ],
  },
  {
    label: "Collaboration",
    items: [
      { name: "Slack", icon: undefined },
      { name: "Jira", icon: siJira },
      { name: "Notion", icon: siNotion },
      { name: "GitHub", icon: siGithub },
    ],
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
    description: "Z3 Solver 기반 기획 충돌 탐지 Codex 플러그인 (개인 프로젝트).",
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
export default function Page() {
  return (
    <main className="shell about-page">
      <header className="page-heading">
        <span className="eyebrow">HELLO, I’M YONGMIN</span>
        <h1>
          어떻게보다,
          <br />왜 그런지 궁금합니다.
        </h1>
        <p>
          백엔드 개발자, 지금은 크래프톤 정글에서 CS를 파고드는 중입니다.
        </p>
      </header>
      <div className="about-grid">
        <div className="about-visual">
          <span>
            STAY
            <br />
            CURIOUS<span className="logo-dot">.</span>
          </span>
          <i>✳</i>
          <small>LEARN. BUILD. DOCUMENT. REPEAT.</small>
        </div>
        <div className="about-copy">
          <span className="eyebrow">BEHIND THE NOTES</span>
          <h2>기록하며 한 걸음씩.</h2>
          <p>
            동작하는 코드에서 멈추지 않고, 왜 그렇게 동작하는지까지 파고드는
            걸 좋아합니다. 요즘은 서버가 어떻게 버티는가에 관심이 많습니다.
          </p>
          <p>
            정답만 정리하기보다 막혔던 지점과 생각이 바뀐 순간도 함께 남기려
            합니다. 삽질은 많이 하지만, 같은 삽질은 두 번 안 하려고
            기록합니다.
          </p>
          <div className="about-interests">
            <span>Backend Architecture</span>
            <span>Performance Optimization</span>
            <span>LLM Applications</span>
          </div>
          <Link className="text-link" href="/projects">
            만들고 있는 것들 <ArrowUpRight size={19} />
          </Link>
        </div>
      </div>

      <section className="section about-timeline">
        <div className="section-heading">
          <h2>지나온 시간</h2>
        </div>
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
      </section>

      <section className="section about-timeline">
        <div className="section-heading">
          <h2>수상</h2>
        </div>
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
      </section>

      <section className="section about-stack">
        <div className="section-heading">
          <h2>Skills</h2>
        </div>
        <div className="stack-groups">
          {stack.map(({ label, items }) => (
            <div className="stack-group" key={label}>
              <span className="stack-label">{label}</span>
              <div className="skill-grid">
                {items.map(({ name, icon }) => (
                  <div className="skill-item" key={name}>
                    <span className="skill-icon">
                      {icon ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d={icon.path} />
                        </svg>
                      ) : (
                        <span className="skill-fallback">
                          {initials(name)}
                        </span>
                      )}
                    </span>
                    <span className="skill-name">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section about-projects">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SIDE PROJECTS</span>
            <h2>Projects</h2>
          </div>
        </div>
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
      </section>

      <section className="section about-contact">
        <div className="section-heading">
          <h2>연락</h2>
        </div>
        <div className="about-contact-links">
          <a
            className="text-link"
            href="https://github.com/yongminkim0501"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={18} /> GitHub
          </a>
          <a className="text-link" href="mailto:yongmingim166@gmail.com">
            <Mail size={18} /> Email
          </a>
        </div>
      </section>
    </main>
  );
}
