// src/ai/flows/generate-follow-up-suggestions.ts
'use server';
/**
 * @fileOverview Generates follow-up email and call scripts based on lead profile, past interactions, and deal stage.
 *
 * - generateFollowUpSuggestions - A function that generates follow-up suggestions.
 * - GenerateFollowUpSuggestionsInput - The input type for the generateFollowUpSuggestions function.
 * - GenerateFollowUpSuggestionsOutput - The return type for the generateFollowUpSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFollowUpSuggestionsInputSchema = z.object({
  leadProfile: z.string().describe('Detailed profile of the lead, including contact information, company details, and key interests.'),
  pastInteractions: z.string().describe('Summary of past interactions with the lead, including emails, calls, and meetings.'),
  dealStage: z.string().describe('Current stage of the deal (e.g., Prospecting, Qualification, Proposal, Negotiation, Closed).'),
  productOrService: z.string().describe('The product or service being offered to the lead.'),
  salesRepName: z.string().describe('Name of the sales representative.'),
});
export type GenerateFollowUpSuggestionsInput = z.infer<typeof GenerateFollowUpSuggestionsInputSchema>;

const GenerateFollowUpSuggestionsOutputSchema = z.object({
  emailSuggestion: z.string().describe('Suggested email content for the follow-up.'),
  callScriptSuggestion: z.string().describe('Suggested call script for the follow-up.'),
});
export type GenerateFollowUpSuggestionsOutput = z.infer<typeof GenerateFollowUpSuggestionsOutputSchema>;

export async function generateFollowUpSuggestions(input: GenerateFollowUpSuggestionsInput): Promise<GenerateFollowUpSuggestionsOutput> {
  return generateFollowUpSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFollowUpSuggestionsPrompt',
  input: {schema: GenerateFollowUpSuggestionsInputSchema},
  output: {schema: GenerateFollowUpSuggestionsOutputSchema},
  prompt: `You are an AI assistant helping sales representatives generate effective follow-up strategies.

  Based on the lead's profile, past interactions, and deal stage, provide tailored email and call script suggestions.

  Lead Profile: {{{leadProfile}}}
  Past Interactions: {{{pastInteractions}}}
  Deal Stage: {{{dealStage}}}
  Product/Service: {{{productOrService}}}
  Sales Rep Name: {{{salesRepName}}}

  Instructions:
  1.  Analyze the provided information to understand the lead's needs and interests.
  2.  Craft a personalized email suggestion that addresses the lead's specific situation and offers value.
  3.  Develop a call script suggestion that helps the sales representative engage the lead effectively and move the deal forward.
  4. Make sure the email is signed by the sales rep.
  5. Suggest a clear next action for the sales rep.
  `, 
});

const generateFollowUpSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateFollowUpSuggestionsFlow',
    inputSchema: GenerateFollowUpSuggestionsInputSchema,
    outputSchema: GenerateFollowUpSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
