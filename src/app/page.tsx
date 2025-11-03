'use client';

import { useMemo, useEffect } from "react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { useRouter }from "next/navigation";
import { Header } from "@/components/app/header";
import { collection, query, where, limit } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Book, Heart, Users, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function BookListCard({ list }: { list: any }) {
    return (
         <Link href={`/book-lists/${list.id}`} className="block h-full">
            <Card className="hover:shadow-lg hover:border-accent/50 transition-all flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="font-headline">{list.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                        {list.isPublic ? <Users className="size-4" /> : <Lock className="size-4" />}
                        {list.isPublic ? 'Public List' : 'Private List'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground mb-4 line-clamp-2 h-10">{list.description}</p>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Book className="size-4"/>
                            <span>{list.books?.length || 0} {list.books?.length === 1 ? 'book' : 'books'}</span>
                        </div>
                         <div className="flex items-center gap-1">
                            <span>{list.likedBy?.length || 0}</span>
                            <Heart className="size-4"/>
                          </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}


function SectionLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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

export default function HomePage() {
    const { firestore, user, isUserLoading } = useFirebase();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/welcome');
        }
    }, [isUserLoading, user, router]);

    const publicListsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'public_book_lists'), limit(8));
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

    if (isUserLoading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="animate-spin text-accent size-12" />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8 space-y-12">
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-headline">Recommended For You</h2>
                        <Button variant="link">View All <ArrowRight className="ml-2"/></Button>
                    </div>
                    {isLoadingPublic ? <SectionLoadingSkeleton /> : (
                         publicLists && publicLists.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {publicLists.map(list => <BookListCard key={list.id} list={list} />)}
                            </div>
                        ) : <p className="text-muted-foreground">No public book lists available right now.</p>
                    )}
                </section>
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-headline">My Book Lists</h2>
                         {myLists && myLists.length > 0 && (
                             <Link href={`/profile/${user.uid}`} passHref>
                                <Button variant="link">View All <ArrowRight className="ml-2"/></Button>
                             </Link>
                         )}
                    </div>
                     {isLoadingMyLists ? <SectionLoadingSkeleton /> : (
                         myLists && myLists.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {myLists.map(list => <BookListCard key={list.id} list={list} />)}
                            </div>
                        ) : (
                             <div className="text-center py-16 border-2 border-dashed rounded-lg">
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
