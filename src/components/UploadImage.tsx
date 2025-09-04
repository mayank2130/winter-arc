"use client"

import { useState } from "react"
import { UploadButton } from "@uploadthing/react"
import { createLink } from "@/actions/upload"
import type { OurFileRouter } from "@/lib/uploadthing"

export function UploadForm() {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    if (!imageUrl) {
      alert("Please upload an image first")
      return
    }

    formData.append("imageUrl", imageUrl)
    setIsSubmitting(true)

    try {
      await createLink(formData)
      // If we reach here, it means the redirect happened successfully
      // No need to show any error or reset the form
    } catch (error: any) {
      // Check if this is a redirect error (which is expected)
      if (error?.digest?.includes('NEXT_REDIRECT')) {
        // This is expected - the redirect is happening
        return
      }
      
      console.error("Error:", error)
      alert("Failed to create link")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
        Create Shareable Link
      </h2>

      <form action={handleSubmit} className="space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full text-black rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black"
            placeholder="Enter title..."
          />
        </div>

        {/* Target URL */}
        <div className="space-y-2">
          <label
            htmlFor="targetUrl"
            className="block text-sm font-medium text-gray-700"
          >
            Target URL
          </label>
          <input
            type="url"
            id="targetUrl"
            name="targetUrl"
            required
            className="w-full rounded-lg border text-black border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black"
            placeholder="https://example.com"
          />
        </div>

        {/* Upload Image */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Upload Image
          </label>
          {imageUrl ? (
            <div className="space-y-3">
              <img
                src={imageUrl}
                alt="Uploaded"
                className="w-full h-44 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="text-sm text-gray-600 hover:text-black transition"
              >
                Remove image
              </button>
            </div>
          ) : (
            <UploadButton<OurFileRouter, "imageUploader">
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res?.[0]) {
                  setImageUrl(res[0].ufsUrl)
                }
                setIsUploading(false)
              }}
              onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`)
                setIsUploading(false)
              }}
              onUploadBegin={() => {
                setIsUploading(true)
              }}
              appearance={{
                button:
                  "w-full bg-black text-white text-sm py-2 px-4 rounded-lg hover:bg-gray-900 transition disabled:bg-gray-200",
                allowedContent: "text-xs text-gray-500 mt-2",
              }}
            />
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!imageUrl || isSubmitting || isUploading}
          className="w-full bg-black text-white text-sm py-2.5 px-4 rounded-lg hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? "Creating..." : "Create Shareable Link"}
        </button>
      </form>
    </div>
  )
}
