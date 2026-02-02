import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    // Note: getGenerativeModelModel is not for listing. We need the ModelService if exposed or just try a known one.
    // Actually SDK doesn't always expose listModels easily in early versions.
    // But error said "Call ListModels". That might be a REST API hint.
    // Let's try to just hit the REST API directly to list models.

    console.log("Listing models via REST...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

run();
