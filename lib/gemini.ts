import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('⚠️ GEMINI_API_KEY bulunamadı! Lütfen .env.local dosyasını kontrol edin.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

// Kararlı ve güçlü model: gemini-1.5-flash
// NOT: "gemini-2.5-flash" veya "gemini-2.5-flash-preview" gibi deneysel
// model adları API hatalarına yol açabilir. Sadece aşağıdaki stabil adı kullanın.
export const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
    }
});

// Görsel okuma ve analiz için de aynı model kullanılabilir
export const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });