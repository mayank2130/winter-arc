import { client } from "@/lib/prisma";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const link = await client.link.findUnique({ where: { slug } });

  if (!link) return {};

  return {
    title: link.title,
    description: "Shared via MyLink",
    openGraph: {
      title: link.title,
      images: [`${process.env.NEXT_PUBLIC_URL}/api/og/${slug}`],
      url: `${process.env.NEXT_PUBLIC_URL}/u/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: link.title,
      images: [`${process.env.NEXT_PUBLIC_URL}/api/og/${slug}`],
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
