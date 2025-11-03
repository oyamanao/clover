'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { searchBooks } from '@/ai/flows/search-books';
import type { BookSearchResult, Book } from '@/lib/types';
import { Loader2, Plus, Search, Trash2, XCircle, Book as BookIcon, BookImage } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Header } from '@/components/app/header';
import { BookCover } from '@/components/app/book-cover';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function NewBookListPage() {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const [listName, setListName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleAddBook = (book: BookSearchResult) => {
     if (books.find((b) => b.title === book.title && b.author === book.author)) {
      toast({
        variant: "destructive",
        title: "Book Already Added",
        description: `"${book.title}" is already in this list.`,
      });
      return;
    }
    setBooks((prev) => [...prev, { ...book, id: Date.now() }]);
  }

  const handleRemoveBook = (bookId: number) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
  }

  const handleSaveList = async () => {
    if (!listName.trim()) {
      toast({ variant: 'destructive', title: 'List name is required.' });
      return;
    }
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'You must be logged in.' });
      return;
    }
    setIsSaving(true);
    
    const collectionPath = isPublic ? 'public_book_lists' : `users/${user.uid}/book_lists`;
    const bookListData = {
      name: listName,
      description,
      isPublic,
      userId: user.uid,
      userName: user.displayName,
      userPhotoURL: user.photoURL,
      books: books.map(({ id, ...rest }) => rest), // Remove temp id
      createdAt: serverTimestamp(),
      likedBy: [],
    };

    const collectionRef = collection(firestore, collectionPath);

    addDoc(collectionRef, bookListData)
      .then((docRef) => {
        toast({ title: 'Book list created!', description: `"${listName}" has been saved.` });
        router.push(`/profile/${user.uid}`);
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'create',
          requestResourceData: bookListData,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSaving(false);
      });
  };
  
  if (!user) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="animate-spin text-accent size-12" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Create a New Book List</CardTitle>
                    <CardDescription>Give your list a name and add some books.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="list-name">List Name</Label>
                            <Input id="list-name" value={listName} onChange={(e) => setListName(e.target.value)} placeholder="e.g., Summer Reading, Sci-Fi Classics" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="list-description">Description</Label>
                            <Textarea id="list-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short description of what this list is about." />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <Switch id="public-switch" checked={isPublic} onCheckedChange={setIsPublic} />
                            <Label htmlFor="public-switch">Make this list public</Label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
                        {/* Search Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium font-headline">Find Books</h3>
                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <Input
                                placeholder="Search for a book to add..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button type="submit" disabled={isSearching} size="icon">
                                {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
                                </Button>
                            </form>

                            {(isSearching || searchResults.length > 0) && (
                                <div className="space-y-4">
                                <h3 className="text-base font-medium font-headline">Search Results</h3>
                                {isSearching && <p className="text-sm text-muted-foreground">Searching...</p>}
                                <ScrollArea className="h-60 pr-4">
                                    <div className="space-y-2">
                                    {searchResults.map((book) => (
                                        <div
                                        key={book.title + book.author}
                                        className="p-3 border rounded-md bg-muted/50 flex items-start gap-4"
                                        >
                                            <BookCover src={book.imageUrl} alt={`Cover of ${book.title}`} width={64} height={96} className="rounded-md" />
                                            <div className="flex-grow">
                                                <p className="font-semibold">{book.title}</p>
                                                <p className="text-sm text-muted-foreground">by {book.author}</p>
                                                <Button size="sm" onClick={() => handleAddBook(book)} className="mt-2">
                                                    <Plus className="mr-2" /> Add to list
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                </ScrollArea>
                                </div>
                            )}
                        </div>

                        {/* Added Books Section */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium font-headline">Books in this list ({books.length})</h3>
                                {books.length > 0 && (
                                    <Button variant="outline" size="sm" onClick={() => setBooks([])}>
                                        <XCircle className="mr-2" /> Clear all
                                    </Button>
                                )}
                            </div>
                            {books.length > 0 ? (
                                <ScrollArea className="h-[21rem] pr-4">
                                <div className="space-y-2">
                                    {books.map((book) => (
                                    <div key={book.id} className="p-3 border rounded-md bg-accent/20 text-sm flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <BookCover src={book.imageUrl} alt={`Cover of ${book.title}`} width={40} height={60} className="rounded" />
                                            <div>
                                                <p className="font-semibold">{book.title}</p>
                                                <p className="text-muted-foreground">by {book.author}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveBook(book.id)} aria-label={`Remove ${book.title}`}>
                                            <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                                        </Button>
                                    </div>
                                    ))}
                                </div>
                                </ScrollArea>
                            ) : (
                                <div className="h-[21rem] flex flex-col items-center justify-center text-center rounded-lg border-2 border-dashed border-muted-foreground/30">
                                    <BookIcon className="size-10 text-muted-foreground/50 mb-2"/>
                                    <p className="text-muted-foreground">No books added yet.</p>
                                    <p className="text-sm text-muted-foreground/80">Use the search to find and add books.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveList} disabled={isSaving} className="ml-auto" size="lg">
                        {isSaving ? <Loader2 className="mr-2 animate-spin" /> : null}
                        {isSaving ? 'Saving...' : 'Save Book List'}
                    </Button>
                </CardFooter>
            </Card>
        </main>
    </div>
  );
}
