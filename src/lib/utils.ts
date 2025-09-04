import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { nanoid } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(): string {
  return nanoid(8)
}

export function getBaseUrl() {
  if (typeof window !== 'undefined') return ''
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}