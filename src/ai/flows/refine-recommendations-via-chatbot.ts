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
  bookDetails: z.string().describe('Details of the previously added books in the user\'s library.'),
  userPreferences: z.string().describe('The user\'s stated preferences and reading history summary.'),
  chatHistory: z.string().describe('The history of the conversation with the chatbot.'),
  userInput: z.string().describe('The latest user input to the chatbot.'),
  currentRecommendations: z.string().describe('The list of recommendations currently displayed to the user.')
});
export type RefineRecommendationsViaChatbotInput = z.infer<typeof RefineRecommendationsViaChatbotInputSchema>;

const RefineRecommendationsViaChatbotOutputSchema = z.object({
  refinedRecommendations: z.string().optional().describe('Updated list of book recommendations based on the conversation. Only include this if the user asks for new or different recommendations.'),
  chatbotResponse: z.string().describe('The chatbot\'s conversational response to the user. This should be friendly and helpful.'),
});
export type RefineRecommendationsViaChatbotOutput = z.infer<typeof RefineRecommendationsViaChatbotOutputSchema>;

export async function refineRecommendationsViaChatbot(input: RefineRecommendationsViaChatbotInput): Promise<RefineRecommendationsViaChatbotOutput> {
  return refineRecommendationsViaChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineRecommendationsViaChatbotPrompt',
  input: {schema: RefineRecommendationsViaChatbotInputSchema},
  output: {schema: RefineRecommendationsViaChatbotOutputSchema},
  prompt: `You are a friendly and expert book recommendation chatbot. Your goal is to help a user discover books they will love.

Here is the context for your conversation:
- User's Library: {{{bookDetails}}}
- User's Preferences: {{{userPreferences}}}
- Current Recommendations: {{{currentRecommendations}}}
- Conversation History: {{{chatHistory}}}

The user has just said: "{{{userInput}}}"

Your task is to provide a helpful, conversational response. Analyze the user's input and the chat history to understand their intent.

- If the user is asking for different recommendations, asking to refine them, or expressing dissatisfaction, generate a new list of recommendations.
- If the user is asking a question about a specific book, or a general question, answer it to the best of your ability without generating new recommendations.
- If the user is just chatting, respond conversationally.

Keep your response concise and friendly. If you generate new recommendations, present them clearly. If not, just provide the chat response.`,
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
