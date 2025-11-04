
'use client';

import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { BookCover } from "./book-cover";
import type { Book, BookWithListContext } from "@/lib/types";
import { Star, FileText, Globe, Building } from 'lucide-react';
import Link from "next/link";


export function BookDetailsDialog({ book, children }: { book: Book | BookWithListContext, children: React.ReactNode }) {
    
    const isBookWithContext = 'listId' in book;

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="sr-only">{book.title}</DialogTitle>
                    <DialogDescription className="sr-only">Details for the book: {book.title} by {book.author}.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-1/3 flex-shrink-0">
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
                        
                        <p className="mt-4 text-foreground/80 max-h-48 overflow-y-auto">{book.description}</p>
                        
                        {isBookWithContext && book.listId !== 'recommendation' && (
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
