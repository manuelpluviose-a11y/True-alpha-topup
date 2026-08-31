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

    const blobDetails = await head(pathname).catch(() => null);

    if (!blobDetails || !blobDetails.url) {
      return res.status(404).json({
        success: false,
        message: "Kòmand lan pa egziste."
      });
    }

    /*
     * Cache-buster:
     * Sa anpeche browser/CDN retounen ansyen status la.
     */
    const cacheBuster = `?t=${Date.now()}`;

    const response = await fetch(
      blobDetails.url + cacheBuster,
      {
        method: "GET",
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

    /*
     * Toujou voye dènye status ak mesaj la.
     */
    const status =
      order.status || "pending";

    let customerMessage =
      order.customerMessage || "";

    /*
     * Si update-order deja mete failed,
     * nou garanti kliyan an toujou resevwa mesaj la.
     */
    if (
      status === "failed" &&
      !customerMessage
    ) {
      customerMessage =
        "❌ Nou pa resevwa peman an. Kòmand lan echwe.";
    }

    if (
      status === "processing" &&
      !customerMessage
    ) {
      customerMessage =
        "⏳ Pwodui ou an ap antre nan kèk segonn.";
    }

    if (
      status === "success" &&
      !customerMessage
    ) {
      customerMessage =
        "✅ Pwodui ou an te trete avèk siksè!";
    }

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    res.setHeader(
      "Pragma",
      "no-cache"
    );

    res.setHeader(
      "Expires",
      "0"
    );

    return res.status(200).json({
      success: true,

      order: {
        id: order.id,

        status: status,

        customerMessage:
          customerMessage,

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
