<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Titre de la page</title>
</head>
<body>
    
</body>
</html>const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
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

    const store = getStore("true-alpha-orders");

    const result = await store.list();

    const orders = [];

    for (const item of result.blobs) {
      const order = await store.get(item.key, {
        type: "json"
      });

      if (order) orders.push(order);
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
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Erè backend."
      })
    };
  }
};