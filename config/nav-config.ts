import { LayoutDashboard, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

/**
 * Vulnerability Analysis Dashboard System
 * 
 * Simple flat configuration optimized for straightforward sidebar generation.
 */
export const NAV_CONFIG: NavItem[] = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: Settings,
    },
];