import {
  readSubscriptionJournal,
  resolveSubscriptionJournal,
} from "../src/features/subscriptions/server/subscription-journal.ts";
import { withSubscriberLock } from "../src/features/subscriptions/server/resend-coordination.ts";
import { getRedisClient } from "../src/lib/redis.ts";

const [command, email, expectedId] = process.argv.slice(2);
try {
  if (!email || !["status", "resolve"].includes(command) || (command === "resolve" && !expectedId)) {
    throw new Error("Usage: npm run subscription:journal -- status EMAIL | resolve EMAIL OPERATION_ID");
  }
  if (command === "status") console.log(JSON.stringify(await readSubscriptionJournal(email), null, 2));
  else {
    await withSubscriberLock(email, () => resolveSubscriptionJournal(email, expectedId));
    console.log("Reconciled journal cleared. No provider writes or emails were sent.");
  }
} finally {
  const redis = await getRedisClient().catch(() => null);
  if (redis?.isOpen) redis.destroy();
}
