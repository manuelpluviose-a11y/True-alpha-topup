import { requireUser } from "../lib/firebaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  try {
    const user = await requireUser(req);

    return res.status(200).json({
      ok: true,
      user: {
        uid: user.uid,
        email: user.email || null,
        name: user.name || null,
        picture: user.picture || null
      }
    });
  } catch (error) {
    console.error("Firebase Auth:", error);

    return res.status(error.statusCode || 401).json({
      ok: false,
      error: error.message || "Unauthorized"
    });
  }
        }
