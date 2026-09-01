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

    const {
      id,
      status,
      customerMessage
    } = data;

    /*
     * Admin nan kapab voye:
     *
     * processing
     * success
     * failed
     */

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

    const blobDetails =
      await head(pathname).catch(() => null);

    if (!blobDetails || !blobDetails.url) {
      return res.status(404).json({
        success: false,
        message: "Kòmand lan pa egziste."
      });
    }

    /*
     * Li dènye vèsyon kòmand lan.
     */

    const response = await fetch(
      `${blobDetails.url}?t=${Date.now()}`,
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

    /*
     * PA kite yon kòmand ki deja fini
     * tounen nan pending/processing.
     */

    if (
      order.status === "success" ||
      order.status === "failed"
    ) {
      return res.status(200).json({
        success: true,
        order,
        message: "Kòmand sa a deja fini."
      });
    }

    /*
     * SI ADMIN NAN PEZE VALIDÉ,
     * NOU METE L SUCCESS DIRÈKTEMAN.
     *
     * processing ap toujou disponib si
     * ou bezwen li pita.
     */

    if (status === "processing") {
      order.status = "success";
    } else {
      order.status = status;
    }

    order.updatedAt =
      new Date().toISOString();

    /*
     * MESAJ KLIYAN AN
     */

    if (order.status === "failed") {

      order.customerMessage =
        customerMessage?.trim() ||
        "Nou pa resevwa peman an.";

    }

    if (order.status === "success") {

      order.customerMessage =
        customerMessage?.trim() ||
        "Pwodui ou an te trete avèk siksè!";

    }

    /*
     * SOVE NOUVO STATUS LA NAN
     * MENM KÒMAND LAN.
     */

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

    console.error(
      "UPDATE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erè backend."
    });

  }
}
