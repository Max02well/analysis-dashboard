'use client';

import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { FileSpreadsheet, Play, Search, UploadCloud } from 'lucide-react';
import { useTheme } from '@/lib/theme'; // <-- adjust to wherever your theme.tsx lives
import { SEV_COLORS, SEV_RANK, assetOf, type Severity, type Vuln } from './analytics';

/* ───────────── Card shell ───────────── */

export function Card({
    title,
    subtitle,
    right,
    children,
    style,
}: {
    title?: string;
    subtitle?: string;
    right?: ReactNode;
    children: ReactNode;
    style?: CSSProperties;
}) {
    const { t } = useTheme();
    return (
        <section
            style={{
                background: t.surfaceCard,
                border: `1px solid ${t.border}`,
                borderRadius: 16,
                boxShadow: t.shadow,
                padding: 20,
                ...style,
            }}
        >
            {(title || right) && (
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.text }}>{title}</h3>
                        {subtitle && <p style={{ margin: '2px 0 0', fontSize: 12, color: t.muted }}>{subtitle}</p>}
                    </div>
                    {right}
                </header>
            )}
            {children}
        </section>
    );
}

/* ───────────── KPI card ───────────── */
export function KpiCard({
    label,
    value,
    hint,
    accent,
    icon,
}: {
    label: string;
    value: string | number;
    hint?: string;
    accent: string;
    icon: ReactNode;
}) {
    const { t } = useTheme();
    return (
        <div
            style={{
                background: t.surfaceCard,
                border: `1px solid ${t.border}`,
                borderRadius: 14,
                boxShadow: t.shadow,
                padding: 16,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: t.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    {label}
                </span>
                <span
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        display: 'grid',
                        placeItems: 'center',
                        color: accent,
                        background: `${accent}22`,
                    }}
                >
                    {icon}
                </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: t.text, marginTop: 10, lineHeight: 1 }}>{value}</div>
            {hint && <div style={{ fontSize: 12, color: t.muted, marginTop: 8 }}>{hint}</div>}
        </div>
    );
}

/* ───────────── Source picker: upload OR default file ───────────── */

export function SourcePanel({
    loading,
    defaultFileName,
    activeFile,
    onUpload,
    onRunDefault,
}: {
    loading: boolean;
    defaultFileName: string;
    activeFile?: string;
    onUpload: (file: File) => void;
    onRunDefault: () => void;
}) {
    const { t } = useTheme();
    const inputRef = useRef<HTMLInputElement>(null);
    const [drag, setDrag] = useState(false);

    const pick = (f?: File | null) => {
        if (f) onUpload(f);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 10 }}>
            {/* Option 1 */}
            <div
                onClick={() => !loading && inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDrag(false);
                    if (!loading) pick(e.dataTransfer.files?.[0]);
                }}
                style={{
                    cursor: loading ? 'not-allowed' : 'pointer',
                    border: `2px dashed ${drag ? t.brand : t.inputBorder}`,
                    background: drag ? t.brandSoft : t.inputBg,
                    borderRadius: 14,
                    padding: 14,
                    display: 'flex',
                    gap: 14,
                    alignItems: 'center',
                    transition: 'all .15s',
                }}
            >
                <UploadCloud size={30} color={t.brand} />
                <div>
                    <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>Upload an Excel file</div>
                    <div style={{ fontSize: 12, color: t.muted }}>Drag & drop or click to browse (.xlsx)</div>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".xlsx"
                    hidden
                    onChange={(e) => {
                        pick(e.target.files?.[0]);
                        e.target.value = '';
                    }}
                />
            </div>

            {/* Option 2 */}
            <div
                style={{
                    border: `1px solid ${t.border}`,
                    background: t.surfaceCard,
                    borderRadius: 14,
                    padding: 14,
                    display: 'flex',
                    gap: 14,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0 }}>
                    <FileSpreadsheet size={30} color={t.brand} />
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>Use project file</div>
                        <div style={{ fontSize: 12, color: t.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {defaultFileName}
                        </div>
                    </div>
                </div>
                <button
                    onClick={onRunDefault}
                    disabled={loading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: t.brand,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        padding: '10px 16px',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        whiteSpace: 'nowrap',
                    }}
                >
                    <Play size={14} /> {loading ? 'Running…' : 'Run analysis'}
                </button>
            </div>

            {activeFile && (
                <div style={{ gridColumn: '1 / -1', fontSize: 12, color: t.muted }}>
                    Showing results for: <strong style={{ color: t.text }}>{activeFile}</strong>
                </div>
            )}
        </div>
    );
}

