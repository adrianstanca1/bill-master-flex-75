
import React, { useEffect } from "react";

type SEOProps = {
  title: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  noindex?: boolean;
  jsonLd?: Record<string, any> | Array<any>;
  openGraph?: {
    title?: string;
    description?: string;
    type?: string;
    image?: string;
    url?: string;
  };
};

function upsertMeta(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function upsertProperty(property: string, content: string) {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

const SEO: React.FC<SEOProps> = ({ title, description, keywords, canonical, noindex, jsonLd, openGraph }) => {
  useEffect(() => {
    // Title
    document.title = title.slice(0, 60);

    // Meta description
    if (description) {
      upsertMeta("description", description.slice(0, 160));
    }

    // Keywords
    if (keywords) {
      upsertMeta("keywords", keywords);
    }

    // Robots
    upsertMeta("robots", noindex ? "noindex, nofollow" : "index, follow");

    // Canonical
    const href = canonical || window.location.href;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;

    // Open Graph tags
    if (openGraph) {
      if (openGraph.title) {
        upsertProperty("og:title", openGraph.title);
      }
      if (openGraph.description) {
        upsertProperty("og:description", openGraph.description);
      }
      if (openGraph.type) {
        upsertProperty("og:type", openGraph.type);
      }
      if (openGraph.image) {
        upsertProperty("og:image", openGraph.image);
      }
      if (openGraph.url) {
        upsertProperty("og:url", openGraph.url);
      }
    }

    // Structured data
    const id = "seo-jsonld";
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = id;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, canonical, noindex, jsonLd, openGraph]);

  return null;
};

export default SEO;
