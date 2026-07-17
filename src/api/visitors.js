/* api/visitors.js — place at project ROOT: /api/visitors.js
   Setup:
   1. npm install @upstash/redis
   2. Create a Redis database at upstash.com (free tier)
   3. In Vercel dashboard → your project → Settings → Environment Variables, add:
        UPSTASH_REDIS_REST_URL    (from Upstash console)
        UPSTASH_REDIS_REST_TOKEN  (from Upstash console)
   4. Redeploy
*/
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    if (req.method === "POST") {
      const count = await redis.incr("at23:visitors");
      return res.json({ count });
    }
    const count = (await redis.get("at23:visitors")) || 0;
    return res.json({ count });
  } catch (e) {
    /* Redis not connected yet — return 0, no crash */
    return res.json({ count: 0 });
  }
}