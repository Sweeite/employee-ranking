export type Employee = {
  id: number;
  name: string;
  title: string;
  emoji: string;
  created_at: string;
  creator_id: number | null;
  creator_username: string | null;
  score: number;
  vote_count: number;
};

export type User = {
  id: number;
  username: string;
  rep: number;
};

export type VoteLogEntry = {
  kind: "vote";
  id: number;
  employee_name: string;
  employee_emoji: string;
  delta: number;
  reaction: string;
  reason: string;
  actor_username: null;
  message: null;
  created_at: string;
};

export type DramaLogEntry = {
  kind: "delete" | "milestone";
  id: number;
  employee_name: string;
  employee_emoji: string;
  delta: null;
  reaction: null;
  reason: null;
  actor_username: string | null;
  message: string;
  created_at: string;
};

export type LogEntry = VoteLogEntry | DramaLogEntry;

export type Milestone = {
  milestone: number;
  message: string;
};
