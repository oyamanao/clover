
'use client';

import { useMemo, useEffect, useState } from "react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { useRouter }from "next/navigation";
import { collection, query, where, limit, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { BookListCard } from "@/components/app/book-list-card";
import { BookCard } from "@/components/app/book-card";
import type { Book, BookWithListContext } from "@/lib/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Clover, Sparkles } from "lucide-react";
import { summarizeLibrary } from "@/ai/flows/summarize-library";
import { generateBookRecommendations } from "@/ai/flows/generate-book-recommendations";
import { searchBooks } from "@/ai/flows/search-books";


function SectionLoadingSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(count)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 w-3/4 rounded bg-muted-foreground/20"></div>
                        <div className="h-4 w-1/2 rounded bg-muted-foreground/20 mt-2"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-4 w-full rounded bg-muted-foreground/20"></div>
                        <div className="h-4 w-5/6 rounded bg-muted-foreground/20 mt-2"></div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function BookSectionLoadingSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {[...Array(count)].map((_, i) => (
                 <Card key={i} className="animate-pulse">
                    <CardContent className="p-0">
                        <div className="bg-muted-foreground/20 aspect-square w-full"></div>
                        <div className="p-4 space-y-2">
                            <div className="h-5 w-3/4 rounded bg-muted-foreground/20"></div>
                            <div className="h-4 w-1/2 rounded bg-muted-foreground/20"></div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function HomePage() {
    const { firestore, user, isUserLoading } = useFirebase();
    const router = useRouter();
    const [recentlyViewedIds, setRecentlyViewedIds] = useLocalStorage<string[]>('recentlyViewedBookLists', []);
    const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
    const [recommendationError, setRecommendationError] = useState<string | null>(null);

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
    
    useEffect(() => {
        const getRecommendations = async () => {
            if (isLoadingMyLists || !user) return;
            setIsLoadingRecommendations(true);
            setRecommendationError(null);
            
            try {
                const allMyBooks = (myPrivateLists || []).concat(myPublicLists || []).flatMap(list => list.books || []);

                if (allMyBooks.length > 0) {
                    const libraryContent = allMyBooks.map(b => `${b.title} by ${b.author}`).join('\n');
                    const prefs = await summarizeLibrary({ books: libraryContent });
                    const preferencesText = `Genres: ${prefs.genres.join(', ')}. Themes: ${prefs.themes.join(', ')}. Summary: ${prefs.summary}`;

                    const recommendationsResult = await generateBookRecommendations({ preferences: preferencesText });

                    const parsedTitles = recommendationsResult.recommendations.split('\n\n')
                        .map(rec => rec.match(/\*\*Title:\*\*\s*(.*)/)?.[1].trim())
                        .filter(Boolean) as string[];

                    if (parsedTitles.length > 0) {
                        const searchPromises = parsedTitles.map(title => searchBooks({ query: `title:"${title}"` }));
                        const searchResults = await Promise.all(searchPromises);
                        const booksWithDetails = searchResults.map(res => res.books?.[0]).filter(Boolean);
                        setRecommendedBooks(booksWithDetails.map((b, i) => ({...b, id: i})));
                    } else {
                        setRecommendedBooks([]);
                    }
                } else {
                    setRecommendedBooks([]);
                }
            } catch (error) {
                console.error("Failed to get recommendations:", error);
                setRecommendationError("The recommendation service is temporarily unavailable. Please try again later.");
                setRecommendedBooks([]);
            } finally {
                setIsLoadingRecommendations(false);
            }
        };

        getRecommendations();

    }, [myPublicLists, myPrivateLists, isLoadingMyLists, user]);


    const recentlyViewedLists = useMemo(() => {
        if (!publicLists || recentlyViewedIds.length === 0) return [];
        
        const listMap = new Map(publicLists.map(list => [list.id, list]));
        return recentlyViewedIds.map(id => listMap.get(id)).filter(Boolean).slice(0, 4);
    }, [publicLists, recentlyViewedIds]);
    
    const handleRemoveFromRecentlyViewed = (listId: string) => {
        setRecentlyViewedIds(prev => prev.filter(id => id !== listId));
    };


    if (isUserLoading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="animate-spin text-accent size-12" />
            </div>
        );
    }
    
    const hasPersonalRecommendations = recommendedBooks.length > 0 && myLists.length > 0;

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
                           <Sparkles /> {hasPersonalRecommendations ? "Recommended For You" : "Featured Books"}
                        </h2>
                         <Button variant="link" asChild>
                            <Link href="/recommendations">
                                Get New Recommendations <ArrowRight className="ml-2"/>
                            </Link>
                        </Button>
                    </div>
                    {isLoadingRecommendations ? <BookSectionLoadingSkeleton /> : (
                        recommendationError ? (
                            <p className="text-muted-foreground">{recommendationError}</p>
                        ) : recommendedBooks && recommendedBooks.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                                {recommendedBooks.map((book, i) => <BookCard key={i} book={{...book, listId: 'recommendation', listName: 'Recommendation'}} />)}
                            </div>
                        ) : <p className="text-muted-foreground">No recommended books available right now.</p>
                    )}
                </section>

                {recentlyViewedLists.length > 0 && (
                     <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl md:text-3xl font-headline">Recently Viewed</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {recentlyViewedLists.map(list => list && <BookListCard key={list.id} list={list} showDelete onRemove={handleRemoveFromRecentlyViewed} />)}
                        </div>
                    </section>
                )}

                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl md:text-3xl font-headline">My Book Lists</h2>
                         {myLists && myLists.length > 0 && (
                             <Link href={`/profile/${user.uid}`} passHref>
                                <Button variant="link">View All <ArrowRight className="ml-2"/></Button>
                             </Link>
                         )}
                    </div>
                     {isLoadingMyLists ? <SectionLoadingSkeleton /> : (
                         myLists && myLists.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {myLists.map(list => <BookListCard key={list.id} list={list} />)}
                            </div>
                        ) : (
                             <div className="text-center py-12 md:py-16 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">You haven't created any book lists yet.</p>
                                <Button variant="link" asChild className="mt-2">
                                    <Link href="/book-lists/new">Create one now</Link>
                                </Button>
                            </div>
                        )
                    )}
                </section>
            </main>
        </div>
    );
}

    

    
