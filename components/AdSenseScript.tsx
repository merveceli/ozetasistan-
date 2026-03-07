"use client";

import { useEffect } from 'react';

export function AdSenseScript() {
    useEffect(() => {
        // AdSense script'ini manuel olarak, döküman başlığına (head) ekliyoruz.
        // Bu sayede Next.js'in 'data-nscript' özniteliği gibi AdSense'in istemediği 
        // meta veriler eklenmez ve hydration hataları önlenir.

        if (typeof window !== 'undefined') {
            const script = document.createElement('script');
            script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1484212824373758";
            script.async = true;
            script.crossOrigin = "anonymous";

            // Bazı tarayıcılarda script'in birden fazla eklenmesini önlemek için
            const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
            if (!existingScript) {
                document.head.appendChild(script);
            }
        }
    }, []);

    return null; // Görsel bir öğe render etmez.
}
