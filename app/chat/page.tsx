"use client"

import { useState } from "react"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ImageGallery } from "@/components/chat/image-gallery"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Share2, Download, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function ChatPage() {
  const [currentImage, setCurrentImage] = useState<string>("/modern-japandi-kitchen-interior.jpg")
  const [generatedImages, setGeneratedImages] = useState([
    { id: "original", label: "Original", url: "/original-kitchen-before-renovation.jpg" },
    { id: "v1", label: "Version 1", url: "/japandi-kitchen-after-renovation-wood-minimalist.jpg" },
  ])

  const handleGenerateImage = (prompt: string) => {
    // Simulate image generation
    const newImage = {
      id: `v${generatedImages.length}`,
      label: `Version ${generatedImages.length}`,
      url: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(prompt)}`,
    }
    setGeneratedImages((prev) => [...prev, newImage])
    setCurrentImage(newImage.url)
  }

  return (
    <div className="h-screen bg-black overflow-hidden flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <h1 className="text-lg font-semibold text-white">kitchen - japandi</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
            >
              <ShoppingBag className="h-4 w-4" />
              Shopping List
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Image Gallery */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ImageGallery currentImage={currentImage} images={generatedImages} onSelectImage={setCurrentImage} />
        </div>

        {/* Right: Chat Sidebar */}
        <div className="w-[420px] border-l border-white/10 flex-shrink-0">
          <ChatInterface
            projectId="demo-project"
            initialAnalysis={{ roomType: "kitchen" }}
            onGenerateImage={handleGenerateImage}
          />
        </div>
      </div>
    </div>
  )
}
