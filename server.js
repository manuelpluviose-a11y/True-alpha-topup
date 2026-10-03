import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { requireUser } from "./lib/firebaseAdmin.js";

const app = express();

const PORT = Number(process.env.PORT || 10000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================================
   MIDDLEWARE
================================ */

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({
  limit: "2mb"
}));

app.use(express.urlencoded({
  extended: true,
  limit: "2mb"
}));

/* ================================
   FRONTEND
================================ */

/*
  Render ap sèvi index.html ki nan
  menm folder ak server.js la.
*/

app.use(express.static(__dirname, {
  index: false
}));

/* ================================
   BASIC BACKEND CHECK
================================ */

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "TRUE ALPHA TopUp",
    status: "online"
  });
});

/* ================================
   FIREBASE USER CHECK
================================ */

app.get("/api/me", async (req, res) => {
  try {
    const user = await requireUser(req);

    res.status(200).json({
      success: true,
      uid: user.uid,
      email: user.email || "",
      name: user.name || "",
      picture: user.picture || ""
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Backend error."
    });
  }
});

/* ================================
   FRONTEND ROUTE
================================ */

/*
  Lè moun ouvri:
  https://YOUR-RENDER-LINK.onrender.com/

  Render ap voye index.html.
*/

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/*
  Si frontend la itilize lòt URL san
  extension, retounen index.html tou.
*/

app.get("/home", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* ================================
   API 404
================================ */

app.use("/api", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not implemented yet."
  });
});

/* ================================
   FRONTEND FALLBACK
================================ */

/*
  Nenpòt route ki pa API kapab retounen
  index.html pou navigation frontend la.
*/

app.use((req, res, next) => {

  if (req.method !== "GET") {
    return next();
  }

  if (req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile(path.join(__dirname, "index.html"));
});

/* ================================
   FINAL 404
================================ */

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

/* ================================
   START SERVER
================================ */

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `TRUE ALPHA TopUp backend running on port ${PORT}`
  );
});
