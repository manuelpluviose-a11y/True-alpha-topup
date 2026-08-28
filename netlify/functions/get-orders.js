import { getStore } from "@netlify/blobs";

export default async function handler(event) {
  try {
    const token =
      event.headers?.["x-admin-token"] ||
      event.headers?.["X-Admin-Token"];

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

    const store = getStore("true-alpha-orders");

    const result = await store.list();

    const orders = [];

    for (const item of result.blobs) {
      const order = await store.get(item.key, {
        type: "json"
      });

      if (order) {
        orders.push(order);
      }
    }

    orders.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
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

    console.error(
      "GET ORDERS ERROR:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        message: "Erè backend.",
        error: error.message
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
