
'use client';

import { useMemo, useEffect, useState } from "react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { useRouter }from "next/navigation";
import { collection, query, where, limit, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { BookListCard } from "@/components/app/book-list-card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Clover, Sparkles } from "lucide-react";
import { BookCard } from "@/components/app/book-card";
import type { BookWithListContext } from "@/lib/types";


function SectionLoadingSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(count)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <div className="aspect-[2/3] w-full bg-muted-foreground/20 rounded-t-lg"></div>
                    <CardHeader className="p-4">
                        <div className="h-5 w-3/4 rounded bg-muted-foreground/20"></div>
                        <div className="h-4 w-1/2 rounded bg-muted-foreground/20 mt-2"></div>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}

export default function HomePage() {
    const { firestore, user, isUserLoading } = useFirebase();
    const router = useRouter();
    const [recentlyViewedIds] = useLocalStorage<string[]>('recentlyViewedBookLists', []);
    
    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/welcome');
        }
    }, [isUserLoading, user, router]);

    const publicListsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'public_book_lists'), orderBy('createdAt', 'desc'), limit(12));
    }, [firestore]);

    const myPrivateListsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, `users/${user.uid}/book_lists`), limit(4));
    }, [firestore, user]);

    const myPublicListsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'public_book_lists'), where('userId', '==', user.uid), limit(4));
    }, [firestore, user]);

    const { data: publicLists, isLoading: isLoadingPublic } = useCollection(publicListsQuery);
    const { data: myPrivateLists, isLoading: isLoadingMyPrivate } = useCollection(myPrivateListsQuery);
    const { data: myPublicLists, isLoading: isLoadingMyPublic } = useCollection(myPublicListsQuery);

    const myLists = useMemo(() => {
        return [...(myPrivateLists || []), ...(myPublicLists || [])].sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0,4);
    }, [myPrivateLists, myPublicLists]);
    
    const isLoadingMyLists = isLoadingMyPrivate || isLoadingMyPublic;
    
    const featuredBooks: BookWithListContext[] = useMemo(() => {
        if (!publicLists) return [];

        const bookMap = new Map<string, BookWithListContext>();

        const addBooksFromList = (list: any) => {
            if (!list?.books) return;
            for (const book of list.books) {
                const uniqueKey = `${book.title}-${book.author}`;
                if (!bookMap.has(uniqueKey)) {
                    bookMap.set(uniqueKey, { ...book, listId: list.id, listName: list.name });
                }
            }
        };

        // Prioritize recently viewed lists
        const recentlyViewedLists = recentlyViewedIds
            .map(id => publicLists.find(list => list.id === id))
            .filter(Boolean);

        recentlyViewedLists.forEach(addBooksFromList);
        
        // Then add from the latest public lists
        publicLists.forEach(addBooksFromList);

        return Array.from(bookMap.values()).slice(0, 8); // Take up to 8 unique books
    }, [publicLists, recentlyViewedIds]);
    
    if (isUserLoading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="animate-spin text-accent size-12" />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <main className="flex-grow container mx-auto p-4 md:p-8 space-y-12 md:space-y-16">
                 <header className="py-8 text-center">
                    <Clover className="size-12 md:size-16 text-accent mx-auto" />
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-accent leading-none mt-4">
                        Clover AI
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground mt-2">Your AI-powered guide to the world of books.</p>
                </header>
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl md:text-3xl font-headline flex items-center gap-2">
                           <Sparkles /> Featured Books
                        </h2>
                         <Button variant="link" asChild>
                            <Link href="/recommendations">
                                Get AI Recommendations <ArrowRight className="ml-2"/>
                            </Link>
                        </Button>
                    </div>
                    {isLoadingPublic ? (
                        <SectionLoadingSkeleton count={8} />
                    ) : featuredBooks && featuredBooks.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                           {featuredBooks.map(book => <BookCard key={`${book.listId}-${book.title}`} book={book} />)}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No featured books available right now.</p>
                    )}
                </section>

                {myLists.length > 0 && (
                     <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl md:text-3xl font-headline">My Book Lists</h2>
                             <Link href={`/profile/${user.uid}`} passHref>
                                <Button variant="link">View All <ArrowRight className="ml-2"/></Button>
                             </Link>
                        </div>
                        {isLoadingMyLists ? <SectionLoadingSkeleton /> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {myLists.slice(0, 4).map(list => <BookListCard key={list.id} list={list} />)}
                            </div>
                        )}
                    </section>
                )}

                {!isLoadingMyLists && myLists.length === 0 && (
                    <section>
                         <div className="text-center py-12 md:py-16 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">You haven't created any book lists yet.</p>
                            <Button variant="link" asChild className="mt-2">
                                <Link href="/book-lists/new">Create one now</Link>
                            </Button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
