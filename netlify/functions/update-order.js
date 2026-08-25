const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const token = event.headers["x-admin-token"];

    if (token !== process.env.ADMIN_TOKEN) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          message: "Pa otorize."
        })
      };
    }

    const data = JSON.parse(event.body || "{}");

    const { id, status } = data;

    if (!id || !["processing", "failed"].includes(status)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Kòmand oswa status pa valid."
        })
      };
    }

    const store = getStore("true-alpha-orders");

    const order = await store.get(id, {
      type: "json"
    });

    if (!order) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          message: "Kòmand lan pa egziste."
        })
      };
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    await store.setJSON(id, order);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: true,
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
