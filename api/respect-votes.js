// TRUE ALPHA — Respect Vote API
// Put this file in: /api/respect-votes.js
//
// Required Vercel Environment Variables:
// UPSTASH_REDIS_REST_URL
// UPSTASH_REDIS_REST_TOKEN
// FIREBASE_WEB_API_KEY
//
// The frontend should send:
// Authorization: Bearer <Firebase ID token>
//
// This API keeps one vote per Firebase UID and shared totals for everyone.

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const firebaseApiKey = process.env.FIREBASE_WEB_API_KEY;

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function redis(command) {
  const response = await fetch(redisUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });

  if (!response.ok) {
    throw new Error("redis_error");
  }

  return response.json();
}

async function verifyFirebaseToken(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return null;

  const idToken = auth.slice(7).trim();
  if (!idToken || !firebaseApiKey) return null;

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  const user = data.users && data.users[0];

  if (!user || !user.localId) return null;

  return {
    uid: user.localId,
    email: user.email || ""
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!redisUrl || !redisToken || !firebaseApiKey) {
    return json(res, 500, {
      message: "Respect Vote backend is not configured."
    });
  }

  try {
    if (req.method === "GET") {
      const user = await verifyFirebaseToken(req);

      const [upResult, downResult] = await Promise.all([
        redis(["GET", "true_alpha:respect:up"]),
        redis(["GET", "true_alpha:respect:down"])
      ]);

      let userVote = null;

      if (user) {
        userVote = await redis(["GET", `true_alpha:respect:user:${user.uid}`]);
        userVote = userVote.result || null;
      }

      return json(res, 200, {
        up: Number(upResult.result || 0),
        down: Number(downResult.result || 0),
        userVote
      });
    }

    if (req.method === "POST") {
      const user = await verifyFirebaseToken(req);

      if (!user) {
        return json(res, 401, {
          message: "Authentication required."
        });
      }

      const vote = req.body && req.body.vote;

      if (vote !== "up" && vote !== "down") {
        return json(res, 400, {
          message: "Invalid vote."
        });
      }

      const userKey = `true_alpha:respect:user:${user.uid}`;

      // SET NX atomically reserves the UID for one vote only.
      const lock = await redis([
        "SET",
        userKey,
        vote,
        "NX"
      ]);

      if (lock.result !== "OK") {
        return json(res, 409, {
          message: "already_voted"
        });
      }

      const countKey =
        vote === "up"
          ? "true_alpha:respect:up"
          : "true_alpha:respect:down";

      await redis(["INCR", countKey]);

      const [upResult, downResult] = await Promise.all([
        redis(["GET", "true_alpha:respect:up"]),
        redis(["GET", "true_alpha:respect:down"])
      ]);

      return json(res, 200, {
        success: true,
        vote,
        up: Number(upResult.result || 0),
        down: Number(downResult.result || 0)
      });
    }

    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { message: "Method not allowed." });
  } catch (error) {
    return json(res, 500, {
      message: "Respect Vote service error."
    });
  }
}
