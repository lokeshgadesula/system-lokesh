import type { AnalyticsEvent } from "./types";

const highIntentEvents = new Set<AnalyticsEvent>([
  "resume_opened",
  "resume_downloaded",
  "recruiter_mode_opened",
  "contact_clicked",
]);

export type EngagementState = {
  seconds: number;
  sections: number;
  returning: boolean;
  highIntent: boolean;
};

export function isEngaged(state: EngagementState) {
  return state.highIntent || state.seconds >= 75 || state.sections >= 4 || (state.returning && state.sections >= 2);
}
export function isHighIntentEvent(event: AnalyticsEvent) {
  return highIntentEvents.has(event);
}
