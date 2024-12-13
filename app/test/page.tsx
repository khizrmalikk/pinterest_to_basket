'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function TestPage() {
  const [boardUrl, setBoardUrl] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTest = async () => {
    if (!boardUrl) {
      setError("Please enter a Pinterest board URL")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/py/pinterest-images?board_url=${encodeURIComponent(boardUrl)}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        console.error("Pinterest scraping error:", data.error)
        return
      }

      setImages(data.image_urls || [])
      
      if (!data.image_urls || data.image_urls.length === 0) {
        setError("No images found in this board")
      }
    } catch (error) {
      setError("Failed to fetch images")
      console.error("Request error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Pinterest Board Test</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-sm mb-8">
        <Input
          type="text"
          placeholder="Enter Pinterest board URL..."
          value={boardUrl}
          onChange={(e) => setBoardUrl(e.target.value)}
        />
        <Button 
          onClick={handleTest}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Test Board"}
        </Button>
      </div>

      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={url}
                alt={`Pinterest image ${index + 1}`}
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
    </main>
  )
} 