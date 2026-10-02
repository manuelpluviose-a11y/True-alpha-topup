import express from "express";
import cors from "cors";
import { requireUser } from "./lib/firebaseAdmin.js";

const app = express();
const PORT = Number(process.env.PORT || 10000);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "TRUE ALPHA TopUp backend",
    status: "online"
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

app.get("/api/me", async (req, res) => {
  try {
    const user = await requireUser(req);
    res.json({
      success: true,
      uid: user.uid,
      email: user.email || "",
      name: user.name || ""
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Backend error."
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not implemented yet."
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`TRUE ALPHA backend listening on port ${PORT}`);
});
