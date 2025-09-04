import { ImageResponse } from "@vercel/og";
import { client } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params; // ✅ no await
    console.log("Generating OG for slug:", slug);

    const link = await client.link.findUnique({
      where: { slug },
    });

    if (!link) {
      return new Response("Not found", { status: 404 });
    }

    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            position: "relative",
          }}
        >
          {/* Main image */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "40px",
            }}
          >
            {link.imageUrl ? (
              <img
                src={link.imageUrl}
                alt={link.title}
                style={{
                  width: "400px",
                  height: "400px",
                  objectFit: "cover",
                  borderRadius: "20px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "400px",
                  height: "400px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                📷
              </div>
            )}
          </div>

          {/* Title badge at bottom */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              padding: "20px 40px",
              borderRadius: "50px",
              fontSize: "32px",
              fontWeight: "bold",
              color: "#333",
              textAlign: "center",
              maxWidth: "80%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            {link.title || "Untitled Link"}
          </div>

          {/* Subtle watermark */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              fontSize: "16px",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            linkshare.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error("OG Image generation error:", e);
    return new Response("Failed to generate image", { status: 500 });
  }
}