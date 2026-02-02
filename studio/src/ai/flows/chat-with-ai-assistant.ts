'use server';

/**
 * @fileOverview An AI assistant that allows users to chat and get suggestions for next actions,
 * create objects, and run reports.
 *
 * - chatWithAiAssistant - A function that handles the chat with AI assistant process.
 * - ChatWithAiAssistantInput - The input type for the chatWithAiAssistant function.
 * - ChatWithAiAssistantOutput - The return type for the chatWithAiAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatWithAiAssistantInputSchema = z.object({
  message: z.string().describe('The message from the user to the AI assistant.'),
  leadContext: z.string().optional().describe('The current lead context, if any.'),
});
export type ChatWithAiAssistantInput = z.infer<typeof ChatWithAiAssistantInputSchema>;

const ChatWithAiAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the user message.'),
});
export type ChatWithAiAssistantOutput = z.infer<typeof ChatWithAiAssistantOutputSchema>;

export async function chatWithAiAssistant(input: ChatWithAiAssistantInput): Promise<ChatWithAiAssistantOutput> {
  try {
    return await chatWithAiAssistantFlow(input);
  } catch (error) {
    console.error('Error in chatWithAiAssistant:', error);
    throw error;
  }
}

const prompt = ai.definePrompt({
  name: 'chatWithAiAssistantPrompt',
  input: { schema: ChatWithAiAssistantInputSchema },
  output: { schema: ChatWithAiAssistantOutputSchema },
  prompt: `You are an AI assistant helping sales representatives manage their work. You can provide suggestions for next actions on the current lead, create objects, and run reports.

  The user message is: {{{message}}}

  {% if leadContext %}
  The current lead context is: {{{leadContext}}}
  {% endif %}

  Respond in a helpful and informative manner.
  `,
});

const chatWithAiAssistantFlow = ai.defineFlow(
  {
    name: 'chatWithAiAssistantFlow',
    inputSchema: ChatWithAiAssistantInputSchema,
    outputSchema: ChatWithAiAssistantOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
