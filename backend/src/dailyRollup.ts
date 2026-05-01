// Scaffold only — not exported in MVP. Reserved for when reports need
// pre-aggregated stats. Cron entry point would compute per-user daily totals
// for the previous day and write to users/{uid}/dailyStats/{YYYY-MM-DD}.
import { onSchedule } from 'firebase-functions/v2/scheduler';

export const dailyRollup = onSchedule(
  { schedule: '0 0 * * *', timeZone: 'Asia/Seoul' },
  async () => {
    // Implementation deferred. Will iterate users, sum yesterday's meals and
    // purchases, and write a stats doc per user.
  },
);
