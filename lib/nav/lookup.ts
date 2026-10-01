import { NAV_CONFIG, type NavItem } from "@/config/nav-config";

export function findNavItem(pathname: string): NavItem | undefined {
    const normalizedPath =
        pathname === "/" ? "/dashboard" : pathname.replace(/\/+$/, "");

    return NAV_CONFIG.find((item) => item.href === normalizedPath);
}