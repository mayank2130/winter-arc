import { client } from "@/lib/prisma";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const link = await client.link.findUnique({ where: { slug } });

  if (!link) {
    return {
      title: "Link not found",
    };
  }

  const title = link.title || "Check this out";
  const description = "Custom shared link";
  const fallbackImage = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/og/${slug}`;
  const image = link.imageUrl || fallbackImage;

  const base = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${base}/u/${slug}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function LinkPreview({ params }: Props) {
  const { slug } = await params;
  const link = await client.link.findUnique({ where: { slug } });

  if (!link) return <div>Link not found</div>;

  return (
    <html>
      <body>
        <p>Redirecting to {link.targetUrl}...</p>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              setTimeout(() => {
                window.location.href = "${link.targetUrl}";
              }, 1000);
            `,
          }}
        />
      </body>
    </html>
  );
}
