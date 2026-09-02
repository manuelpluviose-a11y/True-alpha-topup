import { head } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed"
    });
  }

  try {
    const id =
      typeof req.query.id === "string"
        ? req.query.id.trim()
        : "";

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID kòmand lan obligatwa."
      });
    }

    const pathname = `orders/${id}.json`;

    const blob = await head(pathname).catch(() => null);

    if (!blob || !blob.url) {
      return res.status(404).json({
        success: false,
        message: "Kòmand lan pa egziste."
      });
    }

    const response = await fetch(
      `${blob.url}?t=${Date.now()}`,
      {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      }
    );

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        message: "Pa kapab li kòmand lan."
      });
    }

    const order = await response.json();

    if (!order || order.id !== id) {
      return res.status(404).json({
        success: false,
        message: "Kòmand lan pa egziste."
      });
    }

    const status = order.status || "pending";

    let customerMessage =
      order.customerMessage || "";

    if (status === "pending" && !customerMessage) {
      customerMessage =
        "🕐 Kòmand ou an an atant.";
    }

    if (status === "processing" && !customerMessage) {
      customerMessage =
        "⏳ Kòmand ou an ap trete.";
    }

    if (status === "success" && !customerMessage) {
      customerMessage =
        "✅ Kòmand ou an valide avèk siksè!";
    }

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    return res.status(200).json({
      success: true,
      order: {
        id: order.id,
        status,
        customerMessage,
        updatedAt: order.updatedAt || null
      }
    });

  } catch (error) {
    console.error("GET ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Erè backend."
    });
  }
      }
