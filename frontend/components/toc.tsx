"use client";
import type { PointerEvent } from "react";

type Heading = { id: string; text: string; level: number };

export default function Toc({ headings }: { headings: Heading[] }) {
  function followPointer(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    // Scale the falloff to the list's own height so every item shifts a
    // little, not just whichever one the cursor sits on.
    const listHeight = event.currentTarget.getBoundingClientRect().height;
    const falloff = Math.max(160, listHeight);
    event.currentTarget
      .querySelectorAll<HTMLElement>("a")
      .forEach((link) => {
        const rect = link.getBoundingClientRect();
        const distance = Math.abs(
          event.clientY - (rect.top + rect.height / 2),
        );
        const proximity = Math.max(0, 1 - distance / falloff);
        link.style.setProperty("--toc-proximity", String(proximity));
      });
  }

  function resetProximity(event: PointerEvent<HTMLElement>) {
    event.currentTarget
      .querySelectorAll<HTMLElement>("a")
      .forEach((link) => link.style.removeProperty("--toc-proximity"));
  }

  return (
    <aside
      className="toc"
      aria-label="목차"
      onPointerMove={followPointer}
      onPointerLeave={resetProximity}
      onPointerCancel={resetProximity}
    >
      <span>ON THIS PAGE</span>
      {headings.map((heading) => (
        <a
          style={{ paddingLeft: heading.level === 3 ? 12 : 0 }}
          href={`#${heading.id}`}
          key={heading.id}
        >
          {heading.text}
        </a>
      ))}
    </aside>
  );
}
