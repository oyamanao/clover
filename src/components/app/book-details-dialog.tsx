
'use client';

import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { BookCover } from "./book-cover";
import type { Book, BookWithListContext, BookSearchResult } from "@/lib/types";
import { Star, FileText, Globe, Building } from 'lucide-react';
import Link from "next/link";
import { Separator } from "../ui/separator";


export function BookDetailsDialog({ book, children }: { book: Book | BookWithListContext | BookSearchResult, children: React.ReactNode }) {
    
    const isBookWithContext = 'listId' in book && book.listId !== 'recommendation';
    const hasMetadata = book.averageRating || book.pageCount || book.publisher || book.language;

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
                        
                        {hasMetadata && (
                           <>
                             <Separator className="my-4"/>
                             <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-muted-foreground">
                                {book.averageRating && book.averageRating > 0 && <div className="flex items-center gap-2"><Star className="size-4 text-amber-400" /> <span>{book.averageRating.toFixed(1)} / 5 rating</span></div>}
                                {book.pageCount && book.pageCount > 0 && <div className="flex items-center gap-2"><FileText className="size-4" /> <span>{book.pageCount} pages</span></div>}
                                {book.publisher && <div className="flex items-center gap-2"><Building className="size-4" /> <span>{book.publisher}</span></div>}
                                {book.language && <div className="flex items-center gap-2"><Globe className="size-4" /> <span>{book.language.toUpperCase()}</span></div>}
                            </div>
                           </>
                        )}
                        
                        <p className="mt-4 text-foreground/80 max-h-48 overflow-y-auto">{book.description}</p>
                        
                        {isBookWithContext && book.listId && (
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
