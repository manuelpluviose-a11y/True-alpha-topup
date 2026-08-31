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

    let cursor = undefined;
    const orders = [];

    do {
      const result = await list({
        prefix: "orders/",
        ...(cursor ? { cursor } : {})
      });

      for (const blob of result.blobs) {
        try {
          const response = await fetch(
            blob.url,
            { cache: "no-store" }
          );

          if (!response.ok) continue;

          const order = await response.json();

          if (order && order.id) {
            orders.push(order);
          }

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

    orders.sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
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
