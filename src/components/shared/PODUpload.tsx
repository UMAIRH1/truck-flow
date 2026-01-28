"use client";

import React, { useState, useRef } from "react";
import { Camera, X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { uploadToCloudinary, validateImageFile } from "@/lib/cloudinary";
import { toast } from "sonner";

interface PODUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function PODUpload({ images, onImagesChange, maxImages = 5, className }: PODUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const t = useTranslations("podUpload");

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    setIsUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
          toast.error(validation.error);
          return null;
        }

        // Upload to Cloudinary
        const url = await uploadToCloudinary(file);
        return url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => url !== null);
      
      if (validUrls.length > 0) {
        onImagesChange([...images, ...validUrls]);
        toast.success(`${validUrls.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.capture = "environment";
      fileInputRef.current.click();
    }
  };

  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
              <img src={image} alt={`POD ${index + 1}`} className="w-full h-full object-cover" />
              <button onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn("border-2 border-dashed rounded-xl p-6 text-center transition-colors", isDragging ? "border-yellow-400 bg-yellow-50" : "border-gray-300")}
        >
          {isUploading ? (
            <div className="py-4">
              <Loader2 className="h-8 w-8 text-yellow-400 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-gray-500">Uploading images...</p>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-4">{t("dragDropImages")}</p>

              <div className="flex gap-2 justify-center">
                <button type="button" onClick={openCamera} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 rounded-full text-sm font-medium hover:bg-yellow-500 transition-colors">
                  <Camera className="h-4 w-4" />
                  {t("camera")}
                </button>
                <button type="button" onClick={openGallery} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                  <Upload className="h-4 w-4" />
                  {t("gallery")}
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                {images.length}/{maxImages} {t("imagesUploaded")}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
