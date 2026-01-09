import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load the .env file
dotenv.config();

// We check for both names just in case
const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Error: Could not find your API Key.");
  console.error("   Please check your .env file and make sure the variable name matches.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function run() {
  console.log("🤖 Asking Gemini a question...");
  try {
    const result = await model.generateContent("Write a haiku about a successful coder.");
    console.log("\n✅ SUCCESS! Here is the response:\n");
    console.log(result.response.text());
  } catch (error) {
    console.error("❌ Error connecting to Gemini:", error.message);
  }
}

run();