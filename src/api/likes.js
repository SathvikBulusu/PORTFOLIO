/* api/likes.js — place at project ROOT: /api/likes.js
   Same Redis setup as api/visitors.js
*/
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    /* GET ?ids=p0,p1,p2  — bulk fetch like counts */
    if (req.method === "GET") {
      const ids = (req.query.ids || "").split(",").filter(Boolean);
      if (!ids.length) return res.json({});

      const keys = ids.map(id => `at23:likes:${id}`);
      const vals  = await redis.mget(...keys);

      const result = {};
      ids.forEach((id, i) => { result[id] = Number(vals[i] || 0); });
      return res.json(result);
    }

    /* POST { photoId, action: "like"|"unlike" } */
    if (req.method === "POST") {
      const { photoId, action } = req.body || {};
      if (!photoId || !action) return res.status(400).json({ error: "Missing fields" });

      const key = `at23:likes:${photoId}`;
      let count;
      if (action === "like") {
        count = await redis.incr(key);
      } else {
        count = await redis.decr(key);
        if (count < 0) { await redis.set(key, 0); count = 0; }
      }
      return res.json({ count });
    }

    return res.status(405).end();
  } catch (e) {
    return res.json({ count: 0 });
  }
}