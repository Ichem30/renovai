"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone"; // Need to install this
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onImageSelected: (file: File) => void;
}

export function UploadZone({ onImageSelected }: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onImageSelected(file);
    }
  }, [onImageSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  });

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            {...(getRootProps() as any)}
            className={`
              relative cursor-pointer rounded-xl border-2 border-dashed p-12 transition-colors
              ${isDragActive ? "border-purple-500 bg-purple-500/10" : "border-gray-700 hover:border-gray-500 hover:bg-gray-800/50"}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-gray-800 p-4">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                Glissez votre photo ici
              </h3>
              <p className="text-sm text-gray-400">
                ou cliquez pour parcourir (JPG, PNG, WEBP)
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-xl border border-gray-700 bg-gray-900"
          >
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
              style={{ maxHeight: "400px" }}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
