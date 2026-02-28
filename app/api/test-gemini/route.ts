import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';

export async function GET() {
    try {
        // API key kontrolü
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("API Key exists:", !!apiKey);
        console.log("API Key first 10 chars:", apiKey?.substring(0, 10));

        // Basit bir test prompt
        const result = await model.generateContent("Merhaba! Sadece 'Test başarılı!' diye yanıt ver.");
        const response = await result.response;
        const text = response.text();

        console.log("Gemini Response:", text);

        return NextResponse.json({
            success: true,
            apiKeyExists: !!apiKey,
            apiKeyPreview: apiKey?.substring(0, 10),
            geminiResponse: text
        });

    } catch (error: any) {
        console.error('Test error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
