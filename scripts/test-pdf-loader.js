
const { extractTextFromPDF } = require('../lib/pdf-loader');

async function test() {
    console.log('Testing PDF Loader...');
    try {
        const buffer = Buffer.from('Dummy PDF content'); // Won't parse correctly but should check if module loads
        await extractTextFromPDF(buffer);
    } catch (e) {
        console.log('Error as expected (invalid PDF), but module loaded:', e.message);
    }
}

test();
