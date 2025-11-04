
'use client';

import { useMemo, useEffect, useState, useCallback } from "react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { useRouter }from "next/navigation";
import { collection, query, where, limit, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, ArrowRight, Sparkles, Clover, RefreshCw } from "lucide-react";
import { BookListCard } from "@/components/app/book-list-card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardHeader } from "@/components/ui/card";
import { BookCard } from "@/components/app/book-card";
import type { Book, BookWithListContext, BookSearchResult } from "@/lib/types";
import { summarizeLibrary } from "@/ai/flows/summarize-library";
import { generateBookRecommendations } from "@/ai/flows/generate-book-recommendations";
import { useToast } from "@/hooks/use-toast";


type CachedRecommendations = {
  timestamp: number;
  books: BookSearchResult[];
};


function SectionLoadingSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(count)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <div className="aspect-square w-full bg-muted-foreground/20 rounded-t-lg"></div>
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
    const { toast } = useToast();
    
    const [recommendations, setRecommendations] = useLocalStorage<CachedRecommendations | null>('homepage-recommendations', null);
    const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
    
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
    
    const allMyBooks = useMemo(() => {
        const bookSet = new Set<string>();
        [...(myPrivateLists || []), ...(myPublicLists || [])].forEach(list => {
            list.books?.forEach((book: Book) => {
                bookSet.add(`${book.title.toLowerCase().trim()}|${book.author.toLowerCase().trim()}`);
            });
        });
        return bookSet;
    }, [myPrivateLists, myPublicLists]);


    const getNewRecommendations = useCallback(async (force = false) => {
        if (!user || (!myPrivateLists && !myPublicLists)) return;
        
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        if (!force && recommendations && (now - recommendations.timestamp < oneHour)) {
            // Cache is fresh, do nothing
            return;
        }

        setIsGeneratingRecs(true);
        const allLists = [...(myPrivateLists || []), ...(myPublicLists || [])];

        try {
            const libraryContent = allLists
                .flatMap(list => list.books || [])
                .map((book: Book) => `${book.title} by ${book.author}`)
                .join('\n');
            
            if (!libraryContent.trim()) {
                setIsGeneratingRecs(false);
                setRecommendations(null); // Clear recommendations if library is empty
                return;
            }

            const prefs = await summarizeLibrary({ books: libraryContent });
            if (!prefs.summary) {
                 setIsGeneratingRecs(false);
                 setRecommendations(null);
                 return;
            }

            const recsResult = await generateBookRecommendations({ preferences: prefs.summary });

            const newBooks = recsResult.recommendations;
            
            setRecommendations({
                timestamp: Date.now(),
                books: newBooks.slice(0, 4) // Cache up to 4 recommendations
            });

             if (force) {
                toast({
                    title: "Recommendations Refreshed",
                    description: "We've found some new books for you.",
                });
            }

        } catch (error) {
            console.error("Failed to generate recommendations:", error);
            if (force) {
                toast({
                    variant: "destructive",
                    title: "Could not refresh recommendations",
                    description: "The recommendation service might be temporarily unavailable.",
                });
            }
             // Clear cache on error to allow retrying
            setRecommendations(null);
        } finally {
            setIsGeneratingRecs(false);
        }

    }, [user, myPrivateLists, myPublicLists, recommendations, setRecommendations, toast]);

    useEffect(() => {
        // Fetch recommendations on initial load if cache is stale or lists are loaded
        const listsLoaded = !isLoadingMyPrivate && !isLoadingMyPublic;
        if (user && listsLoaded) {
            getNewRecommendations(false);
        }
    }, [user, isLoadingMyPrivate, isLoadingMyPublic, getNewRecommendations]);

    const filteredRecommendations = useMemo(() => {
        if (!recommendations?.books) return [];
        return recommendations.books.filter(book => {
            const bookKey = `${book.title.toLowerCase().trim()}|${book.author.toLowerCase().trim()}`;
            return !allMyBooks.has(bookKey);
        });
    }, [recommendations, allMyBooks]);
    
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
                           <Sparkles /> Recommended For You
                        </h2>
                         <div className="flex items-center gap-2">
                             <Button variant="ghost" size="icon" onClick={() => getNewRecommendations(true)} disabled={isGeneratingRecs}>
                                {isGeneratingRecs ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                                <span className="sr-only">Refresh Recommendations</span>
                             </Button>
                             <Button variant="link" asChild>
                                <Link href="/recommendations">
                                    Get More <ArrowRight className="ml-2 hidden sm:inline"/>
                                </Link>
                            </Button>
                         </div>
                    </div>
                    {isGeneratingRecs && !filteredRecommendations.length ? (
                        <SectionLoadingSkeleton count={4} />
                    ) : filteredRecommendations.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                           {filteredRecommendations.map(book => <BookCard key={book.title} book={{...book, listId: "recommendation"}} />)}
                        </div>
                    ) : !isGeneratingRecs ? (
                        <div className="text-center py-12 md:py-16 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Add books to your lists to get personalized recommendations.</p>
                            <Button variant="link" asChild className="mt-2">
                                <Link href="/book-lists/new">Start a new list</Link>
                            </Button>
                        </div>
                    ) : null}
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
            </main>
        </div>
    );
}
