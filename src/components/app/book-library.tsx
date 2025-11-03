
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Plus, Book as BookIcon, Search, Loader2, Trash2, XCircle, ArrowRight, BookImage, ChevronDown, Library, PlusCircle, Check } from "lucide-react";
import type { Book as BookType, BookSearchResult } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { searchBooks } from "@/ai/flows/search-books";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BookCover } from "./book-cover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";


interface BookLibraryProps {
  books: BookType[];
  onAddBook: (book: Omit<BookType, "id">) => void;
  onAddMultipleBooks: (books: Omit<BookType, 'id'>[]) => void;
  onRemoveBook: (bookId: number) => void;
  onClearLibrary: () => void;
  onNext: () => void;
}

function AddFromListDialog({ onAddBooks }: { onAddBooks: (books: Omit<BookType, 'id'>[]) => void }) {
    const { firestore, user } = useFirebase();
    const [selectedListId, setSelectedListId] = useState<string | null>(null);

    const privateListsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, `users/${user.uid}/book_lists`));
    }, [firestore, user]);

    const publicListsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'public_book_lists'), where('userId', '==', user.uid));
    }, [firestore, user]);
    
    const { data: privateLists, isLoading: isLoadingPrivate } = useCollection(privateListsQuery);
    const { data: publicLists, isLoading: isLoadingPublic } = useCollection(publicListsQuery);

    const bookLists = useMemo(() => {
        const lists = publicLists ? [...publicLists] : [];
        if (privateLists) {
            lists.push(...privateLists);
        }
        return lists.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }, [privateLists, publicLists]);

    const isLoading = isLoadingPrivate || isLoadingPublic;

    const selectedList = bookLists.find(list => list.id === selectedListId);

    const handleAddBooks = () => {
        if (selectedList && selectedList.books) {
            onAddBooks(selectedList.books);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline"><Library className="mr-2" /> Add from My Lists</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Books from a List</DialogTitle>
                    <DialogDescription>
                        Select one of your existing lists to add its books to your library.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="animate-spin text-muted-foreground" />
                        </div>
                    ) : bookLists.length > 0 ? (
                        <ScrollArea className="h-60 pr-4">
                            <RadioGroup onValueChange={setSelectedListId} value={selectedListId || undefined}>
                                <div className="space-y-2">
                                {bookLists.map(list => (
                                    <Label 
                                        key={list.id} 
                                        htmlFor={list.id}
                                        className={cn(
                                            "flex items-center gap-4 p-3 rounded-md border transition-colors cursor-pointer",
                                            selectedListId === list.id ? "bg-accent/20 border-accent" : "hover:bg-muted/50"
                                        )}
                                    >
                                        <RadioGroupItem value={list.id} id={list.id} />
                                        <div className="flex-grow">
                                            <p className="font-semibold">{list.name}</p>
                                            <p className="text-sm text-muted-foreground">{list.books?.length || 0} books - {list.isPublic ? 'Public' : 'Private'}</p>
                                        </div>
                                    </Label>
                                ))}
                                </div>
                            </RadioGroup>
                        </ScrollArea>
                    ) : (
                        <div className="text-center text-muted-foreground h-40 flex items-center justify-center">
                            <p>You don&apos;t have any book lists yet.</p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Cancel
                        </Button>
                    </DialogClose>
                     <DialogClose asChild>
                        <Button onClick={handleAddBooks} disabled={!selectedListId}>
                            <PlusCircle className="mr-2" /> Add Books
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function BookLibrary({ books, onAddBook, onAddMultipleBooks, onRemoveBook, onClearLibrary, onNext }: BookLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


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

  const handleSaveAsList = () => {
    localStorage.setItem('books-for-new-list', JSON.stringify(books));
    router.push('/book-lists/new');
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
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium font-headline">Find Books</h3>
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                placeholder="Search for a book..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                suppressHydrationWarning
                />
                <Button type="submit" disabled={isSearching} size="icon">
                {isSearching ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <Search />
                )}
                </Button>
            </form>
             <AddFromListDialog onAddBooks={onAddMultipleBooks} />
          </div>


          {(isSearching || searchResults.length > 0) && (
            <div className="space-y-4">
              <h3 className="text-base font-medium font-headline">Search Results</h3>
               {isSearching && <p className="text-sm text-muted-foreground">Searching...</p>}
              <ScrollArea className="h-60 pr-4">
                <div className="space-y-2">
                  {searchResults.map((book) => {
                    const isAdded = books.some(b => b.title === book.title && b.author === book.author);
                    return (
                    <div
                      key={book.title + book.author}
                      className="p-3 border rounded-md bg-muted/50 flex items-start gap-4"
                    >
                      <BookCover 
                        src={book.imageUrl} 
                        alt={`Cover of ${book.title}`}
                        width={64}
                        height={96}
                        className="rounded-md"
                      />
                      <div className="flex-grow">
                        <p className="font-semibold">{book.title}</p>
                        <p className="text-sm text-muted-foreground">
                          by {book.author}
                        </p>
                         {isAdded ? (
                            <Button size="sm" disabled className="mt-2">
                                <Check className="mr-2" /> Added
                            </Button>
                        ) : (
                            <Button
                            size="sm"
                            onClick={() =>
                                onAddBook({
                                title: book.title,
                                author: book.author,
                                description: book.description,
                                imageUrl: book.imageUrl
                                })
                            }
                            className="mt-2"
                            >
                            <Plus className="mr-2" /> Add
                            </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="space-y-6 md:border-l md:pl-8">
           <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium font-headline">Added Books ({books.length})</h3>
               {books.length > 0 && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <XCircle className="mr-2" /> Clear Library
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove all books from your library.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onClearLibrary}>
                          Clear Library
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
               )}
            </div>
          {books.length > 0 ? (
            <ScrollArea className="h-[21rem] pr-4">
              <div className="space-y-2">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="p-3 border rounded-md bg-accent/20 text-sm flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                       <BookCover
                        src={book.imageUrl} 
                        alt={`Cover of ${book.title}`}
                        width={40}
                        height={60}
                        className="rounded"
                      />
                      <div>
                        <p className="font-semibold">{book.title}</p>
                        <p className="text-muted-foreground">by {book.author}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveBook(book.id)}
                      aria-label={`Remove ${book.title}`}
                    >
                      <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-[21rem] flex flex-col items-center justify-center text-center rounded-lg border-2 border-dashed border-muted-foreground/30">
                <BookIcon className="size-10 text-muted-foreground/50 mb-2"/>
                <p className="text-muted-foreground">Your library is empty.</p>
                <p className="text-sm text-muted-foreground/80">Search for books to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
       {books.length > 0 && (
        <CardFooter className="border-t pt-6 mt-8 justify-end">
          <div className="flex rounded-md">
            <Button onClick={onNext} className="rounded-r-none">
              Next: Set Preferences <ArrowRight className="ml-2" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="rounded-l-none border-l">
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSaveAsList}>
                  Save as Book List
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

    