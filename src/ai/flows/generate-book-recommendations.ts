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

const GenerateBookRecommendationsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('A list of book recommendations based on the user’s preferences.'),
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
  prompt: `You are a book recommendation expert. A user will provide their reading preferences and you will give them a list of books that they might enjoy.  Make sure to explain why each book is recommended based on the user's stated preferences.

User Preferences: {{{preferences}}}

Recommendations:`, // Changed to Recommendations
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
