
'use client';

import {
  Clover,
  LogOut,
  PlusCircle,
  Sparkles,
  User as UserIcon,
  Home,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useFirebase } from '@/firebase';
import Link from 'next/link';
import { signOut } from 'firebase/auth';

export function FloatingNav() {
  const { user, auth } = useFirebase();

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12 bg-background/80 backdrop-blur-sm shadow-lg hover:bg-accent/90">
            <Clover className="size-6 text-accent" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" forceMount>
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
             <Link href="/" passHref>
              <DropdownMenuItem>
                <Home className="mr-2" />
                <span>Home &amp; Public Lists</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/book-lists/new" passHref>
              <DropdownMenuItem>
                <PlusCircle className="mr-2" />
                <span>Create new list</span>
              </DropdownMenuItem>
            </Link>
             <Link href="/recommendations" passHref>
               <DropdownMenuItem>
                  <Sparkles className="mr-2" />
                  <span>AI Recommendations</span>
                </DropdownMenuItem>
            </Link>
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
    </div>
  );
}
