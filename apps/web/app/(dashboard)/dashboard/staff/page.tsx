import { createClient } from "@/utils/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    Button,
    Avatar,
    AvatarFallback
} from "@doossh/ui";
import { Plus, Shield, User } from "lucide-react";

export default async function StaffPage() {
    const supabase = await createClient();

    // Fetch vendor members (RLS/Bypass handles filtering)
    // Note: In a real system, we'd join with profiles.
    const { data: members } = await supabase
        .from("vendor_memberships")
        .select(`
            id,
            role,
            created_at,
            user_id
        `);

    return (
        <div className="space-y-6">
            <DashboardHeader
                heading="Staff & Roles"
                text="Invite team members and manage their access permissions within your organization."
            >
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Member
                </Button>
            </DashboardHeader>

            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!members?.length ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No staff members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-sm">User ID: {member.user_id.slice(0, 8)}...</div>
                                                <div className="text-xs text-muted-foreground">Active Member</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={member.role === "owner" ? "success" : "secondary"} className="gap-1">
                                            <Shield className="h-3 w-3" />
                                            {member.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {new Date(member.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Edit Permissions</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
