
const { extractTextFromPDF } = require('../lib/pdf-loader');
const fs = require('fs');
const path = require('path');

async function test() {
    console.log('Testing PDF Parsing...');

    // Create a minimal valid PDF
    // PDF Header
    const pdfHeader = '%PDF-1.4\n';
    const pdfBody = '1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Hello World) Tj\nET\nendstream\nendobj\n';
    const pdfFooter = 'xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000216 00000 n \n0000000305 00000 n \ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n400\n%%EOF';

    const pdfContent = pdfHeader + pdfBody + pdfFooter;
    const buffer = Buffer.from(pdfContent);

    try {
        console.log('Buffer created, size:', buffer.length);
        const text = await extractTextFromPDF(buffer);
        console.log('✅ Success! Extracted text:', text);
    } catch (e) {
        console.error('❌ Failed:', e);
        if (e.cause) console.error('Cause:', e.cause);
    }
}

test();
