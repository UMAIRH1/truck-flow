'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useState } from 'react';
import { cn, getImageUrl } from '@/lib/utils';
import { CircleUserRound } from 'lucide-react';

const DEFAULT_IMAGE_WIDTH = 300;
const DEFAULT_IMAGE_HEIGHT = 200;

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  fill = false,
  sizes,
  quality = 75,
  loading = 'lazy',
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.png',
}: OptimizedImageProps) {
  // Process the image URL to handle API-hosted images
  const processedSrc = getImageUrl(src);
  const [imageSrc, setImageSrc] = useState<string>(processedSrc && processedSrc.trim() !== '' ? processedSrc : fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Update image source when src prop changes
  useEffect(() => {
    const newProcessedSrc = getImageUrl(src);
    if (newProcessedSrc && newProcessedSrc.trim() !== '') {
      setImageSrc(newProcessedSrc);
      setHasError(false);
      setIsLoading(true);
    } else {
      setImageSrc(fallbackSrc);
    }
  }, [src, fallbackSrc]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);

    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(false);
    } else {
      onError?.();
    }
  };

  if (hasError && imageSrc === fallbackSrc) {
    return (
      <div
        className={cn('flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg', className, width && height ? 'overflow-hidden' : '')}
        style={width && height ? { width, height } : undefined}
      >
        <div className="text-center p-2">
          <CircleUserRound className="h-8 w-8 text-gray-400 mx-auto mb-1" />
        </div>
      </div>
    );
  }

  // Check if the image is an SVG to use unoptimized mode
  const isSvg = imageSrc.toLowerCase().endsWith('.svg') || imageSrc.includes('image/svg');

  const imageProps: React.ComponentProps<typeof Image> = {
    src: imageSrc,
    alt,
    priority,
    placeholder,
    blurDataURL,
    quality,
    unoptimized: isSvg,
    ...(priority ? {} : { loading }),
    className: cn('transition-all duration-300', isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100', className),
    onLoad: handleLoad,
    onError: handleError,
    ...(fill
      ? { fill: true, sizes }
      : {
          width: typeof width === 'string' ? parseInt(width, 10) || DEFAULT_IMAGE_WIDTH : width || DEFAULT_IMAGE_WIDTH,
          height: typeof height === 'string' ? parseInt(height, 10) || DEFAULT_IMAGE_HEIGHT : height || DEFAULT_IMAGE_HEIGHT,
        }),
  };

  return (
    <div className={cn('relative overflow-hidden', fill && 'relative')} style={!fill && width && height ? { width, height } : undefined}>
      {isLoading && !fill && <div className="absolute inset-0 bg-gray-200 animate-pulse" style={{ width, height }} />}
      <Image {...imageProps} alt={alt} />
    </div>
  );
}
