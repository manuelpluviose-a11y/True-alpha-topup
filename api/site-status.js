import { get, put } from "@vercel/blob";

const PATH = "settings/site-status.json";

export async function GET() {
  try {
    const blob = await get(PATH, {
      access: "public"
    });

    if (!blob) {
      return Response.json({
        enabled: true,
        message: ""
      });
    }

    const response = new Response(blob.stream);

    const settings = await response.json();

    return Response.json({
      enabled: settings.enabled === true,
      message: settings.message || ""
    });

  } catch (error) {
    console.error(
      "SITE STATUS GET ERROR:",
      error
    );

    /*
     * Si pa gen settings ankò,
     * sit la rete ON pa default.
     */

    return Response.json({
      enabled: true,
      message: ""
    });
  }
}

export async function POST(request) {
  try {
    const token =
      request.headers.get("x-admin-token");

    if (
      !token ||
      token !== process.env.ADMIN_TOKEN
    ) {
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
      message:
        typeof data.message === "string"
          ? data.message.trim()
          : ""
    };

    await put(
      PATH,
      JSON.stringify(settings),
      {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json"
      }
    );

    return Response.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error(
      "SITE STATUS POST ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Erè backend."
      },
      { status: 500 }
    );
  }
      }
