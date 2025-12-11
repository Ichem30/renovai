"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function SafeImage({ src, alt, className = "", fallbackClassName = "" }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 ${fallbackClassName || className}`}>
        <div className="flex flex-col items-center gap-2 text-gray-600">
          <ImageOff className="h-8 w-8" />
          <span className="text-xs">Image indisponible</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`flex items-center justify-center bg-gray-900 animate-pulse ${fallbackClassName || className}`}>
          <div className="h-8 w-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </>
  );
}
