import { put } from "@vercel/blob";

export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json(
      {
        success: false,
        message: "Method Not Allowed"
      },
      { status: 405 }
    );
  }

  try {
    const data = await request.json();

    const {
      id,
      uid,
      pack,
      price,
      senderNumber,
      server
    } = data;

    if (!uid || !pack || !price) {
      return Response.json(
        {
          success: false,
          message: "UID, pack ak pri obligatwa."
        },
        { status: 400 }
      );
    }

    const orderId =
      id ||
      `order-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    const order = {
      id: orderId,
      uid: String(uid),
      pack: String(pack),
      price: String(price),
      senderNumber: senderNumber
        ? String(senderNumber)
        : "",
      server: server
        ? String(server)
        : "",
      status: "pending",
      createdAt: new Date().toISOString()
    };

    await put(
      `orders/${orderId}.json`,
      JSON.stringify(order),
      {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json"
      }
    );

    return Response.json({
      success: true,
      order
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Erè backend."
      },
      { status: 500 }
    );
  }
          }
