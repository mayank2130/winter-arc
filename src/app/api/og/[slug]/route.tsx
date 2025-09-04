import { ImageResponse } from '@vercel/og'
import { client } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const link = await client.link.findUnique({
      where: { slug }
    })

    if (!link) {
      return new Response('Not found', { status: 404 })
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
          }}
        >
          <img
            src={link.imageUrl}
            alt={link.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error('OG Image generation error:', e)
    return new Response('Failed to generate image', { status: 500 })
  }
}