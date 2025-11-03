'use client';

import { Clover, PlusCircle, Sparkles } from "lucide-react";
import { UserNav } from "@/components/app/user-nav";
import { Button } from "../ui/button";
import { useFirebase } from "@/firebase";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const { user } = useFirebase();
  const pathname = usePathname();

  // Only show the full header on the homepage
  if (pathname !== '/') {
    return null;
  }

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Clover className="size-8 text-accent" />
          <div>
            <h1 className="text-3xl font-headline font-bold text-accent leading-none">
              Clover AI
            </h1>
            <p className="text-sm text-muted-foreground">Your AI-powered guide to the world of books.</p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <Link href="/recommendations" passHref>
                <Button variant={pathname === '/recommendations' ? 'default' : 'ghost'}>
                  <Sparkles className="mr-2" />
                  AI Recommendations
                </Button>
              </Link>
              <Link href="/book-lists/new" passHref>
                <Button variant="outline">
                  <PlusCircle className="mr-2" />
                  Create new list
                </Button>
              </Link>
            </>
          )}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
