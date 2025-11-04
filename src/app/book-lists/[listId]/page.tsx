
'use client';

import { useMemo, useState, useEffect, use } from 'react';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { doc, setDoc, arrayUnion, arrayRemove, addDoc, collection, serverTimestamp, getDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Heart, Share2, Edit, User as UserIcon, Book, Copy, Star, FileText, Globe, Building } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { BookCover } from '@/components/app/book-cover';
import { Separator } from '@/components/ui/separator';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { BookDetailsDialog } from '@/components/app/book-details-dialog';


function BookInList({ book }: { book: any }) {
    return (
        <div className="flex items-start gap-4 p-4 border-b">
            <BookCover 
                src={book.imageUrl} 
                alt={`Cover of ${book.title}`} 
                width={80} 
                height={120} 
                className="rounded-md shadow-md"
            />
            <div className="flex-grow">
                 <BookDetailsDialog book={book}>
                    <h3 className="text-lg font-semibold font-headline hover:underline cursor-pointer">{book.title}</h3>
                </BookDetailsDialog>
                <p className="text-sm text-muted-foreground">by {book.author}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                    {book.averageRating > 0 && <div className="flex items-center gap-1"><Star className="size-3" /> {book.averageRating.toFixed(1)}</div>}
                    {book.pageCount > 0 && <div className="flex items-center gap-1"><FileText className="size-3" /> {book.pageCount} pages</div>}
                    {book.publisher && <div className="flex items-center gap-1"><Building className="size-3" /> {book.publisher}</div>}
                    {book.language && <div className="flex items-center gap-1"><Globe className="size-3" /> {book.language.toUpperCase()}</div>}
                </div>
                <p className="mt-2 text-sm text-foreground/80 line-clamp-3">{book.description}</p>
            </div>
        </div>
    );
}

