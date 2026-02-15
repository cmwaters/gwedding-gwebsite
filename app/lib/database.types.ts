export interface Guest {
  id: string;
  invite_code: string;
  name: string;
  language: "en" | "es";
  rsvp_by: string | null;
  is_attending: boolean | null;
  invite_received?: boolean | null;
  email: string | null;
  comments: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardRow {
  id: string;
  name: string;
  score: number;
  created_at: string;
}
