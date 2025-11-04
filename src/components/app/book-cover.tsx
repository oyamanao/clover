
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

  // If width and height are provided, use them. Otherwise, let aspect ratio control it.
  const style = width && height ? { width, height } : {};

  if (error || !src) {
    return (
      <div 
        className={cn(
            "flex items-center justify-center bg-transparent",
            aspectRatio === 'portrait' ? 'aspect-[2/3]' : 'aspect-square',
            className
        )}
        style={style}
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
        style={style}
    >
        <Image 
          src={src} 
          alt={alt}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className={cn(
              "object-cover transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
          )}
          onError={() => setError(true)}
          onLoad={() => setIsLoaded(true)}
        />
    </div>
  );
}
