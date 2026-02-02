import { Request, Response } from 'express';
import { generateWorkflowConfig } from '../services/aiService';

export const generateWorkflow = async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: "Prompt is required" });
        }

        const config = await generateWorkflowConfig(prompt);
        res.json(config);

    } catch (error: any) {
        console.error("AI Controller Error:", error);
        res.status(500).json({ message: "Failed to generate workflow", error: error.message, stack: error.stack });
    }
};
