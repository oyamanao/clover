'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Book, Heart, Users, Lock } from "lucide-react";

export function BookListCard({ list }: { list: any }) {
    return (
         <Link href={`/book-lists/${list.id}`} className="block h-full">
            <Card className="hover:shadow-lg hover:border-accent/50 transition-all flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="font-headline">{list.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                        {list.isPublic ? <Users className="size-4" /> : <Lock className="size-4" />}
                        {list.isPublic ? 'Public List' : 'Private List'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground mb-4 line-clamp-2 h-10">{list.description}</p>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Book className="size-4"/>
                            <span>{list.books?.length || 0} {list.books?.length === 1 ? 'book' : 'books'}</span>
                        </div>
                         <div className="flex items-center gap-1">
                            <span>{list.likedBy?.length || 0}</span>
                            <Heart className="size-4"/>
                          </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
