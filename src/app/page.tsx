import { UploadForm } from '@/components/UploadImage'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Link Sharing Tool
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create beautiful shareable links with custom images and Open Graph metadata.
            Perfect for sharing on social media!
          </p>
        </div>
        
        <UploadForm />
      </div>
    </main>
  )
}