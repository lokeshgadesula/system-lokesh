export const analyticsEvents = [
  "page_view",
  "session_started",
  "section_viewed",
  "project_viewed",
  "resume_opened",
  "resume_downloaded",
  "recruiter_mode_opened",
  "universe_button_clicked",
  "universe_launch",
  "universe_exit",
  "contact_clicked",
  "github_clicked",
  "linkedin_clicked",
  "visitor_identified",
  "engaged_visitor",
] as const;

export type AnalyticsEvent = (typeof analyticsEvents)[number];

export type AnalyticsMetadata = Record<string, string | number | boolean | null>;

export type VisitorStats = {
  liveSessions: number | null;
  totalVisits: number | null;
};
export type VisitorIdentity = {
  name?: string;
  company?: string;
};
