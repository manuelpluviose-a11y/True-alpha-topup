const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  try {
    const token =
      event.headers["x-admin-token"] ||
      event.headers["X-Admin-Token"];

    if (!token || token !== process.env.ADMIN_TOKEN) {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          success: false,
          message: "Pa otorize."
        })
      };
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
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: true,
        orders
      })
    };

  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: false,
        message: "Erè backend."
      })
    };
  }
};
