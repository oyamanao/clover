'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized book recommendations based on user preferences and reading history.
 *
 * The flow takes user preferences as input and returns a list of book recommendations.
 * It uses a large language model to analyze the user's preferences and generate relevant recommendations.
 *
 * @interface GenerateBookRecommendationsInput - Defines the input schema for the generateBookRecommendations function.
 * @interface GenerateBookRecommendationsOutput - Defines the output schema for the generateBookRecommendations function.
 * @function generateBookRecommendations - The main function that triggers the book recommendation flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBookRecommendationsInputSchema = z.object({
  preferences: z
    .string()
    .describe(
      'A detailed description of the user’s reading preferences, including preferred genres, authors, topics, and any previous books they have enjoyed.  The more detail, the better the recommendations will be.'
    ),
});
export type GenerateBookRecommendationsInput = z.infer<typeof GenerateBookRecommendationsInputSchema>;

const RecommendedBookSchema = z.object({
  title: z.string().describe('The title of the book.'),
  author: z.string().describe('The author of the book.'),
  description: z.string().describe('A brief, compelling reason why this book is a good match for the user\'s preferences.'),
  imageUrl: z.string().url().describe('A URL for the book cover image.'),
  averageRating: z.number().describe('The average rating of the book (out of 5).'),
  pageCount: z.number().describe('The number of pages in the book.'),
  publisher: z.string().describe('The publisher of the book.'),
  language: z.string().describe('The two-letter language code for the book (e.g., "en").'),
});

const GenerateBookRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(RecommendedBookSchema)
    .describe('A list of 3-5 book recommendations based on the user’s preferences.'),
});
export type GenerateBookRecommendationsOutput = z.infer<typeof GenerateBookRecommendationsOutputSchema>;

export async function generateBookRecommendations(
  input: GenerateBookRecommendationsInput
): Promise<GenerateBookRecommendationsOutput> {
  return generateBookRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBookRecommendationsPrompt',
  input: {schema: GenerateBookRecommendationsInputSchema},
  output: {schema: GenerateBookRecommendationsOutputSchema},
  prompt: `You are a book recommendation expert. A user will provide their reading preferences and you will give them a list of 3-5 books that they might enjoy. 

For each book, you MUST provide all the required fields in the output schema. Only return real books.

User Preferences: {{{preferences}}}
`,
});

const generateBookRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateBookRecommendationsFlow',
    inputSchema: GenerateBookRecommendationsInputSchema,
    outputSchema: GenerateBookRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
