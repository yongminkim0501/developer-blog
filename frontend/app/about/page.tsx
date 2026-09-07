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
import {
  ExperienceList,
  AwardsList,
  ProfileProjects,
} from "@/components/profile-sections";
export const metadata = { title: "소개" };
function initials(name: string) {
  const words = name.split(" ");
  return (
    words.length > 1 ? words.map((w) => w[0]).join("") : name.slice(0, 3)
  ).toUpperCase();
}
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
export default function Page() {
  return (
    <main className="shell about-page">
      <header className="page-heading">
        <span className="eyebrow">HELLO, I’M YONGMIN</span>
        <h1>
          어떻게보다,
          <br />왜 그런지 궁금합니다.
        </h1>
        <p>백엔드 개발자, 지금은 크래프톤 정글에서 CS를 파고드는 중입니다.</p>
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
            동작하는 코드에서 멈추지 않고, 왜 그렇게 동작하는지까지 파고드는 걸
            좋아합니다. 요즘은 서버가 어떻게 버티는가에 관심이 많습니다.
          </p>
          <p>
            정답만 정리하기보다 막혔던 지점과 생각이 바뀐 순간도 함께 남기려
            합니다. 삽질은 많이 하지만, 같은 삽질은 두 번 안 하려고 기록합니다.
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
        <ExperienceList />
      </section>

      <section className="section about-timeline">
        <div className="section-heading">
          <h2>수상</h2>
        </div>
        <AwardsList />
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
                        <span className="skill-fallback">{initials(name)}</span>
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
        <ProfileProjects />
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
