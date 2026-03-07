import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: 1200,
                    height: 630,
                    background: 'linear-gradient(135deg, #030014 0%, #0d0024 50%, #030014 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                }}
            >
                {/* Glow circles */}
                <div style={{
                    position: 'absolute', top: -80, left: -80,
                    width: 400, height: 400,
                    background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
                    borderRadius: '50%',
                }} />
                <div style={{
                    position: 'absolute', bottom: -60, right: -60,
                    width: 300, height: 300,
                    background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                }} />

                {/* Logo area */}
                <div style={{
                    width: 90, height: 90,
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7, #3b82f6)',
                    borderRadius: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 32, fontSize: 48,
                    boxShadow: '0 20px 60px rgba(124,58,237,0.4)',
                }}>
                    📚
                </div>

                {/* Main title */}
                <div style={{
                    fontSize: 72, fontWeight: 900, color: 'white',
                    letterSpacing: '-2px', marginBottom: 16, textAlign: 'center',
                }}>
                    Özet Asistanı
                </div>

                {/* Subtitle */}
                <div style={{
                    fontSize: 28, color: 'rgba(255,255,255,0.6)',
                    fontWeight: 400, textAlign: 'center', maxWidth: 700,
                    lineHeight: 1.4,
                }}>
                    Türkçe PDF & Makale Analizi · Flashcard · Sunum
                </div>

                {/* Pills */}
                <div style={{ display: 'flex', gap: 16, marginTop: 48 }}>
                    {['🧠 Gemini AI', '⚡ Saniyeler içinde', '🎓 Akademik Asistan'].map((label) => (
                        <div key={label} style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 999,
                            padding: '10px 24px',
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: 18, fontWeight: 600,
                        }}>
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}
