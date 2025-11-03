'use client';

import { useFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/app/header';
import { Loader2, User as UserIcon, Book, PlusCircle } from 'lucide-react';
import { doc, collection, query, where } from 'firebase/firestore';
import { useDoc, useCollection } from '@/firebase';
import { useMemo } from 'react';
import Link from 'next/link';

// FAKE DATA FOR NOW
const fakeBookLists = [
  { id: '1', name: 'Sci-Fi Adventures', description: 'My favorite space operas and futuristic tales.', isPublic: true, bookCount: 12, likes: 128 },
  { id: '2', name: 'Modern Fantasy', description: 'Magic, dragons, and epic quests.', isPublic: true, bookCount: 8, likes: 74 },
  { id: '3', name: 'Private Reading List', description: 'Just for me.', isPublic: false, bookCount: 23, likes: 0 },
];


export default function ProfilePage({ params }: { params: { userId: string } }) {
  const { firestore, user: currentUser, isUserLoading } = useFirebase();

  const userRef = useMemo(() => {
    if (!firestore || !params.userId) return null;
    return doc(firestore, 'users', params.userId);
  }, [firestore, params.userId]);
  const { data: profileUser, isLoading: isProfileLoading } = useDoc(userRef as any);

  // TODO: Replace with real data fetching
  const bookLists = fakeBookLists;
  const isLoadingLists = false;


  if (isUserLoading || isProfileLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="animate-spin text-accent size-12" />
        </div>
    );
  }

  if (!profileUser) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <p>User not found.</p>
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
              <Card key={list.id} className="hover:shadow-lg hover:border-accent/50 transition-all">
                <CardHeader>
                  <CardTitle className="font-headline">{list.name}</CardTitle>
                  <CardDescription>{list.isPublic ? 'Public List' : 'Private List'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{list.description}</p>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Book className="size-4"/>
                        <span>{list.bookCount} books</span>
                      </div>
                      <span>{list.likes} likes</span>
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
            </div>
        )}
      </main>
    </div>
  );
}
