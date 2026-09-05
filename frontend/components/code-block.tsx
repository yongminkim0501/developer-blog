"use client";
import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
export default function CodeBlock(props: React.ComponentProps<"pre">) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false),
    [error, setError] = useState(false);
  return (
    <div className="code-block">
      <button
        aria-label="코드 복사"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(ref.current?.textContent || "");
            setCopied(true);
            setError(false);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            setError(true);
          }
        }}
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
        <span>{error ? "복사 실패" : copied ? "복사됨" : "복사"}</span>
      </button>
      <pre ref={ref} {...props} />
    </div>
  );
}
