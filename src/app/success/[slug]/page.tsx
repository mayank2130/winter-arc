import { client } from '@/lib/prisma'
import { getBaseUrl } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { CopyButton } from '@/components/CopyButton'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function SuccessPage({ params }: Props) {
  const { slug } = await params
  
  const link = await client.link.findUnique({
    where: { slug }
  })

  if (!link) {
    notFound()
  }

  const shareUrl = `${getBaseUrl()}/u/${link.slug}`

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Link Created Successfully!
            </h1>
            <p className="text-gray-600">
              Your shareable link is ready. Copy it and share anywhere!
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <img
              src={link.imageUrl}
              alt={link.title}
              className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {link.title}
            </h2>
            <p className="text-sm text-gray-600 break-all">
              Target: {link.targetUrl}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shareable Link:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <CopyButton shareUrl={shareUrl} />
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>✨ This link includes Open Graph metadata for rich social media previews</p>
              <p>📊 Click analytics are automatically tracked</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href="/"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Create Another Link
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}