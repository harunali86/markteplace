import { createClient } from "../../utils/supabase/server";

export class AuditService {
    /**
     * Log an administrative or sensitive action (Rule 7.1).
     */
    static async log(
        action: "create" | "update" | "delete" | "verify" | "suspend" | "transaction",
        targetType: string,
        targetId: string,
        payload?: any
    ) {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from("audit_logs")
            .insert({
                actor_id: user.id,
                action,
                target_type: targetType,
                target_id: targetId,
                payload: payload,
            });

        if (error) {
            console.error("Audit logging failed:", error);
        }
    }
}
