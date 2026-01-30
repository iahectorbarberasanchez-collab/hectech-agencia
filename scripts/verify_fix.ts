
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function verify() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) console.error("No API Key");

    const genAI = new GoogleGenerativeAI(apiKey!);
    const modelName = "gemini-2.5-flash";

    console.log(`Testing model: ${modelName}`);

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say 'OK' if you can hear me.");
        const response = await result.response;
        console.log("SUCCESS_Response:", response.text());
    } catch (error: any) {
        console.error("FAIL_Error:", error.message);
    }
}

verify();
