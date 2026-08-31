import { put, head } from "@vercel/blob";

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

    if (!id || !["processing", "success", "failed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Kòmand oswa status pa valid."
      });
    }

    const pathname = `orders/${id}.json`;

    // 1. Jwenn enfòmasyon fichye a nan Vercel Blob
    const blobDetails = await head(pathname).catch(() => null);

    if (!blobDetails || !blobDetails.url) {
      return res.status(404).json({
        success: false,
        message: "Kòmand lan pa egziste."
      });
    }

    // 2. Telechaje akstra done JSON yo
    const response = await fetch(blobDetails.url, { cache: "no-store" });
    const order = await response.json();

    // 3. Mete ajou status la ak mesaj pou kliyan an
    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (status === "processing") {
      order.customerMessage = "⏳ Pwodui ou an ap antre nan kèk segonn.";
    }

    if (status === "failed") {
      order.customerMessage = "❌ Nou pa resevwa peman an. Kòmand lan echwe.";
    }

    if (status === "success") {
      order.customerMessage = "✅ Pwodui ou an te trete avèk siksè!";
    }

    // 4. Anrejistre kòmand lan ak nouvo status la
    await put(pathname, JSON.stringify(order), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json"
    });

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
