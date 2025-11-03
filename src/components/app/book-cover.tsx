'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BookImage } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookCoverProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  aspectRatio?: 'portrait' | 'square';
}

export function BookCover({ src, alt, width, height, className, aspectRatio = 'portrait' }: BookCoverProps) {
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const finalWidth = width || 300;
  const finalHeight = height || (aspectRatio === 'portrait' ? 450 : 300);

  if (error || !src) {
    return (
      <div 
        className={cn(
            "flex items-center justify-center bg-muted",
            aspectRatio === 'portrait' ? 'aspect-[2/3]' : 'aspect-square',
            className
        )}
        style={width && height ? { width, height } : {}}
      >
        <BookImage className="size-1/2 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div 
        className={cn(
            "relative bg-muted",
            aspectRatio === 'portrait' ? 'aspect-[2/3]' : 'aspect-square',
            className
        )}
        style={width && height ? { width, height } : {}}
    >
        <Image 
          src={src} 
          alt={alt}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
          className={cn(
              "object-cover transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
          )}
          unoptimized
          onError={() => setError(true)}
          onLoad={() => setIsLoaded(true)}
        />
    </div>
  );
}
