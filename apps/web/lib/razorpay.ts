import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

export function getRazorpay() {
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || "dummy_id",
            key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
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
