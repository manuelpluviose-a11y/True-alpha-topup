const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body || "{}");

    const { uid, pack, price, senderNumber, server } = data;

    if (!uid || !pack || !price || !senderNumber) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Enfòmasyon kòmand lan manke."
        })
      };
    }

    const store = getStore("true-alpha-orders");

    const id = "TA-" + Date.now();

    const order = {
      id,
      uid,
      pack,
      price,
      senderNumber,
      server: server || "NA — Amérique du Nord",
      status: "pending",
      createdAt: new Date().toISOString()
    };

    await store.setJSON(id, order);

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: true,
        message: "Kòmand lan resevwa.",
        order
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Erè backend."
      })
    };
  }
};
