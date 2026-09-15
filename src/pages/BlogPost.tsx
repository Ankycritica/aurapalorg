import { useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useSeo } from "@/lib/useSeo";
import { getPost, posts } from "@/content/posts";
import "@/styles/landing-mono.css";

/** Inline formatting: **bold**, *italic*, `code`. */
function inline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    const k = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={k} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={k} className="mono text-[0.9em] px-1.5 py-0.5 rounded bg-white/[0.07]">{part.slice(1, -1)}</code>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={k}>{part.slice(1, -1)}</em>;
    return <span key={k}>{part}</span>;
  });
}

/**
 * Minimal block renderer for the subset of markdown the posts use. A full
 * markdown library would be more capable, but this keeps the bundle small and
 * the output styled exactly like the rest of the monochrome pages.
 */
function renderBody(body: string) {
  const lines = body.trim().split("\n");
  const out: JSX.Element[] = [];
  let list: string[] = [];
  let ordered = false;

  const flushList = () => {
    if (!list.length) return;
    const Tag = ordered ? "ol" : "ul";
    out.push(
      <Tag key={`l-${out.length}`} className={`my-5 space-y-2 ${ordered ? "list-decimal" : "list-disc"} pl-5`}>
        {list.map((li, i) => (
          <li key={i} className="text-[15px] leading-[1.75]" style={{ color: "var(--lm-fg-2)" }}>
            {inline(li, `li-${out.length}-${i}`)}
          </li>
        ))}
      </Tag>
    );
    list = [];
  };

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (!line.trim()) { flushList(); return; }

    if (line.startsWith("## ")) {
      flushList();
      out.push(<h2 key={i} className="font-display text-[26px] sm:text-[30px] font-bold tracking-[-0.02em] mt-12 mb-4">{line.slice(3)}</h2>);
      return;
    }
    if (line.startsWith("### ")) {
      flushList();
      out.push(<h3 key={i} className="font-display text-xl font-semibold mt-8 mb-3">{line.slice(4)}</h3>);
      return;
    }
    if (line.startsWith("> ")) {
      flushList();
      out.push(
        <blockquote key={i} className="my-6 border-l-2 pl-5 py-1 hairline-2 text-[15px] leading-[1.75] italic" style={{ color: "var(--lm-fg-2)" }}>
          {inline(line.slice(2), `q-${i}`)}
        </blockquote>
      );
      return;
    }
    const num = line.match(/^(\d+)\.\s+(.*)$/);
    if (num) { if (!ordered) flushList(); ordered = true; list.push(num[2]); return; }
    if (line.startsWith("- ")) { if (ordered) flushList(); ordered = false; list.push(line.slice(2)); return; }

    flushList();
    out.push(
      <p key={i} className="my-5 text-[15px] sm:text-base leading-[1.8]" style={{ color: "var(--lm-fg-2)" }}>
        {inline(line, `p-${i}`)}
      </p>
    );
  });

  flushList();
  return out;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPost(slug) : undefined;

  const related = useMemo(() => posts.filter((p) => p.slug !== slug).slice(0, 2), [slug]);

  useSeo({
    title: post ? `${post.title} — AuraPal` : "Article — AuraPal",
    description: post?.teaser ?? "",
    path: `/blog/${slug ?? ""}`,
    jsonLd: post
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.teaser,
          datePublished: post.date,
          author: { "@type": "Organization", name: "AuraPal" },
          publisher: { "@type": "Organization", name: "AuraPal", url: "https://aurapal.org" },
          mainEntityOfPage: `https://aurapal.org/blog/${post.slug}`,
        }
      : undefined,
  });

  if (!post) return <Navigate to="/blog" replace />;

  const published = new Date(post.date).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="lm min-h-screen">
      <nav className="border-b hairline">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="AuraPal" className="h-7 w-7 rounded-md" />
            <span className="font-display font-semibold text-[15px]">AuraPal</span>
          </Link>
          <Link to="/blog" className="text-sm inline-flex items-center gap-1.5" style={{ color: "var(--lm-fg-2)" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> All articles
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-5 sm:px-6 pt-16 pb-20">
        <p className="section-number mb-4">
          {published} · {post.readingMinutes} min read
        </p>
        <h1 className="font-display text-[34px] sm:text-[46px] font-bold leading-[1.08] tracking-[-0.03em] mb-5">
          {post.title}
        </h1>
        <p className="text-lg leading-relaxed mb-10 pb-10 border-b hairline" style={{ color: "var(--lm-fg-2)" }}>
          {post.teaser}
        </p>

        {renderBody(post.body)}

        {post.tool && (
          <div className="panel p-6 mt-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Try it on your own</p>
              <p className="text-sm" style={{ color: "var(--lm-fg-2)" }}>Free, no credit card.</p>
            </div>
            <Link to={post.tool.to} className="btn-invert px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap">
              {post.tool.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t hairline">
            <p className="section-number mb-6">Keep reading.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link key={r.slug} to={`/blog/${r.slug}`} className="panel p-5 hover:bg-white/[0.03] transition-colors">
                  <p className="text-sm font-medium mb-1.5">{r.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--lm-fg-3)" }}>{r.teaser}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </div>
  );
}
