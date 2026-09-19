import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./theme.css";
import { portfolio } from "@/portfolio.config";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(portfolio.links.website),
  title: `${portfolio.identity.name} — ${portfolio.identity.role}`,
  description:
    "Distributed systems, backend infrastructure, and evaluation platforms built to make production AI reliable.",
  keywords: [
    "Lokeshprasanth Gadesula",
    "Senior Software Engineer",
    "Applied AI Engineer",
    "Backend Engineer",
    "Distributed Systems Engineer",
    "AI Systems Engineer",
    "Data Platform Engineer",
    "Python Engineer",
    "Go Engineer",
    "Kafka Engineer",
    "Spark Engineer",
    "LLM Evaluation Engineer",
    "Agentic AI Engineer",
  ],
  authors: [{ name: portfolio.identity.name, url: portfolio.links.website }],
  openGraph: {
    title: `${portfolio.identity.name} — SYSTEM://LOKESH`,
    description: "Infrastructure, backend platforms, and evaluation systems behind production AI.",
    type: "profile",
    url: portfolio.links.website,
    siteName: "SYSTEM://LOKESH",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image.png"],
    title: `${portfolio.identity.name} — SYSTEM://LOKESH`,
    description: "Infrastructure, backend platforms, and evaluation systems behind production AI.",
  },
  alternates: { canonical: portfolio.links.website },
};

const themeScript = `
  (function () {
    try {
      var saved = localStorage.getItem("portfolio-theme");
      document.documentElement.dataset.theme = saved === "light" || saved === "dark"
        ? saved
        : (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    } catch (_) {
      document.documentElement.dataset.theme = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
  })();
`;

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: portfolio.identity.name,
  url: portfolio.links.website,
  jobTitle: portfolio.identity.role,
  sameAs: [portfolio.links.github, portfolio.links.linkedin],
  knowsAbout: [
    "Distributed Systems",
    "Backend Engineering",
    "Applied AI",
    "LLM Evaluation",
    "Agentic Workflows",
    "Apache Kafka",
    "Apache Spark",
    "Python",
    "Go",
    "AWS",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${mono.variable}`} suppressHydrationWarning>
      <head><Script id="theme-preference" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
