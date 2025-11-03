"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Book } from "lucide-react";
import type { Book as BookType } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const bookFormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  author: z.string().min(1, "Author is required."),
  description: z.string().min(1, "Description is required."),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

interface BookLibraryProps {
  books: BookType[];
  onAddBook: (book: Omit<BookType, "id">) => void;
}

export function BookLibrary({ books, onAddBook }: BookLibraryProps) {
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
    },
  });

  function onSubmit(data: BookFormValues) {
    onAddBook(data);
    form.reset();
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Book className="size-6" /> Your Book Library
        </CardTitle>
        <CardDescription>
          Add books to be used for recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="The Great Gatsby" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input placeholder="F. Scott Fitzgerald" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A novel about the American dream..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              <Plus className="mr-2 size-4" /> Add Book
            </Button>
          </form>
        </Form>

        {books.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium font-headline">Added Books</h3>
            <ScrollArea className="h-48 pr-4">
              <div className="space-y-2">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="p-3 border rounded-md bg-accent/50 text-sm"
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
