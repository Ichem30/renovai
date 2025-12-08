"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GripVertical } from "lucide-react";

interface BeforeAfterProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
}

export function BeforeAfterSlider({ beforeImage, afterImage, className = "" }: BeforeAfterProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  }, []);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none cursor-col-resize ${className}`}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* Before Image (Background) */}
      <img
        src={beforeImage}
        alt="Avant"
        className="absolute top-0 left-0 h-full w-full object-cover"
      />

      {/* After Image (Foreground - Clipped) */}
      <div
        className="absolute top-0 left-0 h-full w-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={afterImage}
          alt="Après"
          className="absolute top-0 left-0 h-full w-full max-w-none object-cover"
          style={{ width: "100%", height: "100%" }} 
        />
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white/20 backdrop-blur-md shadow-lg">
          <GripVertical className="h-6 w-6 text-white" />
        </div>
      </div>
      
      {/* Labels */}
      <div 
        className="absolute top-4 left-4 rounded-md bg-black/50 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: sliderPosition > 10 ? 1 : 0 }}
      >
        AVANT
      </div>
      <div 
        className="absolute top-4 right-4 rounded-md bg-black/50 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: sliderPosition < 90 ? 1 : 0 }}
      >
        APRÈS
      </div>
    </div>
  );
}
