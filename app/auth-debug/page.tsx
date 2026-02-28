import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AuthDebugPage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Auth Debug Page</h1>

                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Authentication Status</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded p-4">
                            <p className="text-red-500 font-semibold">❌ Auth Error:</p>
                            <pre className="text-sm mt-2">{JSON.stringify(error, null, 2)}</pre>
                        </div>
                    )}

                    {user ? (
                        <div className="bg-green-500/10 border border-green-500/20 rounded p-4">
                            <p className="text-green-500 font-semibold">✅ User Logged In</p>
                            <pre className="text-sm mt-2">{JSON.stringify(user, null, 2)}</pre>
                        </div>
                    ) : (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-4">
                            <p className="text-yellow-500 font-semibold">⚠️ No User Found</p>
                            <p className="text-sm mt-2">You need to log in to use this app.</p>
                            <p className="text-sm mt-2">This is why file upload is failing!</p>
                        </div>
                    )}
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
                    <div className="space-y-2 text-sm">
                        <p>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
                        <p>SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
                    </div>
                </div>

                {!user && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">How to Fix</h2>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>You need to implement a login page</li>
                            <li>Or create a test user in Supabase dashboard</li>
                            <li>Or disable authentication temporarily for testing</li>
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
}
