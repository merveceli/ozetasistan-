import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('⚠️ GEMINI_API_KEY bulunamadı! Lütfen .env.local dosyasını kontrol edin.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

// ✅ "gemini-3-flash-preview" → En yeni, hızlı ve gelişmiş önizleme modeli
// ✅ "gemini-2.0-flash"       → stabil, hızlı, ücretsiz
// ✅ "gemini-1.5-flash-latest"
// ❌ "gemini-1.5-flash"       → v0.24+ ile 404 hatası veriyor
const primaryModel = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview", // User requested update to Gemini 3 Flash Preview
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
    }
});

const fallbackModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite", // Lite modeller genellikle daha yüksek kotaya sahiptir
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
    }
});

// Otomatik Fallback (Geri Dönüş) Wrapper'ı
// Tüm kod base'indeki `model.generateContent()` çağrıları aslında buraya düşer.
export const model = {
    generateContent: async (request: any) => {
        try {
            return await primaryModel.generateContent(request);
        } catch (error: any) {
            console.warn(`⚠️ [Gemini 2.5 Error]: ${error.message}`);
            console.warn(`🔄 Sistemsel yoğunluk/hata sebebiyle Yedek Modele (2.0-flash) geçiliyor...`);
            return await fallbackModel.generateContent(request);
        }
    },
    startChat: (params?: any) => {
        // startChat doğrudan primary model üzerinden çalışır
        // (Fallback mod, streaming ile uyumsuz olduğu için chat için primary kullanılır)
        return primaryModel.startChat(params);
    },
};

// Görsel okuma ve analiz için de aynı wrapper'ın basitleştirilmiş hali
export const visionModel = {
    generateContent: async (request: any) => {
        try {
            return await primaryModel.generateContent(request);
        } catch (error: any) {
            console.warn(`⚠️ [Gemini Vision 2.5 Error]: ${error.message}. Switching to fallback...`);
            return await fallbackModel.generateContent(request);
        }
    }
};