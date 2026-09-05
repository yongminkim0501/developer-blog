"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowUpRight, Square, Sparkles } from "lucide-react";
import { useServices } from "./providers";
import type { Source } from "@/types";
type Message = { role: "user" | "assistant"; text: string; sources?: Source[] };
export default function Brain() {
  const [messages, setMessages] = useState<Message[]>([]),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const { chat } = useServices();
  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);
  async function send(value: string) {
    const message = value.trim();
    if (!message || busy) return;
    setInput("");
    setBusy(true);
    setError("");
    setMessages((p) => [
      ...p,
      { role: "user", text: message },
      { role: "assistant", text: "", sources: [] },
    ]);
    const controller = new AbortController();
    abort.current = controller;
    try {
      for await (const event of chat.stream(message, controller.signal)) {
        if (event.type === "token")
          setMessages((p) =>
            p.map((m, i) =>
              i === p.length - 1
                ? { ...m, text: m.text + event.data.content }
                : m,
            ),
          );
        if (event.type === "source")
          setMessages((p) =>
            p.map((m, i) =>
              i === p.length - 1
                ? { ...m, sources: [...(m.sources || []), event.data] }
                : m,
            ),
          );
        if (event.type === "error") setError(event.data.message);
      }
    } catch {
      if (!controller.signal.aborted)
        setError("응답을 불러오지 못했어요. 다시 시도해주세요.");
      else setError("응답을 중단했어요.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="brain-space">
      {!messages.length ? (
        <div className="brain-welcome">
          <span className="brain-symbol">
            <Sparkles size={36} />
          </span>
          <h2>기록에 말을 걸어보세요.</h2>
          <p>
            공부하며 만난 문제, 만들면서 배운 것.
            <br />
            쌓아둔 이야기에서 답을 찾아봅니다.
          </p>
          <div className="suggestions">
            {[
              "Pintos에 대해 어떤 기록이 있어?",
              "메모리 공부한 내용을 찾아줘",
              "블로그는 어떻게 만들었어?",
            ].map((q) => (
              <button onClick={() => send(q)} key={q}>
                {q}
                <ArrowUpRight size={17} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="messages" aria-live="polite" aria-busy={busy}>
          {messages.map((m, i) => (
            <div className={`message ${m.role}`} key={i}>
              <small>{m.role === "user" ? "YOU" : "DEV.LOG"}</small>
              <p>
                {m.text ||
                  (busy ? "기록을 살펴보고 있어요…" : "응답이 중단되었습니다.")}
              </p>
              {!!m.sources?.length && (
                <div className="sources">
                  <small>관련 기록</small>
                  {m.sources.map((s) => (
                    <Link href={s.url} key={s.slug}>
                      {s.title}
                      <ArrowUpRight size={16} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={bottom} />
        </div>
      )}
      {error && (
        <p role="status" className="chat-error">
          {error}
        </p>
      )}
      <form
        className="brain-input"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          maxLength={2000}
          onChange={(e) => setInput(e.target.value)}
          placeholder="내 개발 기록에 질문해보세요"
          aria-label="질문"
        />
        {busy ? (
          <button
            type="button"
            onClick={() => abort.current?.abort()}
            aria-label="응답 중단"
          >
            <Square size={17} />
          </button>
        ) : (
          <button disabled={!input.trim()} aria-label="질문 보내기">
            <ArrowUp size={20} />
          </button>
        )}
      </form>
      <p className="brain-notice">
        현재는 데모 응답을 제공합니다. 실제 AI 연결은 추후 추가됩니다.
      </p>
    </div>
  );
}
