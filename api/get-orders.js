import { list } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
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

    let cursor;
    const orders = [];

    do {
      const result = await list({
        prefix: "orders/",
        ...(cursor ? { cursor } : {})
      });

      for (const blob of result.blobs) {
        try {
          const url = `${blob.url}?t=${Date.now()}`;

          const response = await fetch(url, {
            method: "GET",
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
              "Pragma": "no-cache"
            }
          });

          if (!response.ok) {
            continue;
          }

          const order = await response.json();

          if (!order || !order.id) {
            continue;
          }

          /*
           * RETOUNE TOUT KÒMAND YO.
           *
           * pending    = an atant
           * processing = ap trete
           * success    = siksè
           * failed     = echèk
           */
          orders.push(order);

        } catch (error) {
          console.error(
            "ORDER READ ERROR:",
            error
          );
        }
      }

      cursor = result.hasMore
        ? result.cursor
        : undefined;

    } while (cursor);

    /*
     * Pi nouvo kòmand an premye.
     */
    orders.sort((a, b) => {
      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    });

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
      orders
    });

  } catch (error) {
    console.error(
      "GET ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erè backend."
    });
  }
      }
