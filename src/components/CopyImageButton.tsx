"use client"

import { useState } from 'react'
import { Image as ImageIcon, Check } from 'lucide-react'

interface CopyImageButtonProps {
  ogImageUrl: string
}

export function CopyImageButton({ ogImageUrl }: CopyImageButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyImage = async () => {
    try {
      const res = await fetch(ogImageUrl, { cache: 'no-store' })
      const blob = await res.blob()
      // Modern clipboard image copy
      if ('ClipboardItem' in window && navigator.clipboard && (navigator.clipboard as any).write) {
        const item = new (window as any).ClipboardItem({ [blob.type]: blob })
        await (navigator.clipboard as any).write([item])
      } else {
        // Fallback: open the image in a new tab (user can drag/drop)
        window.open(ogImageUrl, '_blank')
        return
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy image:', err)
      window.open(ogImageUrl, '_blank')
    }
  }

  return (
    <button
      onClick={handleCopyImage}
      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
      title={copied ? 'Image copied!' : 'Copy image to clipboard'}
      type="button"
    >
      {copied ? <Check className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
    </button>
  )
}
