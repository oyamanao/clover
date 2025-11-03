
'use client';

import { Book, Quote } from 'lucide-react';

const items = Array.from({ length: 30 }); // Generate 30 floating items

const randomContent = () => {
    const isBook = Math.random() > 0.5;
    if (isBook) {
        return <Book className="size-full" />;
    }
    return <Quote className="size-full" />;
}

export function AnimatedWelcomeBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {items.map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 20 + 15}s`, // 15-35 seconds
          animationDelay: `${Math.random() * 10}s`, // 0-10 seconds delay
          width: `${Math.random() * 40 + 20}px`, // 20-60px size
          height: `${Math.random() * 40 + 20}px`,
        };
        return (
          <div
            key={i}
            className="float-up-animation absolute bottom-0 text-accent/20"
            style={style}
          >
            {randomContent()}
          </div>
        );
      })}
    </div>
  );
}
