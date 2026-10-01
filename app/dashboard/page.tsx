'use client';

import { useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, Clock, Moon, Server, ShieldAlert, ShieldCheck, Sun, Layers } from 'lucide-react';
import { FONT_BODY, FONT_IMPORT, useTheme } from '@/lib/theme';
import { SEV_COLORS, ageBuckets, monthlyTrend, severityDistribution, slaBySeverity, topAssets, topFindings, uniqueAssets, type AnalysisResult } from '@/components/dashboard/analytics';
import { Card, FindingsTable, KpiCard, SeverityBadge, SourcePanel } from '@/components/dashboard/UIComponents';

const DEFAULT_FILE_NAME = 'IT Infra Vulns Sep_27.xlsx';

export default function DashboardPage() {
    return (
        <Dashboard />
    );
}

function Dashboard() {
    const { t, mode, toggle } = useTheme();
    const [data, setData] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const run = async (form: FormData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/analyze', { method: 'POST', body: form });
            const result: AnalysisResult = await res.json();
            if (!res.ok || !result.success) throw new Error(result.error ?? 'Analysis failed');
            setData(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    const onUpload = (file: File) => {
        const f = new FormData();
        f.append('file', file);
        run(f);
    };
    const onRunDefault = () => {
        const f = new FormData();
        f.append('useDefault', 'true');
        run(f);
    };

    const rows = data?.vulnerabilities;
    const summary = data?.summary;

    const charts = useMemo(() => {
        if (!rows) return null;
        return {
            dist: severityDistribution(rows),
            sla: slaBySeverity(rows),
            age: ageBuckets(rows),
            trend: monthlyTrend(rows),
            assets: topAssets(rows),
            findings: topFindings(rows),
            assetCount: uniqueAssets(rows),
        };
    }, [rows]);

    const tooltipStyle = {
        background: t.surfaceCard,
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        color: t.text,
        fontSize: 12,
    };
    const axis = { fill: t.muted, fontSize: 11 };
    const grid = { stroke: t.border, strokeDasharray: '3 3' };

    const compliance =
        summary && summary.within_sla_count + summary.out_of_sla_count > 0
            ? Math.round((summary.within_sla_count / (summary.within_sla_count + summary.out_of_sla_count)) * 100)
            : 0;

    return (
        <div style={{ minHeight: '80vh', background: t.bg, color: t.text, fontFamily: FONT_BODY, padding: 0 }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 15 }}>
                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">
                            Vulnerability <span style={{ color: t.brand }}>Analysis</span>
                        </h1>
                        <p style={{ margin: '4px 0 0', color: t.muted, fontSize: 13 }}>
                            Severity, SLA compliance and exposure across your assets
                        </p>
                    </div>
                </header>

                <SourcePanel
                    loading={loading}
                    defaultFileName={DEFAULT_FILE_NAME}
                    activeFile={data?.sourceName}
                    onUpload={onUpload}
                    onRunDefault={onRunDefault}
                />

                {
                    loading && (
                        <div style={{ color: t.brand, fontWeight: 600, fontSize: 14 }}>Running Python analysis…</div>
                    )
                }
                {
                    error && (
                        <div
                            style={{
                                background: t.dangerSoft,
                                color: t.danger,
                                border: `1px solid ${t.danger}55`,
                                borderRadius: 12,
                                padding: 14,
                                fontSize: 13,
                            }}
                        >
                            {error}
                        </div>
                    )
                }

                {
                    !summary && !loading && !error && (
                        <Card>
                            <p style={{ margin: 0, color: t.muted, textAlign: 'center', padding: 30 }}>
                                Upload a vulnerability export or run the project file to see the dashboard.
                            </p>
                        </Card>
                    )
                }

                {
                    summary && rows && charts && (
                        <>
                            {/* KPI row */}
                            {/* <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}> */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2'>
                                <KpiCard label="Total vulns" value={summary.total_vulns.toLocaleString()} hint={`${charts.assetCount} unique assets`} accent={t.brand} icon={<Layers size={18} />} />
                                <KpiCard label="Critical" value={summary.critical_count.toLocaleString()} hint="CVSS 9.0 – 10" accent={SEV_COLORS.Critical} icon={<ShieldAlert size={18} />} />
                                <KpiCard label="High" value={summary.high_count.toLocaleString()} hint="CVSS 7.0 – 8.9" accent={SEV_COLORS.High} icon={<AlertTriangle size={18} />} />
                                <KpiCard label="Out of SLA" value={summary.out_of_sla_count.toLocaleString()} hint="Past remediation window" accent="#DC2626" icon={<Clock size={18} />} />
                                <KpiCard label="SLA compliance" value={`${compliance}%`} hint={`${summary.within_sla_count.toLocaleString()} within SLA`} accent="#16A34A" icon={<ShieldCheck size={18} />} />
                                <KpiCard label="VV / VE (Crit+High)" value={`${summary.vv_count} / ${summary.ve_count}`} hint="Vulnerable-version / exploitable" accent={t.info} icon={<Server size={18} />} />
                            </div>

                            {/* Charts row 1 */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
                                <Card title="Severity distribution" subtitle="All findings">
                                    <div style={{ position: 'relative', height: 280 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie data={charts.dist} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={2} stroke="none">
                                                    {charts.dist.map((d) => (
                                                        <Cell key={d.name} fill={d.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={tooltipStyle} />
                                                <Legend wrapperStyle={{ fontSize: 12, color: t.textMuted }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div style={{ position: 'absolute', top: '40%', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
                                            <div style={{ fontSize: 26, fontWeight: 800 }}>{summary.total_vulns.toLocaleString()}</div>
                                            <div style={{ fontSize: 11, color: t.muted }}>total</div>
                                        </div>
                                    </div>
                                </Card>

                                <Card title="SLA status by severity" subtitle="Within vs out of SLA">
                                    <div style={{ height: 280 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={charts.sla}>
                                                <CartesianGrid {...grid} vertical={false} />
                                                <XAxis dataKey="severity" tick={axis} axisLine={false} tickLine={false} />
                                                <YAxis tick={axis} axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: t.brandSoft }} />
                                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                                <Bar dataKey="Within SLA" stackId="a" fill="#22C55E" />
                                                <Bar dataKey="Out of SLA" stackId="a" fill="#DC2626" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                <Card title="Vulnerability age" subtitle="Days from first seen to test date">
                                    <div style={{ height: 280 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={charts.age}>
                                                <CartesianGrid {...grid} vertical={false} />
                                                <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
                                                <YAxis tick={axis} axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: t.brandSoft }} />
                                                <Bar dataKey="value" name="Findings" radius={[6, 6, 0, 0]}>
                                                    {charts.age.map((b) => (
                                                        <Cell key={b.name} fill={b.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                                <Card title="Vulnerability age 2" subtitle="Days from first seen to test date">
                                    <div style={{ height: 280 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={charts.age}>
                                                <CartesianGrid {...grid} vertical={false} />
                                                <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
                                                <YAxis tick={axis} axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: t.brandSoft }} />
                                                <Bar dataKey="value" name="Findings" radius={[6, 6, 0, 0]}>
                                                    {charts.age.map((b) => (
                                                        <Cell key={b.name} fill={b.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </div>

                            {/* Trend */}
                            <Card title="Findings trend" subtitle="New findings by month first seen (last 12 months)">
                                <div style={{ height: 300 }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={charts.trend}>
                                            <CartesianGrid {...grid} vertical={false} />
                                            <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
                                            <YAxis tick={axis} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={tooltipStyle} />
                                            <Legend wrapperStyle={{ fontSize: 12 }} />
                                            {(['Low', 'Medium', 'High', 'Critical'] as const).map((s) => (
                                                <Area key={s} type="monotone" dataKey={s} stackId="1" stroke={SEV_COLORS[s]} fill={SEV_COLORS[s]} fillOpacity={0.45} />
                                            ))}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* Top assets + top findings */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>
                                <Card title="Most exposed assets" subtitle="Critical + High findings">
                                    <div style={{ height: 340 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={charts.assets} layout="vertical" margin={{ left: 20 }}>
                                                <CartesianGrid {...grid} horizontal={false} />
                                                <XAxis type="number" tick={axis} axisLine={false} tickLine={false} />
                                                <YAxis type="category" dataKey="name" width={130} tick={axis} axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: t.brandSoft }} />
                                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                                <Bar dataKey="Critical" stackId="a" fill={SEV_COLORS.Critical} />
                                                <Bar dataKey="High" stackId="a" fill={SEV_COLORS.High} radius={[0, 6, 6, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                <Card title="Top findings" subtitle="Critical + High, ranked by affected assets">
                                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {charts.findings.map((f) => {
                                            const max = charts.findings[0]?.assets || 1;
                                            return (
                                                <li key={f.title}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13 }}>
                                                        <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.title}>
                                                            {f.title}
                                                        </span>
                                                        <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                                                            <SeverityBadge severity={f.severity} />
                                                            <span style={{ color: t.muted, fontSize: 12 }}>{f.assets} assets</span>
                                                        </span>
                                                    </div>
                                                    <div style={{ height: 6, borderRadius: 4, background: t.border, marginTop: 6 }}>
                                                        <div
                                                            style={{
                                                                width: `${(f.assets / max) * 100}%`,
                                                                height: '100%',
                                                                borderRadius: 4,
                                                                background: f.severity === 'Critical' ? SEV_COLORS.Critical : SEV_COLORS.High,
                                                            }}
                                                        />
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </Card>
                            </div>

                            <FindingsTable rows={rows} />
                        </>
                    )
                }
            </div >
        </div >
    );
}