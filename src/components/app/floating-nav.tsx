
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
import { useFirebase } from '@/firebase';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function FloatingNav({ onHomepage }: { onHomepage: boolean }) {
  const { user, auth } = useFirebase();
  const router = useRouter();

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/welcome');
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "rounded-full h-12 w-12 bg-background/80 backdrop-blur-sm shadow-lg transition-all shadow-accent/50", 
                "hover:bg-accent/90",
                "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                )}
            >
              <Clover className="size-6" />
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
                  <span>Home</span>
                </DropdownMenuItem>
              </Link>
              <Link href={`/profile/${user.uid}`} passHref>
                <DropdownMenuItem>
                  <UserIcon className="mr-2" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/book-lists/new" passHref>
                <DropdownMenuItem>
                  <PlusCircle className="mr-2" />
                  <span>Create New List</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/recommendations" passHref>
                <DropdownMenuItem>
                  <Sparkles className="mr-2" />
                  <span>AI Recommendations</span>
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

      {onHomepage && (
        <div className="fixed top-4 right-4 z-50">
          <Link href={`/profile/${user.uid}`} passHref>
            <Avatar className="h-12 w-12 border-2 border-accent hover:border-primary transition-all shadow-lg">
              <AvatarImage
                src={user.photoURL || undefined}
                alt={user.displayName || 'User'}
              />
              <AvatarFallback>
                {user.displayName ? user.displayName.charAt(0) : <UserIcon />}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      )}
    </>
  );
}
