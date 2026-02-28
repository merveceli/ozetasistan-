import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('⚠️ GEMINI_API_KEY bulunamadı! Lütfen .env.local dosyasını kontrol edin.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

// Kararlı ve güçlü model olan Gemini 2.5 Flash kullanımı
export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Görsel okuma ve analiz için de aynı model kullanılabilir
export const visionModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });