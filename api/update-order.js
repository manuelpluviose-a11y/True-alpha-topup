import { get, put } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method Not Allowed"
      });
    }

    const token = req.headers["x-admin-token"];

    if (!token || token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({
        success: false,
        message: "Pa otorize."
      });
    }

    const data = req.body || {};

    const { id, status } = data;

    if (
      !id ||
      !["processing", "success", "failed"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Kòmand oswa status pa valid."
      });
    }

    const pathname = `orders/${id}.json`;

    const existing = await get(pathname, {
      access: "public"
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Kòmand lan pa egziste."
      });
    }

    const response = await fetch(existing.url);

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        message: "Pa kapab li kòmand lan."
      });
    }

    const order = await response.json();

    order.status = status;
    order.updatedAt = new Date().toISOString();

    await put(
      pathname,
      JSON.stringify(order),
      {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json"
      }
    );

    return res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Erè backend."
    });
  }
        }
