import { get, del } from "@vercel/blob";

export default async function handler(req, res) {

  try {

    if (req.method !== "POST") {

      return res.status(405).json({
        success: false,
        message: "Method Not Allowed"
      });
    }

    const token =
      req.headers["x-admin-token"];

    if (
      !token ||
      token !== process.env.ADMIN_TOKEN
    ) {

      return res.status(401).json({
        success: false,
        message: "Pa otorize."
      });
    }

    const data = req.body || {};

    const id = data.id;

    if (!id) {

      return res.status(400).json({
        success: false,
        message:
          "ID kòmand lan obligatwa."
      });
    }

    const pathname =
      `orders/${id}.json`;

    const existing =
      await get(pathname, {
        access: "public"
      });

    if (!existing) {

      return res.status(404).json({
        success: false,
        message:
          "Kòmand lan pa egziste."
      });
    }

    const response =
      new Response(existing.stream);

    const order =
      await response.json();

    /*
      Pa kite admin efase
      yon kòmand ki toujou an atant.
    */

    if (order.status === "pending") {

      return res.status(400).json({
        success: false,
        message:
          "Ou pa ka efase yon kòmand ki an atant."
      });
    }

    await del(pathname);

    return res.status(200).json({
      success: true,
      message:
        "Kòmand lan efase avèk siksè."
    });

  } catch (error) {

    console.error(
      "DELETE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Erè backend."
    });
  }
}
