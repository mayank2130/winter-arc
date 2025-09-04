import { client } from "@/lib/prisma";
import { trackClick } from "@/actions/upload";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const link = await client.link.findUnique({
    where: { slug },
  });

  if (!link) {
    return {
      title: "Link not found",
      description: "The requested link could not be found.",
    };
  }

  const ogImageUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  }/api/og/${slug}`;

  return {
    title: link.title,
    description: `Check out: ${link.title}`,
    openGraph: {
      title: link.title,
      description: `Check out: ${link.title}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: link.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: link.title,
      description: `Check out: ${link.title}`,
      images: [ogImageUrl],
    },
  };
}

export default async function RedirectPage({ params }: Props) {
  const { slug } = await params;
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || undefined;
  const referer = headersList.get("referer") || undefined;

  // Track the click and get link data
  const link = await trackClick(slug, userAgent, referer);

  if (!link) {
    notFound();
  }

  // Redirect to the target URL
  redirect(link.targetUrl);
}
