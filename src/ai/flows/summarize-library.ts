'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing a user's book library to infer their reading preferences.
 *
 * The flow takes a list of book titles and authors and returns a summary of the user's likely preferences.
 *
 * @interface SummarizeLibraryInput - Defines the input schema for the summarizeLibrary function.
 * @interface SummarizeLibraryOutput - Defines the output schema for the summarizeLibrary function.
 * @function summarizeLibrary - The main function that triggers the library summarization flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeLibraryInputSchema = z.object({
  books: z.string().describe('A list of book titles and authors from the user’s library, separated by newlines.'),
});
export type SummarizeLibraryInput = z.infer<typeof SummarizeLibraryInputSchema>;

const SummarizeLibraryOutputSchema = z.object({
    summary: z.string().describe("A single, concise sentence summarizing the user's overall reading taste."),
    genres: z.array(z.string()).describe('A list of the most likely preferred genres.'),
    themes: z.array(z.string()).describe('A list of common themes or topics the user seems to enjoy.'),
});
export type SummarizeLibraryOutput = z.infer<typeof SummarizeLibraryOutputSchema>;


export async function summarizeLibrary(input: SummarizeLibraryInput): Promise<SummarizeLibraryOutput> {
  return summarizeLibraryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLibraryPrompt',
  input: { schema: SummarizeLibraryInputSchema },
  output: { schema: SummarizeLibraryOutputSchema },
  prompt: `You are an expert literary analyst. Based on the following list of books from a user's library, infer their reading preferences. 

- Provide a single, concise sentence that summarizes their overall taste.
- Identify a list of their most likely preferred genres.
- Identify a list of common themes or topics.

User's Library:
{{{books}}}

Respond in the requested structured format.`,
});

const summarizeLibraryFlow = ai.defineFlow(
  {
    name: 'summarizeLibraryFlow',
    inputSchema: SummarizeLibraryInputSchema,
    outputSchema: SummarizeLibraryOutputSchema,
  },
  async (input) => {
    if (!input.books.trim()) {
        return { summary: "", genres: [], themes: [] };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
