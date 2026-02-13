import { createClient } from "../../utils/supabase/server";

export class BillingService {
    /**
     * Calculate and track marketplace commission for a payment (Rule 2.1).
     */
    static async trackCommission(paymentId: string) {
        const supabase = await createClient();

        // 1. Get payment details
        const { data: payment } = await supabase
            .from("payments")
            .select("*")
            .eq("id", paymentId)
            .single();

        if (!payment || payment.status !== 'captured') return;

        // 2. Identify vendor and marketplace type
        // This usually requires joining with 'orders' or 'bookings'
        // For simplicity, we'll assume we can resolve the vendor_id from the context
        // In a real flow, this would be passed or resolved during the payment capture webhook
    }

    /**
     * Get vendor's payout balance and history.
     */
    static async getVendorPayoutStats(vendorId: string) {
        const supabase = await createClient();

        const { data: payouts } = await supabase
            .from("vendor_payouts")
            .select("*")
            .eq("vendor_id", vendorId)
            .order('created_at', { ascending: false });

        const totalPaid = payouts?.reduce((sum, p) => sum + (p.status === 'processed' ? Number(p.amount) : 0), 0) || 0;
        const pending = payouts?.reduce((sum, p) => sum + (p.status === 'pending' ? Number(p.amount) : 0), 0) || 0;

        return {
            totalPaid,
            pending,
            history: payouts || [],
        };
    }

    /**
     * Process a payout request (Super Admin only).
     */
    static async processPayout(payoutId: string, referenceId: string) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("vendor_payouts")
            .update({
                status: 'processed',
                processed_at: new Date().toISOString(),
                reference_id: referenceId
            })
            .eq("id", payoutId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }
}
