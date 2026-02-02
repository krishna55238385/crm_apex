import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Zod Schema for Resilient Parsing
const workflowResponseSchema = z.object({
    name: z.string(),
    description: z.string(),
    trigger_type: z.enum(["Lead Created", "Lead Assigned", "Lead Inactive", "Task Overdue", "Time Elapsed", "Call Logged"]),
    risk_level: z.enum(["Low", "Medium", "High"]),
    actions: z.array(z.object({
        type: z.enum(["SEND_EMAIL", "SEND_NOTIFICATION", "CREATE_TASK"]),
        summary: z.string(),
        userId: z.string().optional() // Optional for notification targeting
    })),
    schedule: z.string().optional().nullable()
});

export const generateWorkflowConfig = async (userPrompt: string) => {
    // Reload env vars
    dotenv.config({ override: true });
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

    if (!genAI) {
        console.warn("No GEMINI_API_KEY found. Using mock response.");
        return mockResponse(userPrompt);
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: {
                // Note: Gemini JSON mode is safer, but Zod ensures the fields match exactly
                responseMimeType: "application/json"
            }
        });

        const prompt = `
            You are an expert CRM automation architect.
            The user wants to automate a workflow in their CRM.
            Analyze their request and generate a configuration object adhering EXACTLY to this JSON structure.

            Required Fields:
            - name: string
            - description: string
            - trigger_type: One of ["Lead Created", "Lead Assigned", "Lead Inactive", "Task Overdue", "Time Elapsed", "Call Logged"]
            - risk_level: One of ["Low", "Medium", "High"]
            - actions: Array of objects { type: "SEND_EMAIL"|"SEND_NOTIFICATION"|"CREATE_TASK", summary: string }
            - schedule: CRON string if trigger is "Time Elapsed", else null.

            User Request: "${userPrompt}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Safe Parsing
        let parsedJson;
        try {
            parsedJson = JSON.parse(text);
        } catch (e) {
            console.error("AI returned malformed JSON");
            throw new Error("AI Malformed JSON");
        }

        const validResponse = workflowResponseSchema.safeParse(parsedJson);

        if (!validResponse.success) {
            console.error("AI Response Validation Failed:", validResponse.error);
            // Retry logic could go here (e.g., call LLM again with error message)
            // For now, consistent fallback or throw
            throw new Error("AI Response did not match schema");
        }

        return validResponse.data;

    } catch (error: any) {
        console.error("Gemini AI Generation Error:", error.message);
        return mockResponse(userPrompt);
    }
};

const mockResponse = (prompt: string) => {
    // Simple heuristic fallback
    const lower = prompt.toLowerCase();

    if (lower.includes("email") && lower.includes("lead")) {
        return {
            name: "Auto-Email New Leads",
            description: "Automatically send an email when a lead is created.",
            trigger_type: "Lead Created",
            risk_level: "Low",
            actions: [{ type: "SEND_EMAIL", summary: "Send welcome email to lead" }]
        };
    }

    return {
        name: "Custom Workflow",
        description: "Generated from: " + prompt,
        trigger_type: "Time Elapsed",
        risk_level: "Medium",
        actions: [{ type: "CREATE_TASK", summary: "Review Lead" }]
    };
};
