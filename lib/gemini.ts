import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('⚠️ GEMINI_API_KEY bulunamadı! Lütfen .env.local dosyasını kontrol edin.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

// @google/generative-ai v0.24+ ile desteklenen model adları:
// ✅ "gemini-2.0-flash"       → stabil, hızlı, ücretsiz
// ✅ "gemini-1.5-flash-001"   → eski stabil versiyon
// ✅ "gemini-1.5-flash-latest"
// ❌ "gemini-1.5-flash"       → v0.24+ ile 404 hatası veriyor
// ❌ "gemini-2.5-flash"       → deneysel, çoğu zaman çalışmıyor
export const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
    }
});

// Görsel okuma ve analiz için de aynı model
export const visionModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });