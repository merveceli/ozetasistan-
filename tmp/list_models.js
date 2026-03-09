
const apiKey = "AIzaSyBJEKEK4MQx5uvlZ3skHzs1lfdlKgHYk74";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Failed to list models:", e.message);
    }
}
listModels();
