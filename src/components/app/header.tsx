'use client';

import { Clover, PlusCircle } from "lucide-react";
import { UserNav } from "@/components/app/user-nav";
import { Button } from "../ui/button";
import { useFirebase } from "@/firebase";
import Link from "next/link";

export function Header() {
  const { user } = useFirebase();
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clover className="size-8 text-accent" />
          <div>
            <h1 className="text-3xl font-headline font-bold text-accent leading-none">
              Clover AI
            </h1>
            <p className="text-sm text-muted-foreground">Your AI-powered guide to the world of books.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <Link href="/book-lists/new" passHref>
              <Button variant="outline">
                <PlusCircle className="mr-2" />
                Create new list
              </Button>
            </Link>
          )}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
