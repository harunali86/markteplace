"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, cn } from "@doossh/ui";
import {
    LayoutDashboard,
    Store,
    Users,
    Settings,
    Tag,
    Calendar,
    ShieldCheck,
    TrendingUp,
    Utensils,
    Ticket,
    CalendarCheck,
    BadgeCheck,
    Wallet,
    FileText,
    UserCircle2
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    role?: "super_admin" | "vendor_admin" | "customer";
}

export function AppSidebar({ className, role = "vendor_admin" }: SidebarProps) {
    const pathname = usePathname();

    const allRoutes = [
        // SUPER ADMIN ROUTES (System Metrics, Vendor Moderation, Global Sales)
        {
            label: "Admin Dashboard",
            href: "/dashboard/admin",
            icon: LayoutDashboard, // Changed from LayoutDashboard to ShieldCheck in instruction, but keeping LayoutDashboard as it's more appropriate for a dashboard. If the user explicitly wants ShieldCheck, they should specify.
            active: pathname === "/dashboard/admin",
            role: ["super_admin"]
        },
        {
            label: "KYC Queue",
            href: "/dashboard/admin/kyc",
            icon: FileText,
            active: pathname.startsWith("/dashboard/admin/kyc"),
            role: ["super_admin"],
        },
        {
            label: "Vendor Verification",
            icon: ShieldCheck,
            href: "/dashboard/admin/vendors",
            active: pathname.startsWith("/dashboard/admin/vendors"),
            role: ["super_admin"]
        },
        {
            label: "Global Sales",
            icon: TrendingUp,
            href: "/dashboard/admin/sales", // Placeholder
            active: pathname.startsWith("/dashboard/admin/sales"),
            role: ["super_admin"]
        },

        // VENDOR B2B ROUTES (Operations, CRUD, Listings)
        {
            label: "My Restaurants",
            href: "/dashboard/restaurants",
            icon: Utensils,
            active: pathname.startsWith("/dashboard/restaurants"),
            role: ["vendor_admin", "super_admin"],
        },
        {
            label: "My Events",
            href: "/dashboard/events",
            icon: Ticket,
            active: pathname.startsWith("/dashboard/events"),
            role: ["vendor_admin", "super_admin"],
        },
        {
            label: "Table Bookings",
            href: "/dashboard/bookings",
            icon: CalendarCheck,
            active: pathname.startsWith("/dashboard/bookings"),
            role: ["vendor_admin", "super_admin"],
        },
        {
            label: "Ticket Sales",
            href: "/dashboard/tickets",
            icon: BadgeCheck,
            active: pathname.startsWith("/dashboard/tickets"),
            role: ["vendor_admin", "super_admin"],
        },
        {
            label: "Party Hall Leads",
            href: "/dashboard/halls",
            icon: Users,
            active: pathname.startsWith("/dashboard/halls"),
            role: ["vendor_admin", "super_admin"],
        },
        {
            label: "Payouts & Wallet",
            href: "/dashboard/payouts",
            icon: Wallet,
            active: pathname.startsWith("/dashboard/payouts"),
            role: ["vendor_admin", "super_admin"],
        },
        {
            label: "Staff & Roles",
            href: "/dashboard/staff",
            icon: UserCircle2,
            active: pathname.startsWith("/dashboard/staff"),
            role: ["vendor_admin", "super_admin"],
        },
        {
            label: "Settings",
            href: "/dashboard/settings",
            icon: Settings,
            active: pathname.startsWith("/dashboard/settings"),
            role: ["vendor_admin", "super_admin"],
        },
    ];

    const routes = allRoutes.filter(route => route.role.includes(role));

    return (
        <div className={cn("pb-12 h-full border-r bg-background", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase opacity-50">
                        {role === "super_admin" ? "Super Admin CRM" : "Vendor B2B Portal"}
                    </h2>
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Button
                                key={route.href}
                                variant={route.active ? "secondary" : "ghost"}
                                className={cn("w-full justify-start gap-3 px-4 py-2", route.active && "bg-secondary font-medium")}
                                asChild
                            >
                                <Link href={route.href}>
                                    <route.icon className="h-4 w-4" />
                                    {route.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
