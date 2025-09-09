import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/prisma";

async function getAnalytics(linkId: string) {
  const clicks = await client.click.findMany({
    where: { linkId },
  });

  const totalClicks = clicks.length;
  const uniqueVisitors = new Set(clicks.map((c) => c.ipAddress)).size;

  // Calculate daily clicks for last 30 days
  const dailyClicks = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayClicks = clicks.filter(
      (c) => c.createdAt >= dayStart && c.createdAt <= dayEnd // <-- use createdAt
    ).length;

    dailyClicks.push({
      date: dayStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      clicks: dayClicks,
    });
  }

  // Device breakdown
  const deviceCounts = clicks.reduce((acc, click) => {
    const device = click.device || "Unknown";
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const devices = Object.entries(deviceCounts).map(([name, count]) => ({
    name,
    value: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
  }));

  // Add default devices if no clicks
  if (devices.length === 0) {
    devices.push(
      { name: "Mobile", value: 0 },
      { name: "Desktop", value: 0 },
      { name: "Tablet", value: 0 }
    );
  }

  // Country breakdown
  const countryCounts = clicks.reduce((acc, click) => {
    const country = click.country || "Unknown";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      value: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      flag: getCountryFlag(name),
    }));

  // Add default countries if no clicks
  if (topCountries.length === 0) {
    topCountries.push(
      { name: "United States", value: 0, flag: "🇺🇸" },
      { name: "United Kingdom", value: 0, flag: "🇬🇧" },
      { name: "Canada", value: 0, flag: "🇨🇦" },
      { name: "Germany", value: 0, flag: "🇩🇪" },
      { name: "Australia", value: 0, flag: "🇦🇺" }
    );
  }

  // Referrer breakdown
  const referrerCounts = clicks.reduce((acc, click) => {
    const referer = click.referer || "Direct";
    const domain =
      referer === "Direct"
        ? "Direct"
        : referer.includes("google")
        ? "Google"
        : referer.includes("twitter")
        ? "Twitter"
        : referer.includes("facebook")
        ? "Facebook"
        : referer.includes("linkedin")
        ? "LinkedIn"
        : "Other";

    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const referrers = Object.entries(referrerCounts).map(([name, count]) => ({
    name,
    value: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
  }));

  // Add default referrers if no clicks
  if (referrers.length === 0) {
    referrers.push(
      { name: "Direct", value: 0 },
      { name: "Google", value: 0 },
      { name: "Twitter", value: 0 },
      { name: "Facebook", value: 0 },
      { name: "LinkedIn", value: 0 }
    );
  }

  return {
    clicks: totalClicks,
    uniqueVisitors,
    conversionRate:
      totalClicks > 0
        ? ((uniqueVisitors / totalClicks) * 100).toFixed(1)
        : "0.0",
    dailyClicks,
    devices,
    topCountries,
    referrers,
  };
}

function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    "United States": "🇺🇸",
    "United Kingdom": "🇬🇧",
    Canada: "🇨🇦",
    Germany: "🇩🇪",
    Australia: "🇦🇺",
    India: "🇮🇳",
    France: "🇫🇷",
    Japan: "🇯🇵",
    Brazil: "🇧🇷",
    Italy: "🇮🇹",
    Spain: "🇪🇸",
    Netherlands: "🇳🇱",
    Unknown: "🌍",
  };
  return flags[country] || "🌍";
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const linkId = params.id;

    const link = await client.link.findUnique({
      where: { id: linkId },
      include: {
        clicks: true,
        subscription: true, // include the link's subscription relation (if any)
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const analytics = await getAnalytics(linkId);

    return NextResponse.json({
      id: link.id,
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
      title: link.title || "Untitled Link",
      description: link.description || "",
      created: link.createdAt.toISOString(),
      userId: link.userId,
      subscriptionId: link.subscriptionId ?? link.subscription?.id ?? null,
      analytics,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}