"use client";

import { useState } from "react";
import { Plus, Book as BookIcon, Search, Loader2 } from "lucide-react";
import type { Book as BookType, BookSearchResult } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { searchBooks } from "@/ai/flows/search-books";
import { useToast } from "@/hooks/use-toast";

interface BookLibraryProps {
  books: BookType[];
  onAddBook: (book: Omit<BookType, "id">) => void;
}

export function BookLibrary({ books, onAddBook }: BookLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    try {
      const result = await searchBooks({ query: searchQuery });
      setSearchResults(result.books);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Failed to search for books. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="overflow-hidden mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <BookIcon className="size-6" /> Your Book Library
        </CardTitle>
        <CardDescription>
          Search for books to add to your reading history. The more books you
          add, the smarter the AI becomes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input
            placeholder="Search for a book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            suppressHydrationWarning
          />
          <Button type="submit" disabled={isSearching} size="icon" suppressHydrationWarning>
            {isSearching ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Search />
            )}
          </Button>
        </form>

        {isSearching && (
           <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Searching...</p>
           </div>
        )}
        
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium font-headline">Search Results</h3>
            <ScrollArea className="h-60 pr-4">
              <div className="space-y-2">
                {searchResults.map((book) => (
                  <div
                    key={book.title + book.author}
                    className="p-3 border rounded-md bg-muted/50 flex items-center justify-between gap-2"
                  >
                    <div className="flex-grow">
                      <p className="font-semibold">{book.title}</p>
                      <p className="text-sm text-muted-foreground">
                        by {book.author}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        onAddBook({
                          title: book.title,
                          author: book.author,
                          description: book.description,
                        })
                      }
                      suppressHydrationWarning
                    >
                      <Plus className="mr-2" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}


        {books.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium font-headline">Added Books</h3>
            <ScrollArea className="h-48 pr-4">
              <div className="space-y-2">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="p-3 border rounded-md bg-accent/20 text-sm"
                  >
                    <p className="font-semibold">{book.title}</p>
                    <p className="text-muted-foreground">by {book.author}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
