'use client';

import { Card, CardContent } from "@/components/ui/card";
import { BookCover } from "@/components/app/book-cover";
import Link from "next/link";
import type { BookWithListContext } from "@/lib/types";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Star, FileText, Globe, Building } from 'lucide-react';

function BookDetailsDialog({ book, children }: { book: BookWithListContext, children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-3xl">
                <div className="flex gap-6">
                    <div className="w-1/3 flex-shrink-0">
                         <BookCover 
                            src={book.imageUrl} 
                            alt={`Cover of ${book.title}`} 
                            className="w-full rounded-lg shadow-lg"
                        />
                    </div>
                    <div className="flex-grow">
                        <h2 className="text-2xl font-bold font-headline">{book.title}</h2>
                        <p className="text-lg text-muted-foreground">by {book.author}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4 flex-wrap">
                            {book.averageRating && book.averageRating > 0 && <div className="flex items-center gap-1.5"><Star className="size-4 text-amber-400" /> {book.averageRating.toFixed(1)} / 5</div>}
                            {book.pageCount && book.pageCount > 0 && <div className="flex items-center gap-1.5"><FileText className="size-4" /> {book.pageCount} pages</div>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
                             {book.publisher && <div className="flex items-center gap-1.5"><Building className="size-4" /> {book.publisher}</div>}
                            {book.language && <div className="flex items-center gap-1.5"><Globe className="size-4" /> {book.language.toUpperCase()}</div>}
                        </div>
                        
                        <p className="mt-4 text-foreground/80">{book.description}</p>
                        
                        {book.listId !== 'recommendation' && (
                            <Button asChild className="mt-4">
                                <Link href={`/book-lists/${book.listId}`}>View List: {book.listName}</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}


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
