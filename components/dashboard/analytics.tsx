export type Vuln = Record<string, string>;

export type AnalysisSummary = {
    total_vulns: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    out_of_sla_count: number;
    within_sla_count: number;
    vv_count: number;
    ve_count: number;
    vv_summary: { SLA: string; sev: string; 'Unique Vulnerability Title Count': number }[];
    ve_summary: { SLA: string; sev: string; 'Unique Vulnerability Title Count': number }[];
};

export type AnalysisResult = {
    success: boolean;
    sourceName?: string;
    summary?: AnalysisSummary;
    vulnerabilities?: Vuln[];
    error?: string;
};

export const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'] as const;
export type Severity = (typeof SEVERITIES)[number];

// Fixed colours so a severity always looks the same on every chart
export const SEV_COLORS: Record<Severity, string> = {
    Critical: '#DC2626',
    High: '#F97316',
    Medium: '#EAB308',
    Low: '#22C55E',
};

export const SEV_RANK: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export const assetOf = (v: Vuln) => v['Asset Name'] || v['Asset IP Address'] || 'Unknown';

export function ageDays(v: Vuln): number | null {
    const since = Date.parse(v['Vulnerable Since']);
    const test = Date.parse(v['Vulnerability Test Date']);
    if (isNaN(since) || isNaN(test)) return null;
    return Math.floor((test - since) / 86_400_000);
}

export function severityDistribution(rows: Vuln[]) {
    return SEVERITIES.map((s) => ({
        name: s,
        value: rows.filter((r) => r.Severity === s).length,
        color: SEV_COLORS[s],
    }));
}

export function slaBySeverity(rows: Vuln[]) {
    return SEVERITIES.map((s) => {
        const sub = rows.filter((r) => r.Severity === s);
        return {
            severity: s,
            'Within SLA': sub.filter((r) => r.SLA === 'Within SLA').length,
            'Out of SLA': sub.filter((r) => r.SLA === 'Out of SLA').length,
        };
    });
}

const BUCKETS: { label: string; max: number; color: string }[] = [
    { label: '0-30d', max: 30, color: '#22C55E' },
    { label: '31-60d', max: 60, color: '#84CC16' },
    { label: '61-90d', max: 90, color: '#EAB308' },
    { label: '91-180d', max: 180, color: '#F97316' },
    { label: '180d+', max: Infinity, color: '#DC2626' },
];

export function ageBuckets(rows: Vuln[]) {
    const counts = BUCKETS.map((b) => ({ name: b.label, color: b.color, value: 0 }));
    for (const r of rows) {
        const d = ageDays(r);
        if (d === null) continue;
        const i = BUCKETS.findIndex((b) => d <= b.max);
        counts[i].value += 1;
    }
    return counts;
}

export function monthlyTrend(rows: Vuln[], months = 12) {
    const map = new Map<string, Record<string, number | string>>();
    for (const r of rows) {
        const t = Date.parse(r['Vulnerable Since']);
        if (isNaN(t) || !r.Severity) continue;
        const d = new Date(t);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const entry = map.get(key) ?? { month: key, Critical: 0, High: 0, Medium: 0, Low: 0 };
        entry[r.Severity] = (entry[r.Severity] as number) + 1;
        map.set(key, entry);
    }
    return [...map.values()].sort((a, b) => String(a.month).localeCompare(String(b.month))).slice(-months);
}

export function topAssets(rows: Vuln[], n = 8) {
    const map = new Map<string, { name: string; Critical: number; High: number }>();
    for (const r of rows) {
        if (r.Severity !== 'Critical' && r.Severity !== 'High') continue;
        const name = assetOf(r);
        const e = map.get(name) ?? { name, Critical: 0, High: 0 };
        e[r.Severity] += 1;
        map.set(name, e);
    }
    return [...map.values()]
        .sort((a, b) => b.Critical - a.Critical || b.High - a.High)
        .slice(0, n);
}

export function topFindings(rows: Vuln[], n = 8) {
    const map = new Map<string, { title: string; severity: string; assets: Set<string>; outOfSla: number }>();
    for (const r of rows) {
        if (r.Severity !== 'Critical' && r.Severity !== 'High') continue;
        const title = r['Vulnerability Title'];
        if (!title) continue;
        const e = map.get(title) ?? { title, severity: r.Severity, assets: new Set<string>(), outOfSla: 0 };
        e.assets.add(assetOf(r));
        if (r.SLA === 'Out of SLA') e.outOfSla += 1;
        if (SEV_RANK[r.Severity] < SEV_RANK[e.severity]) e.severity = r.Severity;
        map.set(title, e);
    }
    return [...map.values()]
        .map((e) => ({ title: e.title, severity: e.severity, assets: e.assets.size, outOfSla: e.outOfSla }))
        .sort((a, b) => b.assets - a.assets)
        .slice(0, n);
}

export const uniqueAssets = (rows: Vuln[]) => new Set(rows.map(assetOf)).size;