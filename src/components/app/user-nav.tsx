
'use client';

import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { useFirebase } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';

export function UserNav() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const googleProvider = new GoogleAuthProvider();

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

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  if (isUserLoading) {
    return <Loader2 className="animate-spin" />;
  }

  if (!user) {
    return (
      <Button onClick={handleSignIn} variant="outline">
        <LogIn className="mr-2" /> Sign In with Google
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user.photoURL || undefined}
              alt={user.displayName || 'User'}
            />
            <AvatarFallback>
              {user.displayName
                ? user.displayName.charAt(0)
                : <UserIcon />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={`/profile/${user.uid}`} passHref>
            <DropdownMenuItem>
              <UserIcon className="mr-2" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
