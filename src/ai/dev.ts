import { config } from 'dotenv';
config();

import '@/ai/flows/refine-recommendations-via-chatbot.ts';
import '@/ai/flows/generate-book-recommendations.ts';
import '@/ai/flows/summarize-book-details.ts';
import '@/ai/flows/search-books.ts';
