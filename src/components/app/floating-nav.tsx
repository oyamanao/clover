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


export function FloatingNav() {
  const { user } = useFirebase();

  if (!user) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50">
       <Link href={`/profile/${user.uid}`} passHref>
          <Avatar className="h-12 w-12 border-2 border-accent hover:border-primary transition-all shadow-lg">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
            <AvatarFallback>
              {user.displayName ? user.displayName.charAt(0) : <UserIcon />}
            </AvatarFallback>
          </Avatar>
       </Link>
    </div>
  );
}
