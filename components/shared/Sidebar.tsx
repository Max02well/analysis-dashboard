"use client";

import { useEffect } from "react";
import { X, LogOut, ShieldCheck } from "lucide-react";
import { tokens, FONT_BODY } from "@/lib/theme";
import { NAV_CONFIG } from "@/config/nav-config";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface SidebarProps {
    userName: string;
    userRole?: string;
    mobileOpen: boolean;
    onCloseMobile: () => void;
}

const initials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "A";

export default function Sidebar({
    userRole,
    userName,
    mobileOpen,
    onCloseMobile,
}: SidebarProps) {
    // const { t } = useTheme();
    const pathname = usePathname();
    const d = tokens.dark;

    // The dashboard root only matches exactly, otherwise it would stay active everywhere.
    const rootHref = NAV_CONFIG[0]?.href;
    const isActive = (href: string) =>
        pathname === href || (href !== rootHref && pathname.startsWith(`${href}/`));

    // Close the mobile drawer with Escape
    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseMobile();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [mobileOpen, onCloseMobile]);

    // The sidebar stays deep navy in both themes so the brand reads the same everywhere.
    // const bg = t.mode === "light" ? t.brandDark : t.navyDeep;

    const linkBase =
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

    return (
        <>
            {/* Mobile overlay */}
            <div
                onClick={onCloseMobile}
                aria-hidden="true"
                className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
            />

            <aside
                aria-label="Main navigation"
                className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                style={{
                    background: `linear-gradient(180deg, ${d.navyDeep} 0%, ${d.navy} 100%)`,
                    borderRight: `1px solid ${d.border}`,
                    fontFamily: FONT_BODY,
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 pb-5 pt-5"
                    style={{ borderBottom: `1px solid ${d.border}` }}
                >
                    <Link
                        href={rootHref ?? "/"}
                        onClick={onCloseMobile}
                        className="flex min-w-0 items-center gap-2.5"
                        aria-label="Dashboard home"
                    >
                        {/* <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{
                                background: d.brandSoft,
                                border: `1px solid ${d.inputBorder}`,
                                boxShadow: `0 0 18px ${d.brandSoft}`,
                            }}
                        >
                            <ShieldCheck size={20} style={{ color: d.brand }} />
                        </span> */}
                        <span className="min-w-0 leading-tight ml-2">
                            <span className="block truncate text-sm font-bold text-white">Dashboard Test</span>
                            <span className="block truncate text-xs" style={{ color: d.textMuted }}>
                                Vulnerability Analysis
                            </span>
                        </span>
                    </Link>

                    {/* Close button for mobile */}
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        aria-label="Close navigation"
                        className="
                        rounded-lg
                        p-1.5
                        text-white/70
                        transition-colors
                        hover:bg-white/10
                        hover:text-white
                        md:hidden
                    "
                    >
                        <X size={18} />
                    </button>
                </div>


                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Primary">
                    <p
                        className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: d.muted }}
                    >
                        Menu
                    </p>
                    <ul className="space-y-1">
                        {NAV_CONFIG.map(({ label, href, icon: Icon }) => {
                            const active = isActive(href);
                            return (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        onClick={onCloseMobile}
                                        aria-current={active ? "page" : undefined}
                                        className={`${linkBase} relative ${active ? "text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                                            }`}
                                        style={active ? { background: d.brandSoft } : undefined}
                                    >
                                        {active && (
                                            <span
                                                aria-hidden="true"
                                                className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full"
                                                style={{ background: d.brand }}
                                            />
                                        )}
                                        <Icon
                                            size={17}
                                            className="shrink-0"
                                            style={{ color: active ? d.brand : undefined }}
                                        />
                                        <span className="truncate">{label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Signed-in user */}
                <div className="border-t border-white/10 p-2 mb-3">
                    <div className="flex items-center gap-3 rounded-xl p-2 shadow-sm bg-black/20 hover:bg-black/50">
                        {/* Avatar */}
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: d.brandSoft, color: d.brand }}>
                            {initials(userName)}
                        </span>

                        {/* User information */}
                        <div className="min-w-0 flex-1 leading-tight">
                            <span className="block truncate text-[13px] font-semibold text-white">
                                {userName}
                            </span>
                            <span className="block truncate text-xs text-white/60">
                                {userRole}
                            </span>
                        </div>
                        <span className="
                                group flex h-9 w-9 shrink-0 items-center justify-center
                                rounded-lg
                                text-white/60
                                transition-all duration-150
                                hover:bg-red-500/10
                                hover:text-red-300
                                focus-visible:outline-2
                                focus-visible:outline-offset-2
                                focus-visible:outline-white"
                        >
                            <LogOut size={17} strokeWidth={2} className="transition-transform duration-150 group-hover:translate-x-0.5" />
                        </span>

                        {/* Logout */}
                        {/* <Link
                            href="/login"
                            aria-label="Logout"
                            title="Logout"
                            className="
                                group flex h-9 w-9 shrink-0 items-center justify-center
                                rounded-lg
                                text-white/60
                                transition-all duration-150
                                hover:bg-red-500/10
                                hover:text-red-300
                                focus-visible:outline-2
                                focus-visible:outline-offset-2
                                focus-visible:outline-white"
                        >
                            <LogOut size={17} strokeWidth={2} className="transition-transform duration-150 group-hover:translate-x-0.5" />
                        </Link> */}
                    </div>
                </div>
            </aside>
        </>
    );
}