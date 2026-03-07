/**
 * Kullanıcı ayarlarını localStorage'dan okuyan yardımcı fonksiyonlar.
 * Bu değerleri analiz API çağrılarında kullanabilirsiniz.
 */

export interface UserSettings {
    summaryLength: 'short' | 'medium' | 'detailed';
    summaryLanguage: 'tr' | 'en';
    darkMode: boolean;
    animations: boolean;
}

const STORAGE_KEY = 'ozetai_user_settings';

const DEFAULTS: UserSettings = {
    summaryLength: 'medium',
    summaryLanguage: 'tr',
    darkMode: true,
    animations: true,
};

/**
 * Ayarları localStorage'dan okur. SSR uyumlu (window yoksa default döner).
 */
export function getUserSettings(): UserSettings {
    if (typeof window === 'undefined') return DEFAULTS;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULTS;
        return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
        return DEFAULTS;
    }
}

/**
 * summaryLength → Gemini prompt'una eklenecek Türkçe talimat
 */
export function getSummaryLengthInstruction(length: UserSettings['summaryLength']): string {
    switch (length) {
        case 'short':
            return 'Özeti kısa ve öz tut, maksimum 3-5 madde veya 150 kelime.';
        case 'detailed':
            return 'Özeti çok detaylı yap, tüm ana başlıkları ve alt konuları kapsa, en az 500 kelime.';
        default:
            return 'Özeti orta uzunlukta yap, ana noktaları 200-350 kelime ile özetle.';
    }
}

/**
 * summaryLanguage → Prompt dili talimatı
 */
export function getSummaryLanguageInstruction(lang: UserSettings['summaryLanguage']): string {
    return lang === 'en'
        ? 'Write all output in English.'
        : 'Tüm çıktıyı Türkçe yaz.';
}
