'use client';

import { useMemo, useState, useEffect, use } from 'react';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { useDoc } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/app/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Heart, Share2, Edit, User as UserIcon, Book } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { BookCover } from '@/components/app/book-cover';
import { Separator } from '@/components/ui/separator';

function BookInList({ book }: { book: any }) {
    return (
        <div className="flex items-start gap-4 p-4 border-b">
            <BookCover 
                src={book.imageUrl} 
                alt={`Cover of ${book.title}`} 
                width={80} 
                height={120} 
                className="rounded-md object-cover shadow-md"
            />
            <div className="flex-grow">
                <h3 className="text-lg font-semibold font-headline">{book.title}</h3>
                <p className="text-sm text-muted-foreground">by {book.author}</p>
                <p className="mt-2 text-sm text-foreground/80 line-clamp-3">{book.description}</p>
            </div>
        </div>
    );
}

export default function BookListPage({ params: paramsPromise }: { params: Promise<{ listId: string }> }) {
    const { listId } = use(paramsPromise);
    const { firestore, user } = useFirebase();
    const { toast } = useToast();

    // To find the booklist, we have to check both public and private collections.
    const listRef = useMemoFirebase(() => {
        if (!firestore || !listId) return null;
        // This is a simplification. We first try public, then private if the user is logged in.
        // A more robust solution might need a search across collections or a different data model.
        return doc(firestore, 'public_book_lists', listId);
    }, [firestore, listId]);
    
    // We will attempt to fetch the private doc if the public one fails
    const privateListRef = useMemoFirebase(() => {
        if (!firestore || !user || !listId) return null;
        return doc(firestore, `users/${user.uid}/book_lists`, listId);
    }, [firestore, user, listId]);


    const { data: listData, isLoading: isLoadingPublic } = useDoc(listRef);
    const { data: privateListData, isLoading: isLoadingPrivate } = useDoc(privateListRef);
    
    const [finalListData, setFinalListData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [listOwner, setListOwner] = useState<any>(null);

     useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            let dataToShow = null;
            let finalId = listId;

            if (listData) {
                dataToShow = listData;
                finalId = listData.id;
            } else if (privateListData) {
                dataToShow = privateListData;
                finalId = privateListData.id;
            }

            if (dataToShow) {
                setFinalListData({...dataToShow, id: finalId});
                // Fetch owner data
                if (firestore && dataToShow.userId) {
                    const ownerRef = doc(firestore, 'users', dataToShow.userId);
                    const ownerSnap = await getDoc(ownerRef);
                    if (ownerSnap.exists()) {
                        setListOwner(ownerSnap.data());
                    } else {
                        // If owner data isn't in users collection, maybe it's on the list
                        if (dataToShow.userName) {
                            setListOwner({
                                uid: dataToShow.userId,
                                displayName: dataToShow.userName,
                                photoURL: null
                            });
                        }
                    }
                }
            }
            // Only set loading to false when both have finished
            if (!isLoadingPublic && !isLoadingPrivate) {
                setIsLoading(false);
            }
        };

        loadData();
    }, [listData, privateListData, isLoadingPublic, isLoadingPrivate, firestore, listId]);
    
    const isOwner = user && finalListData && user.uid === finalListData.userId;

    const handleLike = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'You must be logged in to like a list.' });
            return;
        }
        if (!finalListData?.isPublic) {
            toast({ variant: 'destructive', title: 'You can only like public lists.' });
            return;
        }

        if (!firestore || !finalListData.id) return;
        const docRef = doc(firestore, 'public_book_lists', finalListData.id);
        try {
            // Using setDoc with merge to ensure the document is created if it somehow doesn't exist
            // while trying to increment. `increment` only works with `updateDoc`.
            // A more robust way is to use a transaction, but for a simple like, this is okay.
            const currentLikes = finalListData.likes || 0;
            await setDoc(docRef, { likes: currentLikes + 1 }, { merge: true });

            setFinalListData((prev: any) => ({ ...prev, likes: currentLikes + 1 }));
            toast({ title: 'Liked!', description: `You liked "${finalListData.name}"` });
        } catch (error) {
            console.error("Error liking list:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not like the list.' });
        }
    };
    
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link Copied!", description: "The link to this list has been copied to your clipboard." });
    }

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="animate-spin text-accent size-12" />
            </div>
        );
    }
    
     if (!finalListData) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-headline">Book List Not Found</h1>
                        <p className="text-muted-foreground">This book list could not be found or is private.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-4xl font-headline">{finalListData.name}</CardTitle>
                        <CardDescription className="pt-2">{finalListData.description}</CardDescription>

                        <div className="flex justify-between items-end pt-4">
                            {listOwner && (
                                <Link href={`/profile/${listOwner.uid}`} className="flex items-center gap-3 group">
                                    <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-accent transition-colors">
                                        <AvatarImage src={listOwner.photoURL || undefined} alt={listOwner.displayName || 'User'} />
                                        <AvatarFallback>
                                            {listOwner.displayName ? listOwner.displayName.charAt(0) : <UserIcon />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold group-hover:text-accent transition-colors">{listOwner.displayName}</p>
                                        <p className="text-xs text-muted-foreground">{finalListData.isPublic ? 'Public List' : 'Private List'}</p>
                                    </div>
                                </Link>
                            )}
                             <div className="flex items-center gap-4 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Heart className="size-4"/>
                                    <span>{finalListData.likes || 0}</span>
                                </div>
                                 <div className="flex items-center gap-1">
                                    <Share2 className="size-4"/>
                                    <span>Share</span>
                                </div>
                            </div>
                        </div>
                        <Separator className="mt-4"/>
                         <div className="flex items-center gap-2 pt-4">
                            {isOwner ? (
                                <Button>
                                    <Edit className="mr-2" /> Edit List
                                </Button>
                            ) : (
                                <Button variant="outline" onClick={handleLike} disabled={!finalListData.isPublic}>
                                    <Heart className="mr-2" /> Like
                                </Button>
                            )}
                            <Button variant="outline" onClick={handleShare}>
                                <Share2 className="mr-2" /> Share
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="border-t">
                            {finalListData.books && finalListData.books.length > 0 ? (
                                finalListData.books.map((book: any, index: number) => (
                                    <BookInList key={index} book={book} />
                                ))
                            ) : (
                                <div className="text-center p-12 text-muted-foreground">
                                    <Book className="mx-auto size-12 mb-2" />
                                    This list has no books yet.
                                </div>
                            )}
                         </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
