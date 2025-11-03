
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn, Clover } from 'lucide-react';
import { AnimatedWelcomeBackground } from '@/components/app/animated-welcome-background';
import { Card, CardContent } from '@/components/ui/card';

export default function WelcomePage() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = async () => {
    if (!auth || !firestore) return;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
      }, { merge: true });

      const profileRef = doc(firestore, 'profiles', user.uid);
      await setDoc(profileRef, {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email,
      }, { merge: true });


    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // User closed the popup, do nothing.
        return;
      }
      console.error('Error during sign-in:', error);
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="animate-spin text-accent size-12" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-background overflow-hidden">
        <AnimatedWelcomeBackground />
        <main className="flex-grow flex items-center justify-center p-4 z-10">
            <Card className="w-full max-w-md">
              <CardContent className="p-8">
                <div className="text-center space-y-8">
                    <Clover className="size-20 md:size-24 text-accent mx-auto" />
                    <div>
                        <h1 className="text-5xl md:text-6xl font-headline font-bold text-accent">
                            Clover AI
                        </h1>
                        <p className="text-base md:text-lg text-muted-foreground mt-2">
                            Your AI-powered guide to the world of books.
                        </p>
                    </div>
                    <Button onClick={handleSignIn} size="lg">
                        <LogIn className="mr-2" /> Sign In with Google to Continue
                    </Button>
                </div>
              </CardContent>
            </Card>
        </main>
    </div>
  );
}
