# SYSTEM://LOKESH

### Personal Portfolio of Lokeshprasanth Gadesula

**Senior Software & Applied AI Engineer**

[![Portfolio](https://img.shields.io/badge/Explore_Portfolio-imlokesh.me-00E5FF?style=for-the-badge&logo=googlechrome&logoColor=white)](https://imlokesh.me)

---

## About Me

I am a Senior Software and Applied AI Engineer specializing in the intersection of **distributed systems, backend infrastructure, data engineering, and production AI**.

With over six years of engineering experience, I build reliable backend platforms, large-scale data pipelines, LLM evaluation systems, and agentic workflows that solve real business problems.

My portfolio is designed as a distributed system rather than a conventional static website. It presents my experience, technical impact, projects, and engineering capabilities through an immersive system-inspired interface.

## Engineering Focus

- **Applied AI & LLM Systems**  
  LLM evaluation, hallucination detection, RAG, synthetic data generation, tool-calling agents, and production AI workflows.

- **Backend & Platform Engineering**  
  Resilient APIs, asynchronous services, distributed architectures, observability, and cloud-native platforms.

- **Data & Streaming Infrastructure**  
  High-throughput batch and streaming systems using Spark, Kafka, Airflow, AWS, and modern data platforms.

- **AI Inference & Optimization**  
  Model serving, quantization, KV-cache optimization, TensorRT-LLM, vLLM, ONNX Runtime, and GPU-aware inference.

## Portfolio Experience

This portfolio transforms my professional background into an interactive engineering system featuring:

- Animated production topology
- Traceable infrastructure nodes
- Experience presented as system build logs
- Technology and production-evidence graph
- Interactive project architecture explorer
- Engineering impact metrics
- Packet Router mini-game
- Interactive system terminal
- Keyboard command palette
- Hidden commands and debug modes
- Contact handshake experience

## Technology Stack

`Python` · `TypeScript` · `JavaScript` · `Go` · `Java` · `C++`  
`React` · `Next.js` · `FastAPI` · `Node.js` · `Spring Boot`  
`AWS` · `Docker` · `Kubernetes` · `Terraform` · `GitHub Actions`  
`Spark` · `Kafka` · `Airflow` · `PostgreSQL` · `Redis` · `Snowflake`  
`PyTorch` · `Hugging Face` · `LangGraph` · `vLLM` · `TensorRT-LLM`

## Featured Engineering Areas

- Distributed backend and cloud platforms
- Production LLM evaluation systems
- Agentic AI and tool-calling workflows
- Hybrid RAG and retrieval infrastructure
- Real-time streaming and data pipelines
- AI inference performance optimization
- Enterprise automation and document intelligence

## Explore My Portfolio

Visit **[imlokesh.me](https://imlokesh.me/)** to explore my engineering experience, production impact, technology stack, and featured projects.

## Visitor Analytics and Recruiter Mode

The portfolio remains a static Next.js export. Optional analytics use Supabase through narrowly scoped PostgreSQL RPC functions, so no database service-role key or notification webhook is shipped to the browser. Recruiter Mode works without analytics configuration and presents a condensed hiring brief using the same portfolio data.

### Events

The client can record `page_view`, `session_started`, `section_viewed`, `project_viewed`, `resume_opened`, `resume_downloaded`, `recruiter_mode_opened`, `contact_clicked`, `github_clicked`, `linkedin_clicked`, `visitor_identified`, and `engaged_visitor`.

No fingerprinting is used. A random session UUID is stored in `sessionStorage`; a simple returning-visitor flag is stored in `localStorage`. Referrer, UTM values, path, broad browser/device categories, event timestamps, and voluntarily submitted name/company values are collected. Both identity fields are optional. Do Not Track and obvious crawler user agents disable session tracking. No geolocation integration is configured; notifications report location as unavailable. Referrers retain only the origin, excluding paths and query strings.

### Live and engaged visitor logic

Visible tabs send a heartbeat every 30 seconds. “LIVE” means a browser session seen within the last 90 seconds; total visits count distinct stored sessions, so rapid refreshes in one tab do not increase the visit total. A session becomes engaged after any high-intent action, 75 seconds of activity, four viewed sections, or two viewed sections on a returning session. The database marks engagement once. The Edge Function uses a service-role-only atomic claim to attempt at most one engagement alert and one later identity alert per session. Identity-first alerts also suppress a later anonymous alert. Claims remain consumed on failure or timeout because an ambiguous webhook response may already have delivered; failed alerts require owner investigation, not automatic retries. This favors avoiding duplicates over guaranteed delivery.

### Supabase setup

1. Create a Supabase project and run [`supabase/migrations/202609240001_portfolio_analytics.sql`](supabase/migrations/202609240001_portfolio_analytics.sql) in the SQL editor of a new project. This is a transactional, one-time initial migration, not an upgrade script; it deliberately fails instead of overwriting existing tables.
2. Create `.env.local` containing only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Use the legacy anon JWT with this implementation (not an `sb_publishable_` key); keep function JWT verification enabled.
3. After approval, deploy `supabase/functions/portfolio-notify` as a Supabase Edge Function, including both `index.ts` and `cors.ts`.
4. Set custom server-only Edge Function secrets: `RESEND_API_KEY`, `PORTFOLIO_NOTIFICATION_EMAIL`, optional `PORTFOLIO_NOTIFICATION_FROM`, and `PORTFOLIO_ALLOWED_ORIGIN=https://imlokesh.me`. The function sends email through Resend and retains `PORTFOLIO_NOTIFICATION_WEBHOOK_URL` as an optional Slack-compatible fallback. Supabase automatically supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; never copy the service-role key into frontend env files.
5. Rebuild and deploy the static site so the two `NEXT_PUBLIC_` values are embedded at build time.

The notification function sends email through Resend when `RESEND_API_KEY` and `PORTFOLIO_NOTIFICATION_EMAIL` are configured. A Slack-compatible webhook remains available as an optional fallback. All provider credentials remain in Edge Function environment variables.

The repository does not ship a hidden admin route because GitHub Pages cannot securely authenticate a private dashboard. Use the authenticated Supabase dashboard/Table Editor for visitors today, live sessions, event totals, referrers, engaged sessions, and voluntarily identified visitors. A future private dashboard should authenticate through Supabase Auth and read through owner-only policies.


### Activation reliability and security

Writes wait for an explicit accepted session response. A document-scoped coordinator survives React Strict Mode replay, serializes events and identity writes, and reuses a request UUID if an event acknowledgement is lost. Heartbeats recover failed initialization without creating another session. The previous returning state is persisted separately for that session. Session-start, engagement, identity, and resume-open milestones count once per session; page views count once per document load, including a real refresh.

Anonymous callers cannot read or mutate tables directly. Only four public RPCs are executable by `anon`; the notification claim is executable only by `service_role`. Definer functions use an empty search path and fully qualified tables. Server checks bound payloads, serialize per-session rate checks (120 events per 10 minutes), cap new sessions at 300 per minute across the project, and bound notification claims to 30 distinct sessions per minute (at most 60 attempts if each has both alert types). Session IDs are random UUID capabilities, not authenticated identities. Origins and user agents can be spoofed outside browsers: these controls limit abuse but cannot prove human traffic, prevent all forged analytics, or guarantee availability against deliberate saturation. Add an authenticated ingestion gateway/challenge if targeted abuse occurs.

Function CORS accepts the exact configured HTTPS production origin. Missing, null, and unrelated origins are rejected before processing OPTIONS or POST. Localhost HTTP origins (any port) are accepted only when `PORTFOLIO_ALLOW_LOCALHOST=true`; keep it false/unset on the production backend and enable it for a development backend. SQL ingestion permits the listed imlokesh.me origins and localhost; changing the production domain also requires reviewing the SQL origin list. No `*` CORS responses are used.

No hosted SQL or Edge Function execution was performed during local activation fixes. Local regression tests use mocked requests and can be run with `node --test tests/analytics.test.cjs`. Database grants, constraints, and concurrency still need verification in the new Supabase project after explicit approval. Never run these tests against production credentials.

### Local development and deployment

```bash
npm install
npm run dev
```

Without valid Supabase values, the footer displays unavailable counts (`—`) and never invents traffic. Analytics failures are swallowed and cannot block navigation. Production builds use `npm run build`; GitHub Pages serves the generated `out` directory.

---

<p align="center">
  <strong>Engineered as a system. Presented as a portfolio.</strong>
</p>
