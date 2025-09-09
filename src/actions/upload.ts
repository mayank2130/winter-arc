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

  const shortCode = generateSlug()

  try {
    const link = await client.link.create({
      data: {
        shortCode,
        title,
        originalUrl:  targetUrl,
      },
    })
    revalidatePath('/')
  } catch (error: any) {
    if (error?.digest?.includes('NEXT_REDIRECT')) {
      throw error
    }
    
    console.error('Error creating link:', error)
    throw new Error('Failed to create link')
  }
}

export async function trackClick(slug: string, userAgent?: string, referer?: string) {
  try {
    const link = await client.link.findUnique({
      where: { shortCode: slug }
    })

    if (!link) return null

    // Track the click
    await client.click.create({
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
