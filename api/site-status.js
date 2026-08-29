import { get, put } from "@vercel/blob";

export async function GET(request) {
  try {
    const pathname = "settings/site-status.json";

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

  } catch (error) {
    console.error("SITE STATUS GET ERROR:", error);

    return Response.json(
      {
        enabled: true,
        message: ""
      },
      { status: 200 }
    );
  }
}

export async function POST(request) {
  try {
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
      "settings/site-status.json",
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

  } catch (error) {
    console.error("SITE STATUS POST ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Erè backend."
      },
      { status: 500 }
    );
  }
      }
