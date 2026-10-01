"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useMemo,
} from "react";

// ─────────────────────────────────────────────────────────────
// SAFARICOM INSPIRED DESIGN SYSTEM (Vulnerability Dashboard)
//
// Primary Brand Green:  #30B54A (Safaricom Green)
// Accent/Swoosh Red:    #E41C24 (Safaricom Red)
// Font Selection:       Manrope (Maintains a clean modern feel)
// ─────────────────────────────────────────────────────────────

export const tokens = {

    // DARK THEME (Optimized for Security Operations Centers)
    dark: {
        mode: "dark",

        // Backgrounds (Deep Corporate Emerald-Tinted Slate)
        bg: "#060A08",
        surface: "#0D1410",
        surfaceCard: "#131D17",

        // Borders
        border: "rgba(48, 181, 74, 0.12)",

        // Typography
        text: "#F1F9F3",
        textMuted: "#A3BCA9",
        muted: "#758E7B",

        // Safaricom Brand Anchors
        primary: "#F1F9F3",
        brand: "#30B54A",       // Classic Green
        brandDark: "#1E8231",   // Deep Green
        brandSoft: "rgba(48, 181, 74, 0.15)",

        // Supporting colors
        secondary: "#8EA895",

        // Security Status Indicators
        success: "#22C55E",      // Low Risk
        successSoft: "rgba(34, 197, 94, 0.12)",

        warning: "#EAB308",      // Medium Risk
        warningSoft: "rgba(234, 179, 8, 0.12)",

        danger: "#EF4444",       // High / Critical Risk (Distinct vivid red)
        dangerSoft: "rgba(239, 68, 68, 0.12)",

        info: "#06B6D4",         // Informational Vulnerabilities
        infoSoft: "rgba(6, 182, 212, 0.12)",

        // Legacy / Branding utility elements
        navy: "#0D1410",
        navyDeep: "#040706",

        // Inputs
        inputBg: "#0B110E",
        inputBorder: "rgba(48, 181, 74, 0.2)",

        // Shadows
        shadow:
            "0 1px 3px rgba(0,0,0,0.40), 0 12px 30px rgba(0,0,0,0.50)",
    },

    // LIGHT THEME (Clean Corporate Framework)
    light: {
        mode: "light",

        // Backgrounds
        bg: "#F4F9F5",           // Tinted soft green-white
        surface: "#EAF3EC",
        surfaceCard: "#FFFFFF",

        // Borders
        border: "#D2E5D6",

        // Typography
        text: "#0A1F10",
        textMuted: "#3B5241",
        muted: "#5B7562",

        // Safaricom Brand Anchors
        primary: "#0A1F10",
        brand: "#30B54A",       // Classic Green
        brandDark: "#1E8231",   // Deep Green
        brandSoft: "rgba(48, 181, 74, 0.08)",

        // Supporting colors (Accent Red touches)
        secondary: "#E41C24",   // Safaricom Accent Red

        // Security Status Indicators
        success: "#166534",      // Low Risk
        successSoft: "rgba(22, 101, 52, 0.09)",

        warning: "#854D0E",      // Medium Risk
        warningSoft: "rgba(133, 77, 14, 0.10)",

        danger: "#991B1B",       // High / Critical Risk
        dangerSoft: "rgba(153, 27, 27, 0.09)",

        info: "#155E75",         // Informational
        infoSoft: "rgba(21, 94, 117, 0.09)",

        // Deep brand shades
        navy: "#0A1F10",
        navyDeep: "#040D07",

        // Inputs
        inputBg: "#FFFFFF",
        inputBorder: "#BCD7C2",

        // Shadows
        shadow:
            "0 1px 3px rgba(10, 31, 16, 0.06), 0 8px 24px rgba(10, 31, 16, 0.04)",
    },
} as const;

export type ThemeMode = keyof typeof tokens;

export type Tokens = (typeof tokens)[ThemeMode];

type ThemeContextValue = {
    mode: ThemeMode;
    t: Tokens;
    toggle: () => void;
    setMode: (m: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
    mode: "light",
    t: tokens.light,
    toggle: () => { },
    setMode: () => { },
});

export function ThemeProvider({
    children,
    defaultMode = "light",
}: {
    children: React.ReactNode;
    defaultMode?: ThemeMode;
}) {
    const [mode, setMode] = useState<ThemeMode>(() => {
        if (typeof window !== "undefined") {
            const stored = window.localStorage.getItem("safaricom-dashboard-theme");
            if (stored === "light" || stored === "dark") {
                return stored;
            }
        }
        return defaultMode;
    });

    useEffect(() => {
        document.documentElement.dataset.theme = mode;
        window.localStorage.setItem("safaricom-dashboard-theme", mode);
    }, [mode]);

    const value = useMemo(
        () => ({
            mode,
            t: tokens[mode],

            toggle: () =>
                setMode((current) =>
                    current === "dark" ? "light" : "dark"
                ),

            setMode,
        }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

// ─────────────────────────────────────────────────────────────
// Typography configuration
// ─────────────────────────────────────────────────────────────

export const FONT_IMPORT =
    "@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');";

export const FONT_DISPLAY =
    "'Manrope', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const FONT_BODY =
    "'Manrope', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";