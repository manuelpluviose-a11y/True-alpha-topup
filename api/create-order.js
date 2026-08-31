import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed"
    });
  }

  try {
    const data = req.body || {};

    const {
      id,
      uid,
      pack,
      price,
      senderNumber,
      server,
      transactionId,
      transaction_id,
      transId,
      code
    } = data;

    if (!uid || !pack || !price) {
      return res.status(400).json({
        success: false,
        message: "UID, pack ak pri obligatwa."
      });
    }

    // Ranmase kòd tranzaksyon an nenpòt ki jan l rele
    const finalTransactionId = 
      transactionId || 
      transaction_id || 
      transId || 
      code || 
      "";

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
      senderNumber: senderNumber ? String(senderNumber) : "",
      transactionId: String(finalTransactionId),
      server: server ? String(server) : "",
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

    return res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Erè backend."
    });
  }
}
