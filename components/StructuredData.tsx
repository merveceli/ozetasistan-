// Yapılandırılmış veri (JSON-LD) bileşeni
// Google'a sitenin ne olduğunu açıkça anlatır → Zengin arama sonuçları

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ozetasistani.com';

export function StructuredData() {
    const softwareAppSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Özet Asistanı',
        url: SITE_URL,
        description:
            'Türkçe PDF, makale ve akademik dokümanları saniyeler içinde özetleyen, flashcard ve sunum üreten yapay zeka asistanı. Öğrenci ve akademisyenler için tasarlandı.',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web, iOS, Android',
        inLanguage: 'tr',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'TRY',
            availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1240',
            bestRating: '5',
            worstRating: '1',
        },
        featureList: [
            'PDF özetleme',
            'Akademik makale analizi',
            'Otomatik flashcard oluşturma',
            'Zihin haritası üretimi',
            'Sunum oluşturma',
            'Çapraz okuma ve kaynak karşılaştırma',
            'Odak radyosu ve Pomodoro modu',
        ],
        screenshot: `${SITE_URL}/api/og`,
        softwareVersion: '2.0',
        datePublished: '2024-01-01',
    };

    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Özet Asistanı',
        url: SITE_URL,
        description: 'Türkiye\'nin en gelişmiş akademik AI asistanı',
        inLanguage: 'tr',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/kutuphanem?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };

    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Özet Asistanı',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        sameAs: [],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            availableLanguage: 'Turkish',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
        </>
    );
}

// Sayfa bazlı Article schema (blog makaleleri için)
interface ArticleSchemaProps {
    title: string;
    description: string;
    url: string;
    datePublished: string;
    dateModified?: string;
    imageUrl?: string;
}

export function ArticleStructuredData({
    title,
    description,
    url,
    datePublished,
    dateModified,
    imageUrl,
}: ArticleSchemaProps) {
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        url,
        datePublished,
        dateModified: dateModified || datePublished,
        author: {
            '@type': 'Organization',
            name: 'Özet Asistanı',
            url: SITE_URL,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Özet Asistanı',
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/logo.png`,
            },
        },
        image: imageUrl || `${SITE_URL}/api/og`,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
    );
}

// FAQ Schema (landing page için)
interface FAQItem {
    question: string;
    answer: string;
}

export function FAQStructuredData({ faqs }: { faqs: FAQItem[] }) {
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
    );
}
