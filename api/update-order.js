import { get, put } from "@vercel/blob";

export default async function handler(request) {
  if (request.method !== "POST") {
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

  try {
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

    const data = await request.json();

    const { id, status } = data;

    if (
      !id ||
      !["processing", "success", "failed"].includes(status)
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Kòmand oswa status pa valid."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const pathname = `orders/${id}.json`;

    const existing = await get(pathname, {
      access: "public"
    });

    if (!existing) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Kòmand lan pa egziste."
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const order = await existing.json();

    order.status = status;
    order.updatedAt = new Date().toISOString();

    await put(
      pathname,
      JSON.stringify(order),
      {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json"
      }
    );

    return new Response(
      JSON.stringify({
        success: true,
        order
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);

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
