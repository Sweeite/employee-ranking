export type Employee = {
  id: number;
  name: string;
  title: string;
  emoji: string;
  created_at: string;
  score: number;
  vote_count: number;
};

export type VoteLogEntry = {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_emoji: string;
  delta: number;
  reaction: string;
  reason: string;
  created_at: string;
};
