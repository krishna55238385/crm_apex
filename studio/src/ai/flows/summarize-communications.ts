'use server';

/**
 * @fileOverview Summarizes communications from various sources (email, WhatsApp, SMS, call logs).
 *
 * - summarizeCommunications - A function that handles the summarization process.
 * - SummarizeCommunicationsInput - The input type for the summarizeCommunications function.
 * - SummarizeCommunicationsOutput - The return type for the summarizeCommunications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCommunicationsInputSchema = z.object({
  communications: z
    .string()
    .describe(
      'A string containing the concatenated communications from email, WhatsApp, SMS, and call logs.'
    ),
});
export type SummarizeCommunicationsInput = z.infer<
  typeof SummarizeCommunicationsInputSchema
>;

const SummarizeCommunicationsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the key communication points.'),
});
export type SummarizeCommunicationsOutput = z.infer<
  typeof SummarizeCommunicationsOutputSchema
>;

export async function summarizeCommunications(
  input: SummarizeCommunicationsInput
): Promise<SummarizeCommunicationsOutput> {
  return summarizeCommunicationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCommunicationsPrompt',
  input: {schema: SummarizeCommunicationsInputSchema},
  output: {schema: SummarizeCommunicationsOutputSchema},
  prompt: `You are an AI assistant helping sales representatives quickly understand past conversations.

  Summarize the key communication points from the following logs:

  {{{communications}}}

  Provide a concise summary that captures the essence of the interactions.`,
});

const summarizeCommunicationsFlow = ai.defineFlow(
  {
    name: 'summarizeCommunicationsFlow',
    inputSchema: SummarizeCommunicationsInputSchema,
    outputSchema: SummarizeCommunicationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
