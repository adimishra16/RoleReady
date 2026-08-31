export type AiFeature = "rewrite" | "summary" | "cover_letter" | "job_match" | "ats_score";

export type AiAccessStatus = {
  enabled: boolean;
  globallyEnabled: boolean;
  authenticated: boolean;
  userId: string | null;
  reason?:
    | "db_missing"
    | "not_signed_in"
    | "user_missing"
    | "globally_disabled"
    | "user_disabled"
    | "limit_reached";
  rewrite: { used: number; limit: number; remaining: number };
  other: { used: number; limit: number; remaining: number };
};
