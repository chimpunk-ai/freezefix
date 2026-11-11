// Tiny, safe Markdown renderer for our own legal pages (headings, paragraphs, bullet lists,
// tables, **bold**, `code` and [links](url)). Only renders text we wrote; no HTML is injected.
//
// Every "## " heading gets a stable id derived from its text, so the section index on
// long pages (LegalShell) and the browser's back/forward history can target it.

import type { ReactNode } from "react";

export type Heading = { id: string; text: string };

/** "## 3. What we collect and why" → "3-what-we-collect-and-why". Stable across renders. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/\*\*|\[|\]\([^)]*\)|`/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/** The level-2 headings of a source, in order. Pure; used by the section index. */
export function headingsOf(source: string): Heading[] {
  return source
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => {
      const text = l.slice(3).trim();
      return { id: headingId(text), text: text.replace(/\*\*/g, "") };
    });
}

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={`${keyBase}-b${i++}`} className="font-semibold text-ink">{m[1]}</strong>);
    else if (m[4]) out.push(<code key={`${keyBase}-c${i++}`} className="rounded bg-chip px-1 py-0.5 text-[0.9em] text-ink">{m[4]}</code>);
    else {
      const href = m[3];
      const external = /^https?:/.test(href);
      out.push(
        <a
          key={`${keyBase}-a${i++}`}
          href={href}
          className="text-accent underline underline-offset-2"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {m[2]}
        </a>
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function Markdown({ source }: { source: string }) {
  const lines = source.trim().split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i].trimEnd();
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={k++} className="font-display text-40 leading-tight text-ink">
          {inline(line.slice(2), `h${k}`)}
        </h1>
      );
      i++;
    } else if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      blocks.push(
        <h2 key={k++} id={headingId(text)} className="mt-8 scroll-mt-20 font-display text-28 leading-tight text-ink">
          {inline(text, `h${k}`)}
        </h2>
      );
      i++;
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) items.push(lines[i++].slice(2));
      blocks.push(
        <ul key={k++} className="list-disc space-y-2 pl-5">
          {items.map((t, j) => (
            <li key={j}>{inline(t, `l${k}-${j}`)}</li>
          ))}
        </ul>
      );
    } else if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].split("|").slice(1, -1).map((c) => c.trim());
        if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      blocks.push(
        <div key={k++} className="overflow-x-auto rounded-card border border-line">
          <table className="w-full text-left text-14">
            <thead className="bg-card">
              <tr>
                {head.map((c, j) => (
                  <th key={j} scope="col" className="px-3 py-2 font-semibold text-ink">
                    {inline(c, `th${k}-${j}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri} className="border-t border-line align-top">
                  {r.map((c, j) => (
                    <td key={j} className="px-3 py-2">
                      {inline(c, `td${k}-${ri}-${j}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      blocks.push(<p key={k++}>{inline(line, `p${k}`)}</p>);
      i++;
    }
  }
  return <div className="flex flex-col gap-4 text-16 leading-relaxed text-ink-soft">{blocks}</div>;
}
