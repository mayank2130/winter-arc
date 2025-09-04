"use client"

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  shareUrl: string
}

export function CopyButton({ shareUrl }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      // Try to copy rich content first (works better when deployed)
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          const clipboardItem = new ClipboardItem({
            'text/plain': new Blob([shareUrl], { type: 'text/plain' }),
            'text/html': new Blob([`<a href="${shareUrl}">${shareUrl}</a>`], { type: 'text/html' })
          })
          await navigator.clipboard.write([clipboardItem])
        } catch (e) {
          // Fallback to simple text copy
          await navigator.clipboard.writeText(shareUrl)
        }
      } else {
        // Fallback for older browsers
        await navigator.clipboard.writeText(shareUrl)
      }
      
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      // Fallback: try to copy using a temporary textarea
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}
