import { list } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed"
    });
  }

  try {
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

          if (!response.ok) continue;

          const order = await response.json();

          if (!order || !order.id) continue;

          /*
           * Nou kenbe sèlman enfòmasyon
           * Admin bezwen wè.
           */

          orders.push({
            id: order.id,

            uid: String(order.uid || ""),

            pack: String(order.pack || ""),

            price: Number(order.price || 0),

            supplierCost:
              Number(order.supplierCost || 0),

            profit:
              Number(
                order.profit ??
                (
                  Number(order.price || 0) -
                  Number(order.supplierCost || 0)
                )
              ),

            server:
              String(order.server || "NA"),

            customerEmail:
              String(
                order.customerEmail ||
                order.email ||
                ""
              ),

            customerName:
              String(
                order.customerName ||
                ""
              ),

            status:
              order.status || "pending",

            supplierOrderId:
              order.supplierOrderId || null,

            supplierStatus:
              order.supplierStatus || null,

            customerMessage:
              order.customerMessage || "",

            createdAt:
              order.createdAt || null,

            updatedAt:
              order.updatedAt || null
          });

        } catch (error) {
          console.error(
            "ORDER READ ERROR:",
            error
          );
        }
      }

      cursor =
        result.hasMore
          ? result.cursor
          : undefined;

    } while (cursor);

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

    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

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