export default function BookListPage({ params: paramsPromise }: { params: Promise<{ listId: string }> }) {
    const { listId } = use(paramsPromise);
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const router = useRouter();
    const [recentlyViewed, setRecentlyViewed] = useLocalStorage<string[]>('recentlyViewedBookLists', []);
    
    const [finalListData, setFinalListData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCopying, setIsCopying] = useState(false);

    useEffect(() => {
        if (!firestore || !listId) return;

        let unsubscribe: (() => void) | null = null;
        let isCancelled = false;

        const fetchData = async () => {
            setIsLoading(true);
            setFinalListData(null);

            // 1. Try to get the public document
            const publicListRef = doc(firestore, 'public_book_lists', listId);
            
            try {
                const publicSnap = await getDoc(publicListRef);

                if (publicSnap.exists()) {
                    if (isCancelled) return;
                    
                    const data = { ...publicSnap.data(), id: publicSnap.id };
                    setFinalListData(data);
                    
                    // If it's public, add to recently viewed
                     if (data.isPublic) {
                        setRecentlyViewed(prev => {
                            const newRecentlyViewed = [listId, ...prev.filter(id => id !== listId)];
                            return newRecentlyViewed.slice(0, 10);
                        });
                    }

                    // Subscribe to real-time updates for this public doc
                    unsubscribe = onSnapshot(publicListRef, (snapshot) => {
                        if (snapshot.exists()) {
                            setFinalListData({ ...snapshot.data(), id: snapshot.id });
                        } else {
                            setFinalListData(null); // It might have been deleted
                        }
                    });

                } else {
                    // 2. If public doc doesn't exist and user is logged in, try private
                    if (user) {
                        const privateListRef = doc(firestore, `users/${user.uid}/book_lists`, listId);
                        const privateSnap = await getDoc(privateListRef);

                        if (privateSnap.exists()) {
                           if (isCancelled) return;
                           
                           setFinalListData({ ...privateSnap.data(), id: privateSnap.id });
                           
                           // Subscribe to real-time updates for this private doc
                           unsubscribe = onSnapshot(privateListRef, (snapshot) => {
                               if (snapshot.exists()) {
                                   setFinalListData({ ...snapshot.data(), id: snapshot.id });
                               } else {
                                   setFinalListData(null);
                               }
                           });
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching book list:", error);
                const permissionError = new FirestorePermissionError({
                    path: `public_book_lists/${listId}`, // Assume public path for error
                    operation: 'get',
                });
                errorEmitter.emit('permission-error', permissionError);
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isCancelled = true;
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [firestore, listId, user, setRecentlyViewed]);

    const isOwner = user && finalListData && user.uid === finalListData.userId;
    const hasLiked = user && finalListData?.likedBy?.includes(user.uid);

    const handleLike = () => {
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
        
        const originalLikedBy = finalListData.likedBy || [];
        const isCurrentlyLiked = originalLikedBy.includes(user.uid);

        // Optimistically update the UI
        const optimisticLikedBy = isCurrentlyLiked
            ? originalLikedBy.filter((uid: string) => uid !== user.uid)
            : [...originalLikedBy, user.uid];

        setFinalListData((prev: any) => ({ ...prev, likedBy: optimisticLikedBy }));

        const firestoreUpdate = {
            likedBy: isCurrentlyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
        };

        setDoc(docRef, firestoreUpdate, { merge: true })
         .then(() => {
            toast({ title: isCurrentlyLiked ? 'Unliked!' : 'Liked!', description: `You ${isCurrentlyLiked ? 'un' : ''}liked "${finalListData.name}"` });
         })
         .catch(async (serverError) => {
            // Revert optimistic update on error
            setFinalListData((prev: any) => ({ ...prev, likedBy: originalLikedBy }));

            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: { likedBy: 'LIKE_TOGGLE_OPERATION' },
            });
            errorEmitter.emit('permission-error', permissionError);
         });
    };
    
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link Copied!", description: "The link to this list has been copied to your clipboard." });
    }

    const handleCopyList = async () => {
        if (!user || !firestore || !finalListData) {
            toast({ variant: 'destructive', title: 'You must be logged in to copy a list.' });
            return;
        }
        setIsCopying(true);

        const newBookListData = {
            name: `Copy of ${finalListData.name}`,
            description: finalListData.description,
            isPublic: false, // Copied lists are private by default
            userId: user.uid,
            userName: user.displayName,
            userPhotoURL: user.photoURL,
            books: finalListData.books || [],
            createdAt: serverTimestamp(),
            likedBy: [],
        };
        
        const collectionRef = collection(firestore, `users/${user.uid}/book_lists`);

        addDoc(collectionRef, newBookListData)
            .then(() => {
                toast({
                    title: 'List Copied!',
                    description: `A private copy of "${finalListData.name}" has been added to your lists.`,
                });
                router.push(`/profile/${user.uid}`);
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: collectionRef.path,
                    operation: 'create',
                    requestResourceData: newBookListData,
                });
                errorEmitter.emit('permission-error', permissionError);
                setIsCopying(false);
            });
    };

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
                
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-headline">Book List Not Found</h1>
                        <p className="text-muted-foreground">This book list could not be found or is private.</p>
                    </div>
                </main>
            </div>
        );
    }
    
    const ownerName = finalListData.userName || 'Unknown User';
    const ownerPhoto = finalListData.userPhotoURL || undefined;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-3xl md:text-4xl font-headline">{finalListData.name}</CardTitle>
                        <CardDescription className="pt-2">{finalListData.description}</CardDescription>

                        <div className="flex justify-between items-end pt-4">
                            {finalListData.userId && (
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-transparent">
                                        <AvatarImage src={ownerPhoto} alt={ownerName} />
                                        <AvatarFallback>
                                            {ownerName ? ownerName.charAt(0) : <UserIcon />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{ownerName}</p>
                                        <p className="text-xs text-muted-foreground">{finalListData.isPublic ? 'Public List' : 'Private List'}</p>
                                    </div>
                                </div>
                            )}
                             <div className="flex items-center gap-4 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Heart className={cn("size-4", hasLiked && 'text-red-500 fill-current')} />
                                    <span>{finalListData.likedBy?.length || 0}</span>
                                </div>
                                 <div className="flex items-center gap-1">
                                    <Share2 className="size-4"/>
                                    <span>Share</span>
                                </div>
                            </div>
                        </div>
                        <Separator className="mt-4"/>
                         <div className="flex items-center gap-2 pt-4 flex-wrap">
                            {isOwner ? (
                                <Link href={`/book-lists/${listId}/edit`} passHref>
                                    <Button>
                                        <Edit className="mr-2" /> Edit List
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Button variant={hasLiked ? "default" : "outline"} onClick={handleLike} disabled={!finalListData.isPublic}>
                                        <Heart className={cn("mr-2", hasLiked && 'text-red-500 fill-current')} /> {hasLiked ? 'Liked' : 'Like'}
                                    </Button>
                                    {user && finalListData.isPublic && (
                                        <Button variant="outline" onClick={handleCopyList} disabled={isCopying}>
                                            {isCopying ? <Loader2 className="mr-2 animate-spin" /> : <Copy className="mr-2" />}
                                            {isCopying ? 'Copying...' : 'Copy List'}
                                        </Button>
                                    )}
                                </>
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

    