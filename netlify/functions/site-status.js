const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const store = getStore("true-alpha-settings");

  try {

    if (event.httpMethod === "GET") {

      const settings = await store.get("site-status", {
        type: "json"
      });

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          settings || {
            enabled: true,
            message: ""
          }
        )
      };
    }

    if (event.httpMethod === "POST") {

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

      const settings = {
        enabled: data.enabled === true,
        message: data.message || ""
      };

      await store.setJSON(
        "site-status",
        settings
      );

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          success: true,
          settings
        })
      };
    }

    return {
      statusCode: 405,
      body: "Method Not Allowed"
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
