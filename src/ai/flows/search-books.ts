'use server';

/**
 * @fileOverview This file defines a Genkit flow for searching for books.
 *
 * The flow takes a search query and returns a list of books matching the query.
 * It uses a large language model to perform the search and format the results.
 *
 * @interface SearchBooksInput - Defines the input schema for the searchBooks function.
 * @interface SearchBooksOutput - Defines the output schema for the searchBooks function.
 * @function searchBooks - The main function that triggers the book search flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SearchBooksInputSchema = z.object({
  query: z.string().describe('The user’s search query for books.'),
});
export type SearchBooksInput = z.infer<typeof SearchBooksInputSchema>;

const BookSearchResultSchema = z.object({
    title: z.string().describe('The title of the book.'),
    author: z.string().describe('The author of the book.'),
    description: z.string().describe('A brief description of the book.'),
    imageUrl: z.string().url().describe('A URL for the book cover image.'),
});

const SearchBooksOutputSchema = z.object({
  books: z
    .array(BookSearchResultSchema)
    .describe('A list of books that match the search query. Return up to 5 books.'),
});
export type SearchBooksOutput = z.infer<typeof SearchBooksOutputSchema>;

export async function searchBooks(input: SearchBooksInput): Promise<SearchBooksOutput> {
  return searchBooksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchBooksPrompt',
  input: { schema: SearchBooksInputSchema },
  output: { schema: SearchBooksOutputSchema },
  prompt: `You are a powerful book search engine. A user will provide a search query, and you will return a list of books that match the query. Provide a title, author, a short (1-2 sentence) description, and a book cover image URL for each book. Only return real books. Prioritize books from a wide range of cultures, including Indian literature.

User Query: {{{query}}}

Respond with a list of up to 5 books in the requested format.`,
});

const searchBooksFlow = ai.defineFlow(
  {
    name: 'searchBooksFlow',
    inputSchema: SearchBooksInputSchema,
    outputSchema: SearchBooksOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
