'use client';

import { Card, CardContent } from "@/components/ui/card";
import { BookCover } from "@/components/app/book-cover";
import Link from "next/link";
import type { BookWithListContext } from "@/lib/types";

export function BookCard({ book }: { book: BookWithListContext }) {
  return (
    <Link href={`/book-lists/${book.listId}`} className="block group">
      <Card className="overflow-hidden h-full transition-all group-hover:shadow-lg group-hover:border-accent/50">
        <CardContent className="p-0">
          <BookCover 
            src={book.imageUrl} 
            alt={`Cover of ${book.title}`} 
            width={300}
            height={450}
            className="w-full object-cover aspect-[2/3]"
          />
          <div className="p-4">
             <h3 className="font-semibold font-headline truncate group-hover:text-accent">{book.title}</h3>
            <p className="text-sm text-muted-foreground truncate">by {book.author}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
