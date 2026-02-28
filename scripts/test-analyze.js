
async function testAnalyze() {
    console.log('Testing Analyze API...');
    try {
        // You generally need a valid document ID here. 
        // For now, we will try with a fake one to see if we get 'Document not found' (404) or 'Internal Server Error' (500)
        // If we get 500 immediately without 'Document not found', it means the code is crashing before DB lookup (e.g. import error).

        const dummyId = '00000000-0000-0000-0000-000000000000';

        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                documentId: dummyId,
                level: 'student'
            })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);

    } catch (error) {
        console.error('Test Error:', error);
    }
}

testAnalyze();
