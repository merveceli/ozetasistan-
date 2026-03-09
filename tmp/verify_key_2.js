
const apiKey = "AIzaSyBJEKEK4MQx5uvlZ3skHzs1lfdlKgHYk74";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

async function verifyKey() {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "hi" }] }]
            })
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Verification failed:", e.message);
    }
}
verifyKey();
