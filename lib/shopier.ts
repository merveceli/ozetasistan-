import crypto from "crypto";

interface ShopierData {
    user_id: string;
    package_id: string;
    email: string;
    full_name: string;
    amount: number;
}

export class Shopier {
    private apiKey: string;
    private apiSecret: string;
    private callbackUrl: string;

    constructor() {
        this.apiKey = process.env.SHOPIER_API_KEY || "";
        this.apiSecret = process.env.SHOPIER_API_SECRET || "";
        this.callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopier`;

        if (!this.apiKey || !this.apiSecret) {
            console.warn("Shopier API Keys are missing in environment variables");
        }
    }

    generateForm(
        data: ShopierData & {
            buyer_phone?: string;
            buyer_address?: string;
            buyer_city?: string;
            buyer_postcode?: string;
        }
    ) {

        const platform_order_id = `ORDER-${data.package_id}-${Date.now()}`;
        const total_order_value = Number(data.amount).toFixed(2);
        const website_index = "1";
        const currency = "TRY";

        // ✅ Shopier'in beklediği gerçek hash formatı
        const hashStr =
            this.apiKey +
            website_index +
            platform_order_id +
            total_order_value +
            currency;

        const hash = crypto
            .createHmac("sha256", this.apiSecret)
            .update(hashStr)
            .digest("base64");

        const nameParts = data.full_name.trim().split(" ");
        const buyer_name = nameParts[0];
        const buyer_surname =
            nameParts.slice(1).join(" ") || "-";

        return {
            action: "https://www.shopier.com/ShowProduct/api/pay",
            fields: {
                API_key: this.apiKey,
                website_index,

                platform_order_id,

                product_name: `Asistan Paket ${data.package_id}`,
                product_type: "1", // dijital ürün

                buyer_name,
                buyer_surname,
                buyer_email: data.email,

                total_order_value,
                currency,

                callback_url: this.callbackUrl,

                hash
            }
        };
    }

    verifyCallback(postData: Record<string, string>): boolean {

        const website_index = "1";
        const currency = postData.currency || "TRY";

        const hashStr =
            this.apiKey +
            website_index +
            postData.platform_order_id +
            postData.total_order_value +
            currency;

        const calculatedHash = crypto
            .createHmac("sha256", this.apiSecret)
            .update(hashStr)
            .digest("base64");

        return postData.hash === calculatedHash;
    }
}