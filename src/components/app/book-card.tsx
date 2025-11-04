
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { BookCover } from "@/components/app/book-cover";
import Link from "next/link";
import type { BookWithListContext } from "@/lib/types";
import { BookDetailsDialog } from "./book-details-dialog";


export function BookCard({ book }: { book: BookWithListContext }) {

  const cardContent = (
    <Card className="overflow-hidden h-full transition-all group-hover:shadow-lg group-hover:border-accent/50">
        <CardContent className="p-0">
          <BookCover 
            src={book.imageUrl} 
            alt={`Cover of ${book.title}`} 
            className="w-full object-cover"
            aspectRatio="square"
          />
          <div className="p-4">
             <h3 className="font-semibold font-headline line-clamp-2 h-12 group-hover:text-accent">{book.title}</h3>
            <p className="text-sm text-muted-foreground truncate">by {book.author}</p>
          </div>
        </CardContent>
      </Card>
  );

  // If it's a recommendation, open a dialog. Otherwise, link to the list.
  if (book.listId === 'recommendation') {
    return (
        <BookDetailsDialog book={book}>
            <div className="block group cursor-pointer">{cardContent}</div>
        </BookDetailsDialog>
    );
  }

  return (
    <Link href={`/book-lists/${book.listId}`} className="block group">
      {cardContent}
    </Link>
  );
}