/* ───────────── Badges ───────────── */

export function SeverityBadge({ severity }: { severity: string }) {
    const color = SEV_COLORS[severity as Severity] ?? '#64748B';
    return (
        <span
            style={{
                background: `${color}22`,
                color,
                border: `1px solid ${color}55`,
                borderRadius: 999,
                padding: '2px 10px',
                fontSize: 11,
                fontWeight: 700,
            }}
        >
            {severity || '—'}
        </span>
    );
}

/* ───────────── Findings table ───────────── */

const PAGE_SIZE = 10;

export function FindingsTable({ rows }: { rows: Vuln[] }) {
    const { t } = useTheme();
    const [q, setQ] = useState('');
    const [sev, setSev] = useState('All');
    const [sla, setSla] = useState('All');
    const [page, setPage] = useState(0);

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return rows
            .filter((r) => (sev === 'All' ? true : r.Severity === sev))
            .filter((r) => (sla === 'All' ? true : r.SLA === sla))
            .filter((r) =>
                needle ? `${assetOf(r)} ${r['Vulnerability Title'] ?? ''}`.toLowerCase().includes(needle) : true
            )
            .sort((a, b) => (SEV_RANK[a.Severity] ?? 9) - (SEV_RANK[b.Severity] ?? 9));
    }, [rows, q, sev, sla]);

    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const current = Math.min(page, pages - 1);
    const slice = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

    const control: CSSProperties = {
        background: t.inputBg,
        border: `1px solid ${t.inputBorder}`,
        color: t.text,
        borderRadius: 10,
        padding: '8px 10px',
        fontSize: 13,
        outline: 'none',
    };

    return (
        <Card
            title="Findings"
            subtitle={`${filtered.length.toLocaleString()} matching records`}
            right={
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} color={t.muted} style={{ position: 'absolute', left: 10, top: 11 }} />
                        <input
                            placeholder="Search asset or title"
                            value={q}
                            onChange={(e) => {
                                setQ(e.target.value);
                                setPage(0);
                            }}
                            style={{ ...control, paddingLeft: 30, width: 210 }}
                        />
                    </div>
                    <select value={sev} onChange={(e) => (setSev(e.target.value), setPage(0))} style={control}>
                        {['All', 'Critical', 'High', 'Medium', 'Low'].map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                    <select value={sla} onChange={(e) => (setSla(e.target.value), setPage(0))} style={control}>
                        {['All', 'Within SLA', 'Out of SLA'].map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                </div>
            }
        >
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr style={{ textAlign: 'left', color: t.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                            {['Asset', 'Vulnerability', 'Severity', 'SLA', 'Since'].map((h) => (
                                <th key={h} style={{ padding: '8px 10px', borderBottom: `1px solid ${t.border}` }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {slice.map((r, i) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${t.border}`, color: t.text }}>
                                <td style={{ padding: '10px', fontWeight: 600 }}>{assetOf(r)}</td>
                                <td style={{ padding: '10px', maxWidth: 420 }}>{r['Vulnerability Title']}</td>
                                <td style={{ padding: '10px' }}>
                                    <SeverityBadge severity={r.Severity} />
                                </td>
                                <td
                                    style={{
                                        padding: '10px',
                                        fontWeight: 600,
                                        color: r.SLA === 'Out of SLA' ? '#DC2626' : '#16A34A',
                                    }}
                                >
                                    {r.SLA || '—'}
                                </td>
                                <td style={{ padding: '10px', color: t.textMuted }}>{r['Vulnerable Since']}</td>
                            </tr>
                        ))}
                        {slice.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: t.muted }}>
                                    No findings match your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 12, color: t.muted }}>
                <span>
                    Page {current + 1} of {pages}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button disabled={current === 0} onClick={() => setPage(current - 1)} style={{ ...control, cursor: 'pointer', opacity: current === 0 ? 0.5 : 1 }}>
                        Prev
                    </button>
                    <button disabled={current >= pages - 1} onClick={() => setPage(current + 1)} style={{ ...control, cursor: 'pointer', opacity: current >= pages - 1 ? 0.5 : 1 }}>
                        Next
                    </button>
                </div>
            </div>
        </Card>
    );
}