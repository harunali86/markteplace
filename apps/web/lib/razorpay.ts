import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

export function isRazorpayConfigured() {
    return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpayCheckoutKey() {
    return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || null;
}

export function getRazorpay() {
    if (!isRazorpayConfigured()) {
        throw new Error("Razorpay is not configured");
    }
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });
    }
    return razorpayInstance;
}

export const verifyRazorpaySignature = (
    body: string,
    signature: string,
    secret: string
) => {
    return Razorpay.validateWebhookSignature(body, signature, secret);
};
