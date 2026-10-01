"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Bell, ChevronDown, LogOut, Settings, Sun, Moon, Search, ShieldCheck } from "lucide-react";
import { useTheme, FONT_BODY } from "@/lib/theme";
import { NAV_CONFIG } from "@/config/nav-config";

interface DashboardHeaderProps {
    userName: string;
    userRole?: string;
    notificationCount?: number;
    onOpenMobileNav: () => void;
    /** Called when the user presses Enter in the search box. */
    onSearch?: (query: string) => void;
    /** Called from the user menu. Defaults to routing to /login. */
    onLogout?: () => void;
}

const SETTINGS_HREF = "/dashboard/settings";

const initials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "A";

export default function DashboardHeader({
    userName,
    userRole = "Security Analyst",
    notificationCount = 0,
    onOpenMobileNav,
    onSearch,
    onLogout,
}: DashboardHeaderProps) {
    const { t, mode, toggle } = useTheme();
    const router = useRouter();
    const pathname = usePathname();

    const [menuOpen, setMenuOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Page title comes from the nav item with the longest matching href
    const pageTitle =
        [...NAV_CONFIG]
            .sort((a, b) => b.href.length - a.href.length)
            .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
            ?.label ?? "Dashboard";

    // Close the user menu on outside click or Escape
    useEffect(() => {
        if (!menuOpen) return;
        const onClick = (e: MouseEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [menuOpen]);

    // Press "/" anywhere to focus the search box
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const el = e.target as HTMLElement;
            const typing = el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
            if (e.key === "/" && !typing) {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    const handleLogout = () => {
        setMenuOpen(false);
        if (onLogout) onLogout();
        else router.push("/login");
    };

    const iconBtn =
        "flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2";
    const iconBtnStyle = {
        background: t.surfaceCard,
        border: `1px solid ${t.border}`,
        color: t.textMuted,
        outlineColor: t.brand,
    } as const;

    return (
        <header
            className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 px-4 md:px-6 lg:px-8"
            style={{ background: t.bg, borderBottom: `1px solid ${t.border}`, fontFamily: FONT_BODY }}
        >
            {/* Left: mobile menu + brand on mobile, page title on desktop */}
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={onOpenMobileNav}
                    aria-label="Open navigation"
                    className={`${iconBtn} md:hidden`}
                    style={iconBtnStyle}
                >
                    <Menu size={19} />
                </button>

                <span className="flex items-center gap-2 md:hidden">
                    {/* <ShieldCheck size={18} style={{ color: t.brand }} /> */}
                    <span className="text-sm font-bold" style={{ color: t.text }}>
                        VulnScope
                    </span>
                </span>

                <h1
                    className="hidden truncate text-base font-bold md:block"
                    style={{ color: t.text }}
                >
                    {pageTitle}
                </h1>
            </div>

            {/* Center: search (desktop) */}
            <div className="hidden max-w-lg flex-1 md:block">
                <div
                    className="flex h-10 items-center gap-2 rounded-xl px-3 transition-colors"
                    style={{
                        background: t.inputBg,
                        border: `1px solid ${searchFocused ? t.brand : t.inputBorder}`,
                    }}
                >
                    <Search size={16} color={t.muted} className="shrink-0" />
                    <input
                        ref={searchRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && query.trim()) onSearch?.(query.trim());
                            if (e.key === "Escape") searchRef.current?.blur();
                        }}
                        placeholder="Search CVEs, assets or scans"
                        aria-label="Search"
                        className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-70"
                        style={{ color: t.text }}
                    />
                    <kbd
                        className="hidden rounded-md px-1.5 py-0.5 text-[11px] font-semibold lg:block"
                        style={{ background: t.brandSoft, color: t.textMuted, border: `1px solid ${t.border}` }}
                    >
                        /
                    </kbd>
                </div>
            </div>

            {/* Right: actions */}
            <div className="flex shrink-0 items-center gap-2 md:gap-3">
                <button
                    type="button"
                    onClick={toggle}
                    aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} theme`}
                    className={iconBtn}
                    style={iconBtnStyle}
                >
                    {mode === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                </button>

                <button
                    type="button"
                    aria-label={
                        notificationCount > 0 ? `Notifications, ${notificationCount} unread` : "Notifications"
                    }
                    className={`${iconBtn} relative`}
                    style={iconBtnStyle}
                >
                    <Bell size={17} />
                    {notificationCount > 0 && (
                        <span
                            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                            style={{ background: t.danger, color: t.mode === "light" ? "#fff" : t.navyDeep }}
                        >
                            {notificationCount > 9 ? "9+" : notificationCount}
                        </span>
                    )}
                </button>

                {/* User menu */}
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((m) => !m)}
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        className="flex h-10 items-center gap-2 rounded-xl py-1 pl-1 pr-2.5 transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{
                            background: t.surfaceCard,
                            border: `1px solid ${t.border}`,
                            outlineColor: t.brand,
                        }}
                    >
                        <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                            style={{
                                background: t.brandSoft,
                                color: t.mode === "dark" ? t.brand : t.brandDark,
                                border: `1px solid ${t.inputBorder}`,
                            }}
                        >
                            {initials(userName)}
                        </span>
                        <span className="hidden text-left leading-tight sm:block">
                            <span className="block max-w-28 truncate text-xs font-semibold" style={{ color: t.text }}>
                                {userName}
                            </span>
                            <span className="block max-w-28 truncate text-[11px]" style={{ color: t.muted }}>
                                {userRole}
                            </span>
                        </span>
                        <ChevronDown
                            size={14}
                            color={t.muted}
                            className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {menuOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl"
                            style={{
                                background: t.surfaceCard,
                                border: `1px solid ${t.border}`,
                                boxShadow: t.shadow,
                            }}
                        >
                            <div className="px-3.5 py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
                                <p className="truncate text-[13px] font-semibold" style={{ color: t.text }}>
                                    {userName}
                                </p>
                                <p className="truncate text-xs" style={{ color: t.muted }}>
                                    {userRole}
                                </p>
                            </div>

                            <button
                                role="menuitem"
                                type="button"
                                // onClick={handleLogout}
                                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] transition-colors hover:bg-[var(--hover)]"
                                style={{
                                    color: t.danger,
                                    borderTop: `1px solid ${t.border}`,
                                    ["--hover" as string]: t.dangerSoft,
                                }}
                            >
                                <LogOut size={15} /> Log out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}