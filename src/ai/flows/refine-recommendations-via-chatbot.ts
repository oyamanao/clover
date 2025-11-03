'use server';

/**
 * @fileOverview A chatbot flow that refines book recommendations based on user feedback.
 *
 * - refineRecommendationsViaChatbot - A function that handles the chatbot interaction to refine recommendations.
 * - RefineRecommendationsViaChatbotInput - The input type for the refineRecommendationsViaChatbot function.
 * - RefineRecommendationsViaChatbotOutput - The return type for the refineRecommendationsViaChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineRecommendationsViaChatbotInputSchema = z.object({
  bookDetails: z.string().describe('Details of the previously added books.'),
  userPreferences: z.string().describe('User preferences and reading history.'),
  chatHistory: z.string().describe('The history of the conversation with the chatbot.'),
  userInput: z.string().describe('The latest user input to the chatbot.'),
});
export type RefineRecommendationsViaChatbotInput = z.infer<typeof RefineRecommendationsViaChatbotInputSchema>;

const RefineRecommendationsViaChatbotOutputSchema = z.object({
  refinedRecommendations: z.string().describe('Refined book recommendations based on user feedback.'),
  chatbotResponse: z.string().describe('The chatbot response to the user input.'),
});
export type RefineRecommendationsViaChatbotOutput = z.infer<typeof RefineRecommendationsViaChatbotOutputSchema>;

export async function refineRecommendationsViaChatbot(input: RefineRecommendationsViaChatbotInput): Promise<RefineRecommendationsViaChatbotOutput> {
  return refineRecommendationsViaChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineRecommendationsViaChatbotPrompt',
  input: {schema: RefineRecommendationsViaChatbotInputSchema},
  output: {schema: RefineRecommendationsViaChatbotOutputSchema},
  prompt: `You are a book recommendation chatbot.  You have access to the following book details: {{{bookDetails}}}. The user has the following preferences: {{{userPreferences}}}. This is the chat history: {{{chatHistory}}}. The user has just said: {{{userInput}}}. Based on all of this, generate refined book recommendations and respond to the user.

Refined Recommendations: {{refinedRecommendations}}
Chatbot Response: {{chatbotResponse}}`,
});

const refineRecommendationsViaChatbotFlow = ai.defineFlow(
  {
    name: 'refineRecommendationsViaChatbotFlow',
    inputSchema: RefineRecommendationsViaChatbotInputSchema,
    outputSchema: RefineRecommendationsViaChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
