import { get, put } from "@vercel/blob";

export default async function handler(request) {
  try {
    const pathname = "settings/site-status.json";

    if (request.method === "GET") {
      const blob = await get(pathname, {
        access: "public"
      });

      if (!blob) {
        return Response.json({
          enabled: true,
          message: ""
        });
      }

      return Response.json(await blob.json());
    }

    if (request.method === "POST") {
      const token = request.headers.get("x-admin-token");

      if (!token || token !== process.env.ADMIN_TOKEN) {
        return Response.json(
          {
            success: false,
            message: "Pa otorize."
          },
          { status: 401 }
        );
      }

      const data = await request.json();

      const settings = {
        enabled: data.enabled === true,
        message: data.message || ""
      };

      await put(
        pathname,
        JSON.stringify(settings),
        {
          access: "public",
          addRandomSuffix: false,
          contentType: "application/json"
        }
      );

      return Response.json({
        success: true,
        settings
      });
    }

    return Response.json(
      {
        success: false,
        message: "Method Not Allowed"
      },
      { status: 405 }
    );

  } catch (error) {
    console.error("SITE STATUS ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Erè backend."
      },
      { status: 500 }
    );
  }
          }
