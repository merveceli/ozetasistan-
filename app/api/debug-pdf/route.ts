
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log('🔍 Debugging PDF Parse...');

        // Try importing/requiring
        const pdf = require('pdf-parse');

        console.log('📦 PDF Parse type:', typeof pdf);
        console.log('📦 PDF Parse keys:', Object.keys(pdf));

        return NextResponse.json({
            status: 'ok',
            type: typeof pdf,
            keys: Object.keys(pdf),
            isFunction: typeof pdf === 'function'
        });
    } catch (error: any) {
        console.error('Debug error:', error);
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
