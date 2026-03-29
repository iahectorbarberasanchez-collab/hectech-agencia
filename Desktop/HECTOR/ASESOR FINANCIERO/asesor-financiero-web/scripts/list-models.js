const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function listModels() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_GENERATIVE_AI_API_KEY not found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Note: The JS SDK might not have a direct listModels on the genAI object in all versions
    // but we can try to fetch them or just try common names.
    console.log("Listing models is sometimes restricted. Trying common names...");
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("test");
        console.log(`Model ${modelName}: SUCCESS`);
      } catch (e) {
        console.log(`Model ${modelName}: FAILED - ${e.message.substring(0, 100)}`);
      }
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
