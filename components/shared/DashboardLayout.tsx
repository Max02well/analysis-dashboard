"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import { useTheme, FONT_IMPORT, FONT_BODY } from "@/lib/theme";

interface DashboardLayoutProps {
    userName: string;
    userRole?: string;
    notificationCount?: number;
    onSearch?: (query: string) => void;
    onLogout?: () => void;
    children: React.ReactNode;
}

export default function DashboardLayout({
    userName,
    userRole,
    notificationCount,
    onSearch,
    onLogout,
    children,
}: DashboardLayoutProps) {
    const { t } = useTheme();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
    const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

    // Stop the page behind the drawer from scrolling while it is open
    useEffect(() => {
        if (!mobileNavOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [mobileNavOpen]);

    return (
        <div className="flex min-h-screen" style={{ background: t.bg, fontFamily: FONT_BODY }}>
            <style>{FONT_IMPORT}</style>

            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:px-3 focus:py-2 focus:text-sm focus:font-semibold"
                style={{ background: t.brand, color: "#fff" }}
            >
                Skip to content
            </a>

            <Sidebar
                userName={userName}
                userRole={userRole}
                mobileOpen={mobileNavOpen}
                onCloseMobile={closeMobileNav}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <DashboardHeader
                    userName={userName}
                    userRole={userRole}
                    notificationCount={notificationCount}
                    onOpenMobileNav={openMobileNav}
                    onSearch={onSearch}
                    onLogout={onLogout}
                />
                <main
                    id="main-content"
                    className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-6 lg:p-8"
                    style={{ color: t.text }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}