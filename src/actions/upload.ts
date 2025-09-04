'use server'

import { client } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createLink(formData: FormData) {
  const title = formData.get('title') as string
  const targetUrl = formData.get('targetUrl') as string
  const imageUrl = formData.get('imageUrl') as string

  if (!title || !targetUrl || !imageUrl) {
    throw new Error('All fields are required')
  }

  const slug = generateSlug()

  try {
    const link = await client.link.create({
      data: {
        slug,
        title,
        targetUrl,
        imageUrl,
      },
    })

    revalidatePath('/')
    redirect(`/success/${slug}`)
  } catch (error: any) {
    // Check if this is a redirect error (which is expected)
    if (error?.digest?.includes('NEXT_REDIRECT')) {
      throw error // Re-throw redirect errors
    }
    
    console.error('Error creating link:', error)
    throw new Error('Failed to create link')
  }
}

export async function trackClick(slug: string, userAgent?: string, referer?: string) {
  try {
    const link = await client.link.findUnique({
      where: { slug }
    })

    if (!link) return null

    // Track the click
    await client.analytics.create({
      data: {
        linkId: link.id,
        userAgent,
        referer,
      }
    })

    return link
  } catch (error) {
    console.error('Error tracking click:', error)
    return null
  }
}
