'use server';
/**
 * @fileOverview Generates performance insights based on attendance and CRM activity data.
 *
 * - generatePerformanceInsight - A function that generates a performance insight.
 * - GeneratePerformanceInsightInput - The input type for the function.
 * - GeneratePerformanceInsightOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePerformanceInsightInputSchema = z.object({
  attendanceSummary: z.object({
    daysPresent: z.number(),
    absences: z.number(),
    lateArrivals: z.number(),
    averageHours: z.number(),
  }),
  performanceSignals: z.object({
    tasksCompleted: z.number(),
    followUpsCompleted: z.number(),
    dealsProgressed: z.number(),
    missedFollowUps: z.number(),
  }),
  userName: z.string(),
});
export type GeneratePerformanceInsightInput = z.infer<typeof GeneratePerformanceInsightInputSchema>;

const GeneratePerformanceInsightOutputSchema = z.object({
  insight: z.string().describe('A non-judgmental, action-oriented insight about the employee\'s performance and attendance correlation.'),
  burnoutRisk: z.enum(['Low', 'Medium', 'High']).describe('An assessment of the potential burnout risk based on the data.'),
});
export type GeneratePerformanceInsightOutput = z.infer<typeof GeneratePerformanceInsightOutputSchema>;

export async function generatePerformanceInsight(input: GeneratePerformanceInsightInput): Promise<GeneratePerformanceInsightOutput> {
  return generatePerformanceInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePerformanceInsightPrompt',
  input: { schema: GeneratePerformanceInsightInputSchema },
  output: { schema: GeneratePerformanceInsightOutputSchema },
  prompt: `You are an expert HR analyst and productivity coach. Your goal is to identify correlations between an employee's attendance and their performance in a CRM, providing a helpful, non-judgmental insight.

Analyze the following data for employee: {{{userName}}}

Attendance Summary:
- Days Present (this month): {{{attendanceSummary.daysPresent}}}
- Absences (this month): {{{attendanceSummary.absences}}}
- Late Arrivals (this month): {{{attendanceSummary.lateArrivals}}}
- Average Working Hours: {{{attendanceSummary.averageHours}}}

Performance Signals:
- Tasks Completed: {{{performanceSignals.tasksCompleted}}}
- Follow-ups Completed: {{{performanceSignals.followUpsCompleted}}}
- Deals Progressed: {{{performanceSignals.dealsProgressed}}}
- Missed Follow-ups: {{{performanceSignals.missedFollowUps}}}

Based on this, generate a concise, one-sentence insight. Also, assess the burnout risk.

- If hours are high (>9) and performance is declining, burnout risk is 'High'.
- If hours are high but performance is stable, burnout risk is 'Medium'.
- Otherwise, burnout risk is 'Low'.

Example Insight: "James shows strong performance in deal progression, though a recent increase in missed follow-ups could be an area to watch."
Example Insight: "Priya maintains high task completion rates even with flexible hours, indicating efficient work patterns."
`,
});

const generatePerformanceInsightFlow = ai.defineFlow(
  {
    name: 'generatePerformanceInsightFlow',
    inputSchema: GeneratePerformanceInsightInputSchema,
    outputSchema: GeneratePerformanceInsightOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
