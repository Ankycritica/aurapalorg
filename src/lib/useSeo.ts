import { useEffect } from "react";

const SITE = "https://aurapal.org";

interface SeoOptions {
  title: string;
  description: string;
  path: string; // e.g. "/about"
  ogImage?: string;
  jsonLd?: object | object[];
}

function setMetaByName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaByProp(prop: string, content: string) {
  let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", prop);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const JSONLD_ID = "page-jsonld";
function setJsonLd(data?: object | object[]) {
  document.querySelectorAll(`script[data-seo="${JSONLD_ID}"]`).forEach((n) => n.remove());
  if (!data) return;
  const arr = Array.isArray(data) ? data : [data];
  arr.forEach((d) => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-seo", JSONLD_ID);
    s.textContent = JSON.stringify(d);
    document.head.appendChild(s);
  });
}

export function useSeo({ title, description, path, ogImage, jsonLd }: SeoOptions) {
  useEffect(() => {
    const url = `${SITE}${path}`;
    document.title = title;
    setMetaByName("description", description);
    setCanonical(url);
    setMetaByProp("og:title", title);
    setMetaByProp("og:description", description);
    setMetaByProp("og:url", url);
    setMetaByProp("og:type", path === "/" ? "website" : "article");
    if (ogImage) setMetaByProp("og:image", ogImage);
    setMetaByName("twitter:title", title);
    setMetaByName("twitter:description", description);
    setJsonLd(jsonLd);
  }, [title, description, path, ogImage, JSON.stringify(jsonLd)]);
}
