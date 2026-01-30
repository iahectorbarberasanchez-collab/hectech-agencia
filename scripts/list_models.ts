
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import { GoogleAIFileManager } from "@google/generative-ai/server";

dotenv.config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No GEMINI_API_KEY found.");
        return;
    }

    console.log("Using API Key: " + apiKey.substring(0, 8) + "...");

    // Note: listing models is not always directly exposed on the client-like GoogleGenerativeAI class in earlier versions,
    // but let's try via the fetch endpoint manually or see if we can perform a simple check.
    // Actually, for SDK 0.24.1, we might not have listModels easily without the server package or using REST.
    // Let's use a raw fetch to the API to list models to be 100% sure without SDK quirks.

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API Error:", JSON.stringify(data.error, null, 2));
        } else if (data.models) {
            console.log("✅ Available Models:");
            data.models.forEach((m: any) => {
                if (m.name.includes("gemini")) {
                    console.log(` - ${m.name} (Methods: ${m.supportedGenerationMethods})`);
                }
            });
        } else {
            console.log("❓ No models found or unexpected response structure:", data);
        }
    } catch (err: any) {
        console.error("❌ Network/Fetch Error:", err.message);
    }
}

listModels();
