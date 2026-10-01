"use client";

import { ArrowRight, ShieldAlert } from "lucide-react";
import { useTheme, FONT_DISPLAY, FONT_BODY } from "@/lib/theme";

interface ComingSoonProps {
    label: string;
    parentLabel?: string;
    description?: string;
}

export default function ComingSoon({
    label,
    parentLabel,
    description,
}: ComingSoonProps) {
    const { t } = useTheme();

    return (
        <div
            className="
                min-h-[calc(100vh-180px)]
                w-full
                rounded-xl
                flex
                items-center
                justify-center
                p-6
                sm:p-10
                lg:p-14
                transition-all
                duration-200
            "
            style={{
                background: t.surfaceCard,
                border: `1px solid ${t.border}`,
                boxShadow: t.shadow,
            }}
        >
            <div className="w-full max-w-md text-center">
                {/* Security/Shield Dynamic Icon */}
                <div
                    className="
                        mx-auto
                        mb-4
                        h-14
                        w-14
                        rounded-xl
                        flex
                        items-center
                        justify-center
                    "
                    style={{
                        background: t.brandSoft,
                        border: `1px solid ${t.brand}20`,
                    }}
                >
                    <ShieldAlert
                        size={28}
                        strokeWidth={1.8}
                        color={t.brand}
                    />
                </div>

                {/* Optional Breadcrumb Segment */}
                {(parentLabel || label) && (
                    <div
                        className="mb-3 text-xs font-bold uppercase tracking-[0.15em]"
                        style={{
                            color: t.brand,
                            fontFamily: FONT_BODY,
                        }}
                    >
                        {parentLabel ? `${parentLabel} ` : ""}
                        {parentLabel && label ? "· " : ""}
                        {label}
                    </div>
                )}

                {/* Target Module Heading */}
                <h1
                    className="text-xl sm:text-2xl font-extrabold tracking-tight"
                    style={{
                        color: t.text,
                        fontFamily: FONT_DISPLAY,
                    }}
                >
                    {label}
                </h1>

                {/* Context Description */}
                <p
                    className="mt-3 text-sm leading-6"
                    style={{
                        color: t.textMuted,
                        fontFamily: FONT_BODY,
                    }}
                >
                    {description ??
                        "This analytical module is currently being configured and will be active shortly."}
                </p>

                {/* Live Pipeline Status Pulsar */}
                <div className="mt-5 flex justify-center">
                    <div
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            px-3.5
                            py-1.5
                            text-xs
                            font-bold
                            tracking-wide
                        "
                        style={{
                            background: t.brandSoft,
                            color: t.brand,
                        }}
                    >
                        <span
                            className="h-2 w-2 rounded-full animate-pulse"
                            style={{ background: t.brand }}
                        />
                        Deployment Pipeline Active
                    </div>
                </div>

                {/* Supporting Project Footer Anchor */}
                <div
                    className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold tracking-wide uppercase"
                    style={{ color: t.muted, fontFamily: FONT_BODY }}
                >
                    <span>Safaricom SecOps Engine</span>
                    <ArrowRight size={13} />
                </div>
            </div>
        </div>
    );
}