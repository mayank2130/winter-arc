import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { UAParser } from "ua-parser-js";
import { client } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;

    const link = await client.link.findUnique({
      where: { shortCode },
    });

    if (!link) {
      return NextResponse.redirect(new URL("/404", request.url));
    }

    // Track the click
    await trackClick(request, link.id);

    // Redirect to original URL
    return NextResponse.redirect(link.originalUrl);
  } catch (error) {
    console.error("Error processing redirect:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

async function trackClick(request: NextRequest, linkId: string) {
  try {
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";

    // Better IP detection for different environments
    const ipAddress = getClientIP(request);

    // Parse user agent for device info
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    const device =
      result.device.type ||
      (result.os.name?.toLowerCase().includes("mobile") ? "Mobile" : "Desktop");

    // Get country from IP (simplified for testing)
    const country = getCountryFromIP(ipAddress);
    const referrerInfo = analyzeReferrer(referer, request.url);

    await client.click.create({
      data: {
        linkId,
        ipAddress,
        userAgent,
        referer: referer || null,
        referrerDomain: referrerInfo.domain,
        referrerSource: referrerInfo.source,
        referrerMedium: referrerInfo.medium,
        referrerCampaign: referrerInfo.campaign,
        device,
        country,
      },
    });
  } catch (error) {
    console.error("Error tracking click:", error);
  }
}

// Improved IP detection function
function getClientIP(request: NextRequest): string {
  // Check various headers for real IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip"); // Cloudflare
  const xClientIP = request.headers.get("x-client-ip");

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwarded.split(",")[0].trim();
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  if (realIP) {
    return realIP;
  }

  if (xClientIP) {
    return xClientIP;
  }

  // Fallback to connection IP
  return request.headers.get("x-forwarded-for") || "127.0.0.1";
}

// Simplified country detection function for testing
function getCountryFromIP(ipAddress: string): string {
  // Skip geolocation for local IPs
  if (
    ipAddress === "127.0.0.1" ||
    ipAddress === "::1" ||
    ipAddress.startsWith("192.168.") ||
    ipAddress.startsWith("10.") ||
    ipAddress.startsWith("172.")
  ) {
    return "Local";
  }

  // For testing purposes, return a mock country
  // In production, you can use a free API like ipapi.co or ip-api.com
  return "Unknown";
}

// Add this function to your app/[shortCode]/route.ts
function analyzeReferrer(referer: string, currentUrl: string) {
  if (!referer) {
    return {
      domain: "Direct",
      source: "Direct",
      medium: "Direct",
      campaign: null,
    };
  }

  try {
    const refererUrl = new URL(referer);
    const currentUrlObj = new URL(currentUrl);
    const domain = refererUrl.hostname.toLowerCase();

    // Check if it's from the same domain (internal traffic)
    if (domain === currentUrlObj.hostname) {
      return {
        domain: domain,
        source: "Internal",
        medium: "Internal",
        campaign: null,
      };
    }

    // Social Media Platforms
    const socialPlatforms = {
      "twitter.com": { source: "Twitter", medium: "Social" },
      "t.co": { source: "Twitter", medium: "Social" },
      "x.com": { source: "X (Twitter)", medium: "Social" },
      "facebook.com": { source: "Facebook", medium: "Social" },
      "fb.com": { source: "Facebook", medium: "Social" },
      "linkedin.com": { source: "LinkedIn", medium: "Social" },
      "instagram.com": { source: "Instagram", medium: "Social" },
      "tiktok.com": { source: "TikTok", medium: "Social" },
      "youtube.com": { source: "YouTube", medium: "Social" },
      "youtu.be": { source: "YouTube", medium: "Social" },
      "reddit.com": { source: "Reddit", medium: "Social" },
      "discord.com": { source: "Discord", medium: "Social" },
      "whatsapp.com": { source: "WhatsApp", medium: "Social" },
      "telegram.org": { source: "Telegram", medium: "Social" },
      "snapchat.com": { source: "Snapchat", medium: "Social" },
      "pinterest.com": { source: "Pinterest", medium: "Social" },
    };

    // Search Engines
    const searchEngines = {
      "google.com": { source: "Google", medium: "Search" },
      "google.co.in": { source: "Google India", medium: "Search" },
      "bing.com": { source: "Bing", medium: "Search" },
      "yahoo.com": { source: "Yahoo", medium: "Search" },
      "duckduckgo.com": { source: "DuckDuckGo", medium: "Search" },
    };

    // Email Platforms
    const emailPlatforms = {
      "mail.google.com": { source: "Gmail", medium: "Email" },
      "outlook.com": { source: "Outlook", medium: "Email" },
      "mail.yahoo.com": { source: "Yahoo Mail", medium: "Email" },
    };

    // Check for matches
    for (const [platformDomain, info] of Object.entries({
      ...socialPlatforms,
      ...searchEngines,
      ...emailPlatforms,
    })) {
      if (domain.includes(platformDomain)) {
        return {
          domain: domain,
          source: info.source,
          medium: info.medium,
          campaign: extractCampaignInfo(refererUrl),
        };
      }
    }

    // Default for unknown referrers
    return {
      domain: domain,
      source: domain,
      medium: "Referral",
      campaign: extractCampaignInfo(refererUrl),
    };
  } catch (error) {
    return {
      domain: "Unknown",
      source: "Unknown",
      medium: "Unknown",
      campaign: null,
    };
  }
}

function extractCampaignInfo(url: URL): string | null {
  const campaignParams = [
    "utm_campaign",
    "campaign",
    "utm_source",
    "utm_medium",
    "utm_content",
    "utm_term",
  ];

  for (const param of campaignParams) {
    const value = url.searchParams.get(param);
    if (value) return value;
  }
  return null;
}
