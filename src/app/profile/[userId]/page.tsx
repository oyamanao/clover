'use client';

import { useFirebase, useMemoFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/app/header';
import { Loader2, User as UserIcon, Book, PlusCircle, Heart } from 'lucide-react';
import { doc, collection, query, where } from 'firebase/firestore';
import { useDoc, useCollection } from '@/firebase';
import Link from 'next/link';

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const { firestore, user: currentUser, isUserLoading } = useFirebase();

  const userRef = useMemoFirebase(() => {
    if (!firestore || !params.userId) return null;
    return doc(firestore, 'users', params.userId);
  }, [firestore, params.userId]);
  const { data: profileUser, isLoading: isProfileLoading } = useDoc(userRef);

  const privateListsQuery = useMemoFirebase(() => {
    if (!firestore || !params.userId || currentUser?.uid !== params.userId) return null;
    return query(collection(firestore, `users/${params.userId}/book_lists`));
  }, [firestore, params.userId, currentUser?.uid]);

  const publicListsQuery = useMemoFirebase(() => {
    if (!firestore || !params.userId) return null;
    return query(collection(firestore, 'public_book_lists'), where('userId', '==', params.userId));
  }, [firestore, params.userId]);

  const { data: privateLists, isLoading: isLoadingPrivate } = useCollection(privateListsQuery);
  const { data: publicLists, isLoading: isLoadingPublic } = useCollection(publicListsQuery);

  const bookLists = [...(privateLists || []), ...(publicLists || [])];
  const isLoadingLists = isLoadingPrivate || isLoadingPublic;

  if (isUserLoading || isProfileLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="animate-spin text-accent size-12" />
        </div>
    );
  }

  if (!profileUser) {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          <Header />
          <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-headline">User not found</h1>
              <p className="text-muted-foreground">This profile could not be loaded.</p>
            </div>
          </main>
        </div>
    )
  }

  const isOwnProfile = currentUser?.uid === params.userId;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="h-24 w-24 border-4 border-accent">
            <AvatarImage src={profileUser.photoURL || undefined} alt={profileUser.displayName || 'User'} />
            <AvatarFallback className="text-3xl">
              {profileUser.displayName ? profileUser.displayName.charAt(0) : <UserIcon />}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-headline font-bold">{profileUser.displayName}</h1>
            <p className="text-lg text-muted-foreground">{profileUser.email}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-headline">Book Lists</h2>
            {isOwnProfile && (
                <Link href="/book-lists/new" passHref>
                    <Button>
                        <PlusCircle className="mr-2" /> Create New List
                    </Button>
                </Link>
            )}
        </div>
        
        {isLoadingLists ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
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
        ) : bookLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookLists.map((list) => (
              <Card key={list.id} className="hover:shadow-lg hover:border-accent/50 transition-all flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline">{list.name}</CardTitle>
                  <CardDescription>{list.isPublic ? 'Public List' : 'Private List'}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground mb-4 line-clamp-2">{list.description}</p>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Book className="size-4"/>
                        <span>{list.books.length} {list.books.length === 1 ? 'book' : 'books'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{list.likes || 0}</span>
                        <Heart className="size-4"/>
                      </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                    {isOwnProfile ? "You haven't" : `${profileUser.displayName} hasn't`} created any book lists yet.
                </p>
                {isOwnProfile && (
                    <Button variant="link" asChild className="mt-2">
                        <Link href="/book-lists/new">Create one now</Link>
                    </Button>
                )}
            </div>
        )}
      </main>
    </div>
  );
}
