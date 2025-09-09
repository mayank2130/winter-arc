"use server";

import { client } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

// Types
export interface LinkAnalytics {
  clicks: number;
  uniqueVisitors: number;
  conversionRate: string;
  dailyClicks: Array<{
    date: string;
    clicks: number;
  }>;
  devices: Array<{
    name: string;
    value: number;
  }>;
  topCountries: Array<{
    name: string;
    value: number;
    flag: string;
  }>;
  referrers: Array<{
    name: string;
    value: number;
  }>;
}

export interface LinkData {
  id: string;
  shortCode: string;
  originalUrl: string;
  title: string;
  description: string;
  created: string;
  userId: string;
  subscriptionId: string | null;
  analytics: LinkAnalytics;
}

export interface CreateLinkInput {
  url: string;
  title?: string;
  description?: string;
}

export interface CreateLinkResult {
  success: boolean;
  data?: LinkData;
  error?: string;
}

export interface GetLinksResult {
  success: boolean;
  data?: LinkData[];
  error?: string;
}

export interface GetLinkResult {
  success: boolean;
  data?: LinkData;
  error?: string;
}

export interface DeleteLinkResult {
  success: boolean;
  error?: string;
}

// Helper function to get analytics (extracted from API route)
async function getAnalytics(linkId: string): Promise<LinkAnalytics> {
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
  }));

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

// Server Actions

/**
 * Get all links for the current user
 * @returns Promise<GetLinksResult> - Array of user's links with analytics
 */
export async function getAllLinks(): Promise<GetLinksResult> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const links = await client.link.findMany({
      where: { userId: dbUser.id },
      include: {
        clicks: true,
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

    return { success: true, data: transformedLinks };
  } catch (error) {
    console.error("Error fetching links:", error);
    return { success: false, error: "Failed to fetch links" };
  }
}

/**
 * Create a new trackable link
 * @param input - CreateLinkInput containing url, title, and description
 * @returns Promise<CreateLinkResult> - Created link with analytics
 */
export async function createLink(input: CreateLinkInput): Promise<CreateLinkResult> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    if (!input.url) {
      return { success: false, error: "URL is required" };
    }

    // Generate unique short code
    let shortCode;
    let isUnique = false;
    while (!isUnique) {
      shortCode = nanoid(6);
      const existing = await client.link.findUnique({
        where: { shortCode },
      });
      if (!existing) isUnique = true;
    }

    // Get user subscription (optional - for testing, this can be null)
    let userSubscription = null;
    try {
      userSubscription = await client.subscription.findUnique({
        where: { userId: dbUser.id },
      });
    } catch (error) {
      console.log("No subscription found for user, creating link without subscription");
    }

    // Create the link (subscriptionId can be null for testing)
    const link = await client.link.create({
      data: {
        shortCode: shortCode!,
        originalUrl: input.url,
        title: input.title || null,
        description: input.description || null,
        userId: dbUser.id,
        subscriptionId: userSubscription?.id || null, // This will be null if no subscription
      },
    });

    // Get analytics for the new link
    const analytics = await getAnalytics(link.id);

    const linkData: LinkData = {
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

    revalidatePath("/dashboard");
    return { success: true, data: linkData };
  } catch (error) {
    console.error("Error creating link:", error);
    return { success: false, error: "Failed to create link" };
  }
}

/**
 * Get a specific link by ID
 * @param linkId - The ID of the link to fetch
 * @returns Promise<GetLinkResult> - Link data with analytics
 */
export async function getLinkById(linkId: string): Promise<GetLinkResult> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const link = await client.link.findFirst({
      where: { 
        id: linkId,
        userId: dbUser.id 
      },
      include: {
        clicks: true,
        subscription: true,
      },
    });

    if (!link) {
      return { success: false, error: "Link not found" };
    }

    const analytics = await getAnalytics(link.id);

    const linkData: LinkData = {
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

    return { success: true, data: linkData };
  } catch (error) {
    console.error("Error fetching link:", error);
    return { success: false, error: "Failed to fetch link" };
  }
}

/**
 * Delete a link by ID
 * @param linkId - The ID of the link to delete
 * @returns Promise<DeleteLinkResult> - Success status
 */
export async function deleteLink(linkId: string): Promise<DeleteLinkResult> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    // Verify link belongs to user
    const link = await client.link.findFirst({
      where: { 
        id: linkId,
        userId: dbUser.id 
      },
    });

    if (!link) {
      return { success: false, error: "Link not found" };
    }

    // Delete all clicks first (due to foreign key constraints)
    await client.click.deleteMany({
      where: { linkId },
    });

    // Delete the link
    await client.link.delete({
      where: { id: linkId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting link:", error);
    return { success: false, error: "Failed to delete link" };
  }
}
