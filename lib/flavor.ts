function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const FREE_DELETE_MESSAGES: Array<(actor: string, emoji: string, name: string) => string> = [
  (actor, emoji, name) => `${actor} deleted their own creation, ${emoji} ${name}. Creator's privilege — no rep lost, no questions asked.`,
  (actor, emoji, name) => `${emoji} ${name} has been quietly erased by ${actor}, their creator. Clean getaway.`,
  (actor, emoji, name) => `${actor} pulled the plug on ${emoji} ${name}. It's their toy, their rules.`,
];

const PAID_DELETE_MESSAGES: Array<(actor: string, emoji: string, name: string) => string> = [
  (actor, emoji, name) => `${actor} deleted ${emoji} ${name} — a rank they didn't create. -3 rep for the audacity.`,
  (actor, emoji, name) => `${emoji} ${name} got yeeted off the board by ${actor}, who had no such authority. Rep court has ruled: -3.`,
  (actor, emoji, name) => `${actor} committed unsanctioned deletion of ${emoji} ${name}. HR has been notified. -3 rep.`,
  (actor, emoji, name) => `In a shocking twist, ${actor} deleted someone else's entry (${emoji} ${name}) and paid for it. -3 rep.`,
];

export function deleteMessage(actor: string, emoji: string, name: string, isCreator: boolean): string {
  return isCreator ? pick(FREE_DELETE_MESSAGES)(actor, emoji, name) : pick(PAID_DELETE_MESSAGES)(actor, emoji, name);
}

export const MILESTONES = [5, 10, 20, 35, 50, 75, 100, 150, 200];

const POSITIVE_MILESTONE_MESSAGES: Array<(emoji: string, name: string, m: number) => string> = [
  (emoji, name, m) => `🎉 ${emoji} ${name} just cracked +${m}! Someone alert HR — a legend is forming.`,
  (emoji, name, m) => `${emoji} ${name} hit +${m}! The office parade has been scheduled for 3pm sharp.`,
  (emoji, name, m) => `Breaking: ${emoji} ${name} broke +${m}. Analysts are calling it "unprecedented synergy."`,
  (emoji, name, m) => `${emoji} ${name} reached +${m} and the vending machine gave them a free snack out of respect.`,
  (emoji, name, m) => `+${m} for ${emoji} ${name}! Rumor has it the CEO wants their autograph.`,
];

const NEGATIVE_MILESTONE_MESSAGES: Array<(emoji: string, name: string, m: number) => string> = [
  (emoji, name, m) => `💀 ${emoji} ${name} just sank to ${m}. Security has been notified.`,
  (emoji, name, m) => `${emoji} ${name} hit rock bottom at ${m}... and then kept digging.`,
  (emoji, name, m) => `Rumor has it ${emoji} ${name} is now banned from the vending machine after hitting ${m}.`,
  (emoji, name, m) => `${emoji} ${name} dropped to ${m}. HR has opened a "concerned coworkers" support group.`,
  (emoji, name, m) => `${m} for ${emoji} ${name}. Even the office plant is judging them now.`,
];

export function milestoneMessage(emoji: string, name: string, milestone: number): string {
  return milestone > 0
    ? pick(POSITIVE_MILESTONE_MESSAGES)(emoji, name, milestone)
    : pick(NEGATIVE_MILESTONE_MESSAGES)(emoji, name, milestone);
}

/** Returns the milestone crossed by moving from oldScore to newScore, or null if none. */
export function crossedMilestone(oldScore: number, newScore: number): number | null {
  if (newScore > oldScore) {
    for (const m of MILESTONES) {
      if (oldScore < m && newScore >= m) return m;
    }
  } else if (newScore < oldScore) {
    for (const m of MILESTONES) {
      if (oldScore > -m && newScore <= -m) return -m;
    }
  }
  return null;
}
