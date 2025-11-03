'use server';

/**
 * @fileOverview Summarizes book details for quick scanning in the recommendation chatbot.
 *
 * - summarizeBookDetails - A function that summarizes the book details.
 * - SummarizeBookDetailsInput - The input type for the summarizeBookDetails function.
 * - SummarizeBookDetailsOutput - The return type for the summarizeBookDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeBookDetailsInputSchema = z.object({
  title: z.string().describe('The title of the book.'),
  author: z.string().describe('The author of the book.'),
  description: z.string().describe('A detailed description of the book.'),
});
export type SummarizeBookDetailsInput = z.infer<typeof SummarizeBookDetailsInputSchema>;

const SummarizeBookDetailsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the book details.'),
});
export type SummarizeBookDetailsOutput = z.infer<typeof SummarizeBookDetailsOutputSchema>;

export async function summarizeBookDetails(input: SummarizeBookDetailsInput): Promise<SummarizeBookDetailsOutput> {
  return summarizeBookDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeBookDetailsPrompt',
  input: {schema: SummarizeBookDetailsInputSchema},
  output: {schema: SummarizeBookDetailsOutputSchema},
  prompt: `Summarize the following book details in a concise and informative way for a user who wants a quick overview:\n\nTitle: {{{title}}}\nAuthor: {{{author}}}\nDescription: {{{description}}}`,
});

const summarizeBookDetailsFlow = ai.defineFlow(
  {
    name: 'summarizeBookDetailsFlow',
    inputSchema: SummarizeBookDetailsInputSchema,
    outputSchema: SummarizeBookDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
