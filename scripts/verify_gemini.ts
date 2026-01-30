
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function verify() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No GEMINI_API_KEY found in .env.local");
        return;
    }

    console.log("Found API Key:", apiKey.substring(0, 5) + "...");

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Attempt to list models to see what's available
        // Note: older SDKs might not support listModels via genAI directly in the same way, 
        // but looking at documentation for 0.24.1 it should be possible or we can try a simple generation.

        // Actually, listModels is on the GoogleGenerativeAI instance? No, it's usually on a model manager or similar.
        // Let's try to just generate content with 'gemini-1.5-flash' and print detailed error if it fails.

        const modelName = "gemini-1.5-flash";
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("✅ Success! Response:", response.text());

    } catch (error: any) {
        console.error("❌ Error with gemini-1.5-flash:", error.message);

        // Try fallback
        try {
            console.log("Trying gemini-pro...");
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Hello");
            console.log("✅ Success with gemini-pro!");
        } catch (e: any) {
            console.error("❌ Error with gemini-pro:", e.message);
        }
    }
}

verify();
