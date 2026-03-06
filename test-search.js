const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key");
        process.exit(1);
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        tools: [
            {
                googleSearch: {}
            }
        ]
    });

    try {
        const res = await model.generateContent("What is the weather like in New York today? Give a single sentence answer.");
        console.log("Response:", res.response.text());
    } catch (e) {
        console.error("Error:", e);
    }
}
main();
