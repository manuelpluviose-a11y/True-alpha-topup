import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const PORT = Number(process.env.PORT || 10000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   MIDDLEWARE
========================= */

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({
  limit: "5mb"
}));

app.use(express.urlencoded({
  extended: true,
  limit: "5mb"
}));

/* =========================
   FRONTEND
========================= */

app.use(express.static(__dirname, {
  index: false
}));

/* =========================
   ADMIN TOKEN
========================= */

function checkAdmin(req, res, next) {

  const savedToken =
    process.env.ADMIN_TOKEN || "";

  const receivedToken =
    req.headers["x-admin-token"] || "";

  if (!savedToken) {
    return res.status(500).json({
      success: false,
      message: "ADMIN_TOKEN pa configuré nan Render."
    });
  }

  if (!receivedToken) {
    return res.status(401).json({
      success: false,
      message: "ADMIN_TOKEN manke."
    });
  }

  if (receivedToken !== savedToken) {
    return res.status(401).json({
      success: false,
      message: "ADMIN_TOKEN la pa bon."
    });
  }

  next();
}

/* =========================
   HEALTH
========================= */

app.get("/api/health", (_req, res) => {

  res.json({
    success: true,
    service: "TRUE ALPHA TopUp",
    status: "online"
  });

});

/* =========================
   ADMIN LOGIN
   IMPORTANT:
   Admin HTML itilize /api/get-orders
========================= */

app.get("/api/get-orders", checkAdmin, (_req, res) => {

  res.json({
    success: true,
    orders: []
  });

});

/* =========================
   SITE STATUS
========================= */

app.get("/api/site-status", (_req, res) => {

  res.json({
    success: true,
    enabled: true,
    message: ""
  });

});

app.post("/api/site-status", checkAdmin, (req, res) => {

  const enabled =
    req.body?.enabled !== false;

  const message =
    String(req.body?.message || "");

  res.json({
    success: true,
    enabled,
    message
  });

});

/* =========================
   FRONTEND HOME
========================= */

app.get("/", (_req, res) => {

  res.sendFile(
    path.join(__dirname, "index.html")
  );

});

/* =========================
   HOME
========================= */

app.get("/home", (_req, res) => {

  res.sendFile(
    path.join(__dirname, "index.html")
  );

});

/* =========================
   API 404
========================= */

app.use("/api", (_req, res) => {

  res.status(404).json({
    success: false,
    message: "API route not implemented yet."
  });

});

/* =========================
   FRONTEND FALLBACK
========================= */

app.use((req, res, next) => {

  if (req.method !== "GET") {
    return next();
  }

  if (req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile(
    path.join(__dirname, "index.html")
  );

});

/* =========================
   FINAL 404
========================= */

app.use((_req, res) => {

  res.status(404).json({
    success: false,
    message: "Route not found."
  });

});

/* =========================
   START
========================= */

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `TRUE ALPHA TopUp running on port ${PORT}`
  );

});
