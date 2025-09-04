import { client } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

type Props = { params: Promise<{ slug: string }> };

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const link = await client.link.findUnique({ where: { slug } });

  if (!link) return {};

  const base = getBaseUrl();
  const ogImage = `${base}/api/og/${slug}`;
  const pageUrl = `${base}/u/${slug}`;

  return {
    title: link.title,
    description: "Shared via MyLink",
    openGraph: {
      title: link.title,
      description: "Shared via MyLink",
      url: pageUrl,
      images: [ogImage],
      type: "website",
      siteName: "MyLink",
    },
    twitter: {
      card: "summary_large_image",
      title: link.title,
      description: "Shared via MyLink",
      images: [ogImage],
    },
    metadataBase: new URL(base),
  };
}

export default async function LinkPreview({ params }: Props) {
  const { slug } = await params;
  const link = await client.link.findUnique({ where: { slug } });

  if (!link) return <div>Link not found</div>;

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center p-6">
        <p>Redirecting to {link.targetUrl}...</p>
        <noscript>
          <a href={link.targetUrl}>Click here if you are not redirected.</a>
        </noscript>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              setTimeout(() => {
                window.location.href = ${JSON.stringify(link.targetUrl)};
              }, 1000);
            `,
          }}
        />
      </div>
    </main>
  );
}
