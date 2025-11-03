'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BookImage } from 'lucide-react';

interface BookCoverProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export function BookCover({ src, alt, width, height, className }: BookCoverProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded"
        style={{ width, height }}
      >
        <BookImage className="size-1/2 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Image 
      src={src} 
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
      onError={() => setError(true)}
    />
  );
}
