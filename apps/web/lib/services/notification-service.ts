import { createClient } from "../../utils/supabase/server";

export class NotificationService {
    /**
     * Send a push notification via FCM (Placeholder for actual Firebase Admin SDK).
     * In a production environment, this would call Firebase Admin.
     */
    static async sendPush(userId: string, title: string, body: string, data?: any) {
        const supabase = await createClient();

        // 1. Log the notification in the database for history/audit
        const { error } = await supabase
            .from("notifications")
            .insert({
                user_id: userId,
                title,
                content: body,
                metadata: data,
                status: "sent",
            });

        if (error) {
            console.error("Failed to log notification:", error);
        }

        // 2. Implementation Note: 
        // This would then invoke the Firebase Admin SDK to dispatch to the user's active tokens.
        console.log(`[Notification Engine] Sent to ${userId}: ${title} - ${body}`);

        return { success: true };
    }

    static async notifyNewBooking(vendorId: string, bookingId: string) {
        // Notify all members of the vendor team
        const supabase = await createClient();
        const { data: members } = await supabase
            .from("vendor_memberships")
            .select("user_id")
            .eq("vendor_id", vendorId);

        if (members) {
            for (const member of members) {
                await this.sendPush(
                    member.user_id,
                    "New Booking Received!",
                    `You have a new reservation (ID: ${bookingId.slice(0, 8)})`,
                    { bookingId, type: "restaurant_booking" }
                );
            }
        }
    }
}
