import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { client } from "@/lib/prisma";

async function getAnalytics(linkId: string) {
  const clicks = await client.click.findMany({
    where: { linkId },
  });

  const totalClicks = clicks.length;
  const uniqueVisitors = new Set(clicks.map((c) => c.ipAddress)).size;

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const dailyClicks = [];

  let startDate;
  if (clicks.length > 0) {
    const earliestClick = new Date(
      Math.min(...clicks.map((c) => c.createdAt.getTime()))
    );
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    startDate = new Date(
      Math.max(earliestClick.getTime(), fifteenDaysAgo.getTime())
    );
  } else {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 15);
  }

  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  while (currentDate <= todayStart) {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const dayClicks = clicks.filter(
      (c) => c.createdAt >= dayStart && c.createdAt <= dayEnd
    ).length;

    let dateLabel;
    const daysDiff = Math.floor(
      (todayStart.getTime() - dayStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      dateLabel = "Today";
    } else if (daysDiff === 1) {
      dateLabel = "Yesterday";
    } else if (daysDiff <= 7) {
      dateLabel = dayStart.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      dateLabel = dayStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    dailyClicks.push({
      date: dateLabel,
      clicks: dayClicks,
    });

    currentDate.setDate(currentDate.getDate() + 1);
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
    count: count,
  }));

  if (devices.length === 0) {
    devices.push(
      { name: "Mobile", value: 0, count: 0 },
      { name: "Desktop", value: 0, count: 0 },
      { name: "Tablet", value: 0, count: 0 }
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
      count: count,
    }));

  if (topCountries.length === 0) {
    topCountries.push(
      { name: "United States", value: 0, flag: "🇺🇸", count: 0 },
      { name: "United Kingdom", value: 0, flag: "🇬🇧", count: 0 },
      { name: "Canada", value: 0, flag: "🇨🇦", count: 0 },
      { name: "Germany", value: 0, flag: "🇩🇪", count: 0 },
      { name: "Australia", value: 0, flag: "🇦🇺", count: 0 }
    );
  }

  // ENHANCED REFERRER TRACKING

  // Referrer breakdown by SOURCE (Twitter, Facebook, Google, etc.)
  const referrerSourceCounts = clicks.reduce((acc, click) => {
    const source = click.referrerSource || getSourceFromReferer(click.referer) || 'Direct';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const referrerSources = Object.entries(referrerSourceCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({
      name,
      value: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      count: count,
    }));

  // Referrer breakdown by MEDIUM (Social, Search, Email, etc.)
  const referrerMediumCounts = clicks.reduce((acc, click) => {
    const medium = click.referrerMedium || getMediumFromReferer(click.referer) || 'Direct';
    acc[medium] = (acc[medium] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const referrerMediums = Object.entries(referrerMediumCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({
      name,
      value: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      count: count,
    }));

  // Top referring domains
  const domainCounts = clicks.reduce((acc, click) => {
    const domain = click.referrerDomain || getDomainFromReferer(click.referer) || 'Direct';
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDomains = Object.entries(domainCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({
      name,
      value: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      count: count,
    }));

  // Campaign tracking
  const campaignCounts = clicks
    .filter(click => click.referrerCampaign)
    .reduce((acc, click) => {
      const campaign = click.referrerCampaign!;
      acc[campaign] = (acc[campaign] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const campaigns = Object.entries(campaignCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({
      name,
      value: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      count: count,
    }));

  // Legacy referrers for backward compatibility
  const legacyReferrers = referrerSources.length > 0 ? referrerSources : [
    { name: "Direct", value: 0, count: 0 },
    { name: "Google", value: 0, count: 0 },
    { name: "Twitter", value: 0, count: 0 },
    { name: "Facebook", value: 0, count: 0 },
    { name: "LinkedIn", value: 0, count: 0 }
  ];

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
    referrers: legacyReferrers, // Keep for backward compatibility
    referrerSources,    // NEW: Twitter, Facebook, Google, etc.
    referrerMediums,    // NEW: Social, Search, Email, etc.
    topDomains,         // NEW: twitter.com, facebook.com, etc.
    campaigns,          // NEW: UTM campaign tracking
  };
}

// Helper functions for backward compatibility with existing data
function getSourceFromReferer(referer: string | null): string {
  if (!referer) return 'Direct';

  try {
    const domain = new URL(referer).hostname.toLowerCase();
    
    if (domain.includes('twitter.com') || domain.includes('t.co')) return 'Twitter';
    if (domain.includes('x.com')) return 'X (Twitter)';
    if (domain.includes('facebook.com') || domain.includes('fb.com')) return 'Facebook';
    if (domain.includes('linkedin.com')) return 'LinkedIn';
    if (domain.includes('instagram.com')) return 'Instagram';
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'YouTube';
    if (domain.includes('tiktok.com')) return 'TikTok';
    if (domain.includes('reddit.com')) return 'Reddit';
    if (domain.includes('discord.com')) return 'Discord';
    if (domain.includes('whatsapp.com')) return 'WhatsApp';
    if (domain.includes('telegram.org')) return 'Telegram';
    if (domain.includes('snapchat.com')) return 'Snapchat';
    if (domain.includes('pinterest.com')) return 'Pinterest';
    if (domain.includes('google.com')) return 'Google';
    if (domain.includes('bing.com')) return 'Bing';
    if (domain.includes('yahoo.com')) return 'Yahoo';
    if (domain.includes('duckduckgo.com')) return 'DuckDuckGo';
    if (domain.includes('mail.google.com')) return 'Gmail';
    if (domain.includes('outlook.com')) return 'Outlook';
    if (domain.includes('slack.com')) return 'Slack';
    
    return domain;
  } catch {
    return 'Unknown';
  }
}

function getMediumFromReferer(referer: string | null): string {
  if (!referer) return 'Direct';

  try {
    const domain = new URL(referer).hostname.toLowerCase();
    
    // Social Media
    if (domain.includes('twitter.com') || domain.includes('t.co') || 
        domain.includes('x.com') || domain.includes('facebook.com') || 
        domain.includes('linkedin.com') || domain.includes('instagram.com') ||
        domain.includes('tiktok.com') || domain.includes('youtube.com') ||
        domain.includes('reddit.com') || domain.includes('discord.com') ||
        domain.includes('whatsapp.com') || domain.includes('telegram.org') ||
        domain.includes('snapchat.com') || domain.includes('pinterest.com')) {
      return 'Social';
    }
    
    // Search Engines
    if (domain.includes('google.com') || domain.includes('bing.com') || 
        domain.includes('yahoo.com') || domain.includes('duckduckgo.com')) {
      return 'Search';
    }
    
    // Email
    if (domain.includes('mail.google.com') || domain.includes('outlook.com') ||
        domain.includes('mail.yahoo.com')) {
      return 'Email';
    }
    
    // Messaging
    if (domain.includes('slack.com') || domain.includes('teams.microsoft.com')) {
      return 'Messaging';
    }
    
    return 'Referral';
  } catch {
    return 'Unknown';
  }
}

function getDomainFromReferer(referer: string | null): string {
  if (!referer) return 'Direct';
  
  try {
    return new URL(referer).hostname.toLowerCase();
  } catch {
    return 'Unknown';
  }
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

// GET - Fetch all links
export async function GET() {
  try {
    const links = await client.link.findMany({
      include: {
        clicks: true,
        user: true,
        subscription: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedLinks = await Promise.all(
      links.map(async (link) => {
        const analytics = await getAnalytics(link.id);
        return {
          id: link.id,
          shortCode: link.shortCode,
          originalUrl: link.originalUrl,
          title: link.title || "Untitled Link",
          description: link.description || "",
          created: link.createdAt.toISOString(),
          userId: link.userId,
          subscriptionId: link.subscriptionId,
          analytics,
        };
      })
    );

    return NextResponse.json(transformedLinks);
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

// POST - Create new link
export async function POST(request: NextRequest) {
  try {
    const { url, title, description, userId, subscriptionId } =
      await request.json();

    if (!url || !userId) {
      console.log("URL and userId are required");
      return NextResponse.json(
        { error: "URL and userId are required" },
        { status: 400 }
      );
    }

    let shortCode;
    let isUnique = false;
    while (!isUnique) {
      shortCode = nanoid(6);
      const existing = await client.link.findUnique({
        where: { shortCode },
      });
      if (!existing) isUnique = true;
    }

    const userSubscription = await client.subscription.findUnique({
      where: { userId },
    });

    const link = await client.link.create({
      data: {
        shortCode: shortCode!,
        originalUrl: url,
        title: title || null,
        description: description || null,
        userId,
        subscriptionId: userSubscription?.id || null,
      },
    });

    const analytics = await getAnalytics(link.id);

    return NextResponse.json({
      id: link.id,
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
      title: link.title || "Untitled Link",
      description: link.description || "",
      created: link.createdAt.toISOString(),
      userId: link.userId,
      subscriptionId: link.subscriptionId,
      analytics,
    });
  } catch (error) {
    console.error("Error creating link:", error);
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}