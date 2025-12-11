"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface GeneratedImage {
  id: string
  label: string
  url: string
}

interface ImageGalleryProps {
  currentImage: string
  images: GeneratedImage[]
  onSelectImage: (url: string) => void
}

export function ImageGallery({ currentImage, images, onSelectImage }: ImageGalleryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/10 to-gray-950 p-6">
      {/* Main Image Display */}
      <div className="flex-1 flex items-center justify-center mb-6">
        <div className="relative w-full h-full max-w-5xl max-h-[calc(100vh-280px)] group">
          {/* Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-950/40 backdrop-blur-xl px-4 py-2 shadow-xl shadow-purple-500/20">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-200">Version Générée par IA</span>
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50 transition-all duration-500 group-hover:border-purple-500/30 group-hover:shadow-purple-500/20">
            <Image
              src={currentImage || "/placeholder.svg"}
              alt="Generated interior design"
              fill
              className="object-contain"
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent justify-center">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => onSelectImage(image.url)}
            onMouseEnter={() => setHoveredId(image.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              "group relative flex-shrink-0 w-32 h-32 rounded-xl border-2 overflow-hidden transition-all duration-300",
              currentImage === image.url
                ? "border-purple-500 shadow-xl shadow-purple-500/30 scale-105"
                : "border-white/10 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105",
            )}
          >
            {/* Thumbnail Image */}
            <div className="relative w-full h-full bg-gray-900">
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.label}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300",
                  currentImage === image.url ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                )}
              />
            </div>

            {/* Label */}
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 p-2 text-center text-xs font-medium transition-all duration-300",
                currentImage === image.url
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
                  : "bg-black/60 backdrop-blur-sm text-gray-300",
              )}
            >
              {image.label}
            </div>

            {/* Active Indicator */}
            {currentImage === image.url && (
              <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
