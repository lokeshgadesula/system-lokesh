# SYSTEM://LOKESH

A production-oriented personal portfolio for **Lokeshprasanth Gadesula** designed as a distributed system that happens to be a portfolio.

## Stack

- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS 4
- Motion for React
- Lucide React
- SVG/CSS-based architecture visualizations (no heavy 3D runtime)

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production check

```bash
npm run lint
npm run build
```

## Content configuration

Edit `portfolio.config.ts` to update:

- identity and positioning
- social/contact links
- résumé link
- navigation
- impact metrics
- engineering domains
- work experience
- technology graph evidence
- featured projects
- command palette items
- target roles

The résumé link is intentionally centralized so you can replace `#resume` with the hosted PDF URL without touching components.

## Signature interactions

- ~1.25s first-session boot sequence (skipped for reduced motion and repeat session visits)
- animated production topology with traceable nodes
- selectable system modules
- one-shot impact metric animation
- experience-as-system-build log
- grouped technology/evidence map with traceable production context
- architecture project explorer
- Packet Router engineering mini-game
- interactive portfolio terminal with Easter-egg commands
- CMD/CTRL + K command palette with arrow-key navigation and Enter selection
- Konami-code debug mode
- desktop-only semantic custom cursor
- contact handshake interaction

## Accessibility and performance choices

The site avoids a large WebGL/Three.js payload because the current concept can communicate infrastructure relationships with SVG and GPU-friendly transforms. It includes keyboard navigation, semantic sections, visible focus states, reduced-motion handling, descriptive diagram labels, mobile-specific simplification, and deferred interaction through client components.

## Deploy to GitHub Pages

Push to `main`. The workflow in `.github/workflows/deploy.yml` installs dependencies, builds the static export, and deploys `out/` to GitHub Pages. In the repository’s **Settings → Pages**, select **GitHub Actions** as the publishing source. The custom domain is `imlokesh.me`.

For a local production check:

```bash
npm ci
npm run build
```
