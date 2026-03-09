import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Özet Asistanı",
        short_name: "Özet AI",
        description: "Türkçe PDF ve akademik makaleleri anında özetleyen yapay zeka asistanı",
        start_url: "/landing",
        display: "standalone",
        background_color: "#030014",
        theme_color: "#7c3aed",
        icons: [
            {
                src: "/logo.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable"
            },
            {
                src: "/logo.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any"
            }
        ],
    };
}
