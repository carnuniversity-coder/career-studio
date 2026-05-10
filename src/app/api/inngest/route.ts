import { serve } from "inngest/next";

import { inngest } from "@/lib/inngest";
import { sendNotificationDigests } from "@/server/inngest/notification-digests";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendNotificationDigests],
});
