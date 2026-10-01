import * as XLSX from "xlsx";

export type VulnerabilityRecord = Record<string, string>;

export type VulnerabilitySummary = {
    total_vulns: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    out_of_sla_count: number;
    within_sla_count: number;
    vv_count: number;
    ve_count: number;
    vv_summary: Array<{
        SLA: string;
        sev: string;
        "Unique Vulnerability Title Count": number;
    }>;
    ve_summary: Array<{
        SLA: string;
        sev: string;
        "Unique Vulnerability Title Count": number;
    }>;
};

export type AnalysisResult = {
    summary: VulnerabilitySummary;
    vulnerabilities: VulnerabilityRecord[];
};

type RawRow = Record<string, unknown>;

/**
 * Excel's serial date system uses 1899-12-30 as the origin,
 * matching the behavior used by pandas in the existing Python script.
 */
function excelSerialToDate(serial: number): Date | null {
    if (!Number.isFinite(serial)) {
        return null;
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    return new Date(
        Date.UTC(1899, 11, 30) + serial * millisecondsPerDay
    );
}

function parseDate(value: unknown): Date | null {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === "number") {
        return excelSerialToDate(value);
    }

    if (typeof value === "string") {
        const trimmed = value.trim();

        if (!trimmed) {
            return null;
        }

        // Handle numeric Excel serial dates stored as strings.
        const numeric = Number(trimmed);

        if (
            Number.isFinite(numeric) &&
            /^\d+(\.\d+)?$/.test(trimmed)
        ) {
            // Only treat it as a serial if it looks like an Excel date.
            if (numeric > 1000 && numeric < 100000) {
                return excelSerialToDate(numeric);
            }
        }

        const parsed = new Date(trimmed);

        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
}

function formatDate(value: unknown): string {
    const date = parseDate(value);

    if (!date) {
        return "";
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function dateDifferenceInDays(
    start: unknown,
    end: unknown
): number | null {
    const startDate = parseDate(start);
    const endDate = parseDate(end);

    if (!startDate || !endDate) {
        return null;
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    return Math.floor(
        (endDate.getTime() - startDate.getTime()) /
        millisecondsPerDay
    );
}

function isNullish(value: unknown): boolean {
    return (
        value === null ||
        value === undefined ||
        value === "" ||
        (typeof value === "number" && Number.isNaN(value))
    );
}

function numericScore(value: unknown): number {
    if (isNullish(value)) {
        return 0;
    }

    const number =
        typeof value === "number"
            ? value
            : Number(String(value).trim());

    return Number.isFinite(number) ? number : 0;
}

/**
 * Matches the Python calculate_severity() behavior.
 */
function calculateSeverity(row: RawRow): string {
    let score = numericScore(
        row["Vulnerability CVSSv3 Score"]
    );

    if (
        score === 0 ||
        isNullish(row["Vulnerability CVSSv3 Score"])
    ) {
        score = numericScore(
            row["Vulnerability CVSS Score"]
        );
    }

    if (score >= 9 && score <= 10) {
        return "Critical";
    }

    if (score >= 7 && score < 9) {
        return "High";
    }

    if (score >= 4 && score < 7) {
        return "Medium";
    }

    if (score >= 0 && score < 4) {
        return "Low";
    }

    return "";
}

/**
 * Matches the Python calculate_sla() behavior.
 */
function calculateSla(row: RawRow): string {
    const vulnerableSince = row["Vulnerable Since"];
    const testDate = row["Vulnerability Test Date"];
    const code = String(
        row["Vulnerability Test Result Code"] ?? ""
    );

    if (
        isNullish(vulnerableSince) ||
        isNullish(testDate)
    ) {
        return "";
    }

    const age = dateDifferenceInDays(
        vulnerableSince,
        testDate
    );

    if (age === null) {
        return "";
    }

    if (code === "vv") {
        return age < 60 ? "Within SLA" : "Out of SLA";
    }

    return age < 30 ? "Within SLA" : "Out of SLA";
}

function uniqueCount(
    rows: RawRow[],
    field: string
): number {
    const values = new Set<string>();

    for (const row of rows) {
        const value = row[field];

        if (!isNullish(value)) {
            values.add(String(value));
        }
    }

    return values.size;
}

function buildGroupedSummary(
    rows: RawRow[]
): Array<{
    SLA: string;
    sev: string;
    "Unique Vulnerability Title Count": number;
}> {
    const groups = new Map<
        string,
        {
            SLA: string;
            sev: string;
            titles: Set<string>;
        }
    >();

    for (const row of rows) {
        const sla = String(row["SLA"] ?? "");
        const severity = String(row["Severity"] ?? "");
        const title = row["Vulnerability Title"];

        const key = `${sla}|||${severity}`;

        if (!groups.has(key)) {
            groups.set(key, {
                SLA: sla,
                sev: severity,
                titles: new Set<string>(),
            });
        }

        if (!isNullish(title)) {
            groups.get(key)!.titles.add(String(title));
        }
    }

    return Array.from(groups.values()).map((group) => ({
        SLA: group.SLA,
        sev: group.sev,
        "Unique Vulnerability Title Count":
            group.titles.size,
    }));
}

/**
 * Reads the first worksheet and performs the same analysis
 * as the existing Python script.
 *
 * This function does NOT write to the Excel workbook.
 * It works entirely in memory, which makes it suitable for Vercel.
 */
export function analyzeWorkbook(
    buffer: Buffer
): AnalysisResult {
    const workbook = XLSX.read(buffer, {
        type: "buffer",
        cellDates: false,
    });

    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
        throw new Error("The Excel workbook contains no worksheets.");
    }

    const worksheet = workbook.Sheets[firstSheetName];

    const rows = XLSX.utils.sheet_to_json<RawRow>(
        worksheet,
        {
            defval: null,
            raw: true,
        }
    );

    if (rows.length === 0) {
        throw new Error("The Excel worksheet contains no data.");
    }

    /**
     * Calculate Severity and SLA.
     */
    const analysedRows: RawRow[] = rows.map((originalRow) => {
        const row = { ...originalRow };

        row["Severity"] = calculateSeverity(row);
        row["SLA"] = calculateSla(row);

        return row;
    });

    /**
     * Format dates exactly as the Python UI output does.
     */
    const finalRows: VulnerabilityRecord[] =
        analysedRows.map((row) => {
            const output: VulnerabilityRecord = {};

            for (const [key, value] of Object.entries(row)) {
                if (
                    key === "Vulnerable Since" ||
                    key === "Vulnerability Test Date"
                ) {
                    output[key] = formatDate(value);
                } else if (isNullish(value)) {
                    output[key] = "";
                } else {
                    output[key] = String(value);
                }
            }

            return output;
        });

    /**
     * Python:
     *
     * filtered_df = df[df['Severity'].isin(['Critical', 'High'])]
     */
    const filteredRows = analysedRows.filter((row) =>
        ["Critical", "High"].includes(
            String(row["Severity"] ?? "")
        )
    );

    /**
     * Python:
     *
     * vv_df = filtered_df[
     *     filtered_df['Vulnerability Test Result Code']
     *     .str.contains('vv', na=False)
     * ]
     */
    const vvRows = filteredRows.filter((row) =>
        String(
            row["Vulnerability Test Result Code"] ?? ""
        ).includes("vv")
    );

    /**
     * Python:
     *
     * ve_df = filtered_df[
     *     filtered_df['Vulnerability Test Result Code']
     *     .str.contains('ve', na=False)
     * ]
     */
    const veRows = filteredRows.filter((row) =>
        String(
            row["Vulnerability Test Result Code"] ?? ""
        ).includes("ve")
    );

    /**
     * Python:
     *
     * vv_df.groupby(
     *     ['SLA', 'Severity']
     * )['Vulnerability Title'].nunique()
     */
    const vvSummary = buildGroupedSummary(vvRows);

    const veSummary = buildGroupedSummary(veRows);

    /**
     * Build exactly the same summary structure
     * expected by the existing dashboard.
     */
    const summary: VulnerabilitySummary = {
        total_vulns: analysedRows.length,

        critical_count: analysedRows.filter(
            (row) => row["Severity"] === "Critical"
        ).length,

        high_count: analysedRows.filter(
            (row) => row["Severity"] === "High"
        ).length,

        medium_count: analysedRows.filter(
            (row) => row["Severity"] === "Medium"
        ).length,

        low_count: analysedRows.filter(
            (row) => row["Severity"] === "Low"
        ).length,

        out_of_sla_count: analysedRows.filter(
            (row) => row["SLA"] === "Out of SLA"
        ).length,

        within_sla_count: analysedRows.filter(
            (row) => row["SLA"] === "Within SLA"
        ).length,

        vv_count: vvRows.length,

        ve_count: veRows.length,

        vv_summary: vvSummary,

        ve_summary: veSummary,
    };

    return {
        summary,
        vulnerabilities: finalRows,
    };
}