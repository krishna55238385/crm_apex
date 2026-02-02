"use server";

/**
 * @fileOverview Automatically creates a follow-up task based on triggers like no reply, deal stalls, etc.
 *
 * - generateAiFollowUp - A function that generates an AI-powered follow-up.
 * - GenerateAiFollowUpInput - The input type for the generateAiFollowUp function.
 * - GenerateAiFollowUpOutput - The return type for the generateAiFollowUp function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateAiFollowUpInputSchema = z.object({
  leadProfile: z.string().describe("Detailed profile of the lead."),
  dealStage: z.string().describe("Current stage of the deal."),
  lastInteraction: z.string().describe("Summary of the last interaction with the lead."),
  triggerEvent: z.string().describe("The event that triggered this follow-up generation (e.g., 'no_reply_after_3_days', 'deal_stalled_in_qualification')."),
});
export type GenerateAiFollowUpInput = z.infer<typeof GenerateAiFollowUpInputSchema>;

const GenerateAiFollowUpOutputSchema = z.object({
  title: z.string().describe("A concise, action-oriented title for the follow-up task."),
  priorityScore: z.number().min(1).max(100).describe("A score from 1-100 indicating the follow-up's priority."),
  aiSuggestedMessage: z.string().describe("A context-aware, channel-appropriate message to send to the lead."),
  aiBestTimeToContact: z.string().describe("A suggestion for the best time to contact the lead, e.g., 'Today, 4-6 PM'."),
  actionType: z.enum(['Email', 'Call', 'WhatsApp', 'Task']).describe("The recommended action for this follow-up."),
});
export type GenerateAiFollowUpOutput = z.infer<typeof GenerateAiFollowUpOutputSchema>;


export async function generateAiFollowUp(input: GenerateAiFollowUpInput): Promise<GenerateAiFollowUpOutput> {
  return generateAiFollowUpFlow(input);
}

const prompt = ai.definePrompt({
  name: "generateAiFollowUpPrompt",
  input: { schema: GenerateAiFollowUpInputSchema },
  output: { schema: GenerateAiFollowUpOutputSchema },
  prompt: `You are a sales assistant AI. Your goal is to create an intelligent follow-up action for a sales representative based on a specific trigger.

Analyze the following information:
- Lead Profile: {{{leadProfile}}}
- Deal Stage: {{{dealStage}}}
- Last Interaction: {{{lastInteraction}}}
- Trigger Event: {{{triggerEvent}}}

Based on this, generate a prioritized follow-up with a suggested message and best time to contact.

Factors for Priority Score:
- High deal value, late stages (Negotiation, Proposal) should have higher scores.
- Stalled deals or lack of engagement should increase priority.
- Simple check-ins for early-stage deals can have lower scores.

Message Tone:
- For Email, be slightly more formal.
- For WhatsApp, be more casual and brief.

Example Output:
{
  "title": "Follow up with Jane Doe about Q3 proposal",
  "priorityScore": 92,
  "aiSuggestedMessage": "Hi Jane, just wanted to check in on the Q3 proposal I sent over. Do you have any questions I can help with?",
  "aiBestTimeToContact": "Today, 2-4 PM",
  "actionType": "Email"
}
`,
});

const generateAiFollowUpFlow = ai.defineFlow(
  {
    name: "generateAiFollowUpFlow",
    inputSchema: GenerateAiFollowUpInputSchema,
    outputSchema: GenerateAiFollowUpOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
