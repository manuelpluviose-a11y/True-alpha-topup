import { head } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        message: "Method Not Allowed"
      });
    }

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

    const blobDetails =
      await head(pathname).catch(() => null);

    if (!blobDetails || !blobDetails.url) {
      return res.status(404).json({
        success: false,
        message: "Kòmand lan pa egziste."
      });
    }

    const response = await fetch(
      blobDetails.url,
      {
        cache: "no-store"
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

    return res.status(200).json({
      success: true,

      order: {
        id: order.id,

        status:
          order.status || "pending",

        customerMessage:
          order.customerMessage || "",

        updatedAt:
          order.updatedAt || null
      }
    });

  } catch (error) {

    console.error(
      "GET ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erè backend."
    });
  }
      }
