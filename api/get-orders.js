import { list } from "@vercel/blob";

export default async function handler(request) {
  try {
    if (request.method !== "GET") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Method Not Allowed"
        }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const token = request.headers.get("x-admin-token");

    if (!token || token !== process.env.ADMIN_TOKEN) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Pa otorize."
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const result = await list({
      prefix: "orders/"
    });

    const orders = [];

    for (const blob of result.blobs) {
      try {
        const response = await fetch(blob.url);

        if (!response.ok) continue;

        const order = await response.json();

        if (order) {
          orders.push(order);
        }
      } catch (error) {
        console.error("ORDER READ ERROR:", error);
      }
    }

    orders.sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    );

    return new Response(
      JSON.stringify({
        success: true,
        orders
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Erè backend."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
        }
