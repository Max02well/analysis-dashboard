import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta

np.random.seed(42)

# Generate a detailed synthetic IT infrastructure vulnerability dataset
n = 500

assets = [
    ("FIN-APP-01", "10.20.1.10", "Linux", "Production", "Finance"),
    ("FIN-DB-01", "10.20.1.20", "Linux", "Production", "Finance"),
    ("CORE-DC-01", "10.20.2.10", "Windows Server", "Production", "Infrastructure"),
    ("CORE-DC-02", "10.20.2.11", "Windows Server", "Production", "Infrastructure"),
    ("WEB-PORTAL-01", "10.20.3.10", "Linux", "Production", "Digital"),
    ("WEB-PORTAL-02", "10.20.3.11", "Linux", "Production", "Digital"),
    ("API-GW-01", "10.20.3.20", "Linux", "Production", "Digital"),
    ("HR-APP-01", "10.20.4.10", "Windows Server", "Production", "HR"),
    ("HR-DB-01", "10.20.4.20", "Linux", "Production", "HR"),
    ("CRM-APP-01", "10.20.5.10", "Linux", "Production", "Customer"),
    ("CRM-DB-01", "10.20.5.20", "Linux", "Production", "Customer"),
    ("PAY-APP-01", "10.20.6.10", "Linux", "Production", "Payments"),
    ("PAY-DB-01", "10.20.6.20", "Linux", "Production", "Payments"),
    ("MON-01", "10.20.7.10", "Linux", "Production", "Operations"),
    ("BACKUP-01", "10.20.8.10", "Windows Server", "DR", "Infrastructure"),
    ("VPN-01", "10.20.9.10", "Linux", "Production", "Security"),
    ("MAIL-01", "10.20.10.10", "Linux", "Production", "Infrastructure"),
    ("JUMP-01", "10.20.11.10", "Windows Server", "Management", "Security"),
    ("DEV-APP-01", "10.20.12.10", "Linux", "Development", "Engineering"),
    ("DEV-DB-01", "10.20.12.20", "Linux", "Development", "Engineering"),
]

vulns = [
    ("CVE-2024-3094", "XZ Utils Backdoor Vulnerability", 10.0, "OpenSSH", "Remote Code Execution"),
    ("CVE-2024-6387", "OpenSSH regreSSHion Remote Code Execution", 8.1, "OpenSSH", "Remote Code Execution"),
    ("CVE-2023-34362", "MOVEit Transfer SQL Injection", 9.8, "MOVEit Transfer", "SQL Injection"),
    ("CVE-2023-23397", "Microsoft Outlook Privilege Escalation", 9.8, "Microsoft Outlook", "Privilege Escalation"),
    ("CVE-2023-4863", "libwebp Heap Buffer Overflow", 8.8, "libwebp", "Memory Corruption"),
    ("CVE-2024-21410", "Microsoft Exchange Privilege Escalation", 9.8, "Microsoft Exchange", "Privilege Escalation"),
    ("CVE-2024-21762", "FortiOS Out-of-Bounds Write", 9.8, "FortiOS", "Remote Code Execution"),
    ("CVE-2024-3400", "PAN-OS Command Injection", 10.0, "PAN-OS", "Command Injection"),
    ("CVE-2023-4966", "Citrix NetScaler Bleed", 9.4, "NetScaler", "Information Disclosure"),
    ("CVE-2022-22965", "Spring Framework RCE", 9.8, "Spring Framework", "Remote Code Execution"),
    ("CVE-2021-44228", "Apache Log4j Remote Code Execution", 10.0, "Apache Log4j", "Remote Code Execution"),
    ("CVE-2022-30190", "Microsoft Support Diagnostic Tool RCE", 7.8, "MSDT", "Remote Code Execution"),
    ("CVE-2023-4863", "WebP Buffer Overflow", 8.8, "WebP", "Buffer Overflow"),
    ("CVE-2022-1388", "F5 BIG-IP iControl REST RCE", 9.8, "F5 BIG-IP", "Remote Code Execution"),
    ("CVE-2021-26855", "Microsoft Exchange Server SSRF", 9.8, "Exchange Server", "SSRF"),
    ("CVE-2023-20198", "Cisco IOS XE Web UI Privilege Escalation", 10.0, "Cisco IOS XE", "Privilege Escalation"),
    ("CVE-2023-27997", "FortiOS SSL-VPN Heap-Based Buffer Overflow", 9.8, "FortiOS", "Buffer Overflow"),
    ("CVE-2020-1472", "Zerologon Privilege Escalation", 10.0, "Netlogon", "Privilege Escalation"),
    ("CVE-2022-41082", "Microsoft Exchange Server RCE", 8.8, "Exchange Server", "Remote Code Execution"),
    ("CVE-2023-22515", "Confluence Broken Access Control", 10.0, "Atlassian Confluence", "Privilege Escalation"),
    ("CVE-2024-23897", "Jenkins Arbitrary File Read", 9.8, "Jenkins", "File Disclosure"),
    ("CVE-2023-42793", "TeamCity Authentication Bypass", 9.8, "TeamCity", "Authentication Bypass"),
    ("CVE-2022-47966", "Zoho ManageEngine RCE", 9.8, "ManageEngine", "Remote Code Execution"),
    ("CVE-2021-44228", "Log4Shell Remote Code Execution", 10.0, "Apache Log4j", "Remote Code Execution"),
    ("CVE-2024-4577", "PHP CGI Argument Injection", 9.8, "PHP", "Command Injection"),
    ("CVE-2023-44487", "HTTP/2 Rapid Reset Attack", 7.5, "HTTP/2", "Denial of Service"),
    ("CVE-2023-4911", "GNU C Library Looney Tunables", 7.8, "glibc", "Privilege Escalation"),
    ("CVE-2024-21619", "Jenkins Deserialization Vulnerability", 8.8, "Jenkins", "Deserialization"),
    ("CVE-2023-35078", "Ivanti EPMM Authentication Bypass", 10.0, "Ivanti EPMM", "Authentication Bypass"),
    ("CVE-2024-1709", "ConnectWise ScreenConnect Authentication Bypass", 10.0, "ScreenConnect", "Authentication Bypass"),
]

services = [
    "Web Application", "Database", "API Gateway", "Directory Services",
    "Email Service", "VPN Service", "File Service", "Monitoring",
    "Backup Service", "Authentication Service", "Network Management",
    "Application Server", "Container Platform", "Remote Access"
]

test_codes = ["vv", "vv", "vv", "vv", "ve", "ve", "ve"]
statuses = ["Open", "Open", "Open", "In Progress", "Remediated", "Accepted Risk"]
owners = [
    "Infrastructure Team", "Cybersecurity Team", "Application Support",
    "Database Team", "Network Team", "DevOps Team", "IT Operations"
]

base_date = datetime(2026, 9, 27)

rows = []
for i in range(n):
    asset = assets[i % len(assets)]
    vuln = vulns[np.random.randint(len(vulns))]
    cve, title, base_score, product, vuln_type = vuln

    # Make some records use CVSS v2/fallback and some have missing scores
    mode = np.random.choice(["v3", "fallback", "missing"], p=[0.78, 0.17, 0.05])
    cvss_v3 = round(base_score + np.random.choice([0, 0, 0, -0.1, 0.1]), 1)
    cvss_v3 = max(0, min(10, cvss_v3))

    if mode == "v3":
        v3_score = cvss_v3
        legacy_score = np.nan
    elif mode == "fallback":
        v3_score = 0
        legacy_score = round(max(0, min(10, base_score - np.random.choice([0, 0.1, 0.2]))), 1)
    else:
        v3_score = np.nan
        legacy_score = np.nan

    # Create ages deliberately around SLA thresholds:
    # VV: <60 = within; >=60 = out
    # VE: <30 = within; >=30 = out
    code = np.random.choice(test_codes)
    if code == "vv":
        age = int(np.random.choice(
            list(range(1, 30)) + list(range(30, 59)) +
            [59, 60, 61, 62, 75, 90, 120, 180, 240]
        ))
    else:
        age = int(np.random.choice(
            list(range(1, 20)) + [27, 28, 29, 30, 31, 32, 45, 60, 90, 120]
        ))

    test_date = base_date - timedelta(days=np.random.randint(0, 5))
    vulnerable_since = test_date - timedelta(days=age)

    # Add some missing dates to exercise the script's null handling
    if i in {17, 83, 167, 299, 421}:
        vulnerable_since_value = pd.NaT
        vulnerability_age = np.nan
    else:
        vulnerable_since_value = vulnerable_since
        vulnerability_age = age

    if i in {41, 141, 241, 341, 441}:
        test_date_value = pd.NaT
    else:
        test_date_value = test_date

    rows.append({
        "Asset Name": asset[0],
        "Asset IP Address": asset[1],
        "Operating System": asset[2],
        "Environment": asset[3],
        "Business Unit": asset[4],
        "Vulnerability ID": cve,
        "Vulnerability Title": title,
        "Vulnerability Description": (
            f"Synthetic test record for {title}. "
            f"Detected on {asset[0]} affecting {product}. "
            f"Vulnerability category: {vuln_type}."
        ),
        "Vulnerability CVSSv3 Score": v3_score,
        "Vulnerability CVSS Score": legacy_score,
        "Vulnerability Test Result Code": code,
        "Vulnerability Test Result": (
            "Vulnerable" if code == "vv" else "Vulnerable/Exposed"
        ),
        "Vulnerable Since": vulnerable_since_value,
        "Vulnerability Test Date": test_date_value,
        "Vulnerability Age": vulnerability_age,
        "Service Name": services[np.random.randint(len(services))],
        "Service Port": int(np.random.choice([22, 25, 53, 80, 110, 143, 443, 445, 8080, 8443, 3306, 5432, 6379])),
        "Product / Technology": product,
        "Vulnerability Type": vuln_type,
        "Remediation Status": np.random.choice(statuses),
        "Vulnerability Owner": np.random.choice(owners),
        "Asset Criticality": np.random.choice(["Critical", "High", "Medium"], p=[0.35, 0.45, 0.20]),
        "First Detected By": np.random.choice(["Authenticated Scan", "External Scan", "Internal Scan", "Agent"]),
        "Scanner": np.random.choice(["Tenable", "Qualys", "Nessus", "Rapid7"]),
        "Reference": cve,
    })

df = pd.DataFrame(rows)

# Make dates actual Excel dates
df["Vulnerable Since"] = pd.to_datetime(df["Vulnerable Since"])
df["Vulnerability Test Date"] = pd.to_datetime(df["Vulnerability Test Date"])

# Calculate the same fields as the user's analysis
def calculate_severity(row):
    score = row.get("Vulnerability CVSSv3 Score", 0)
    if pd.isnull(score) or score == 0:
        score = row.get("Vulnerability CVSS Score", 0)
    if pd.isnull(score):
        score = 0
    if 9 <= score <= 10:
        return "Critical"
    elif 7 <= score < 9:
        return "High"
    elif 4 <= score < 7:
        return "Medium"
    elif 0 <= score < 4:
        return "Low"
    return ""

df["Severity"] = df.apply(calculate_severity, axis=1)

def calculate_sla(row):
    vs = row["Vulnerable Since"]
    vtd = row["Vulnerability Test Date"]
    code = row["Vulnerability Test Result Code"]
    if pd.isnull(vs) or pd.isnull(vtd):
        return ""
    age = (vtd - vs).days
    return "Within SLA" if age < (60 if code == "vv" else 30) else "Out of SLA"

df["SLA"] = df.apply(calculate_sla, axis=1)

# Arrange fields so they match the user's script's expectations
preferred = [
    "Asset Name", "Asset IP Address", "Operating System", "Environment",
    "Business Unit", "Vulnerability ID", "Vulnerability Title",
    "Vulnerability Description", "Vulnerability CVSSv3 Score",
    "Vulnerability CVSS Score", "Vulnerability Test Result Code",
    "Vulnerability Test Result", "Vulnerable Since",
    "Vulnerability Test Date", "Vulnerability Age", "SLA", "Severity",
    "Service Name", "Service Port", "Product / Technology",
    "Vulnerability Type", "Remediation Status", "Vulnerability Owner",
    "Asset Criticality", "First Detected By", "Scanner", "Reference"
]
df = df[preferred]

filtered_df = df[df["Severity"].isin(["Critical", "High"])].copy()
vv_df = filtered_df[filtered_df["Vulnerability Test Result Code"].str.contains("vv", na=False)].copy()
ve_df = filtered_df[filtered_df["Vulnerability Test Result Code"].str.contains("ve", na=False)].copy()

vv_summary = (
    vv_df.groupby(["SLA", "Severity"])["Vulnerability Title"]
    .nunique().reset_index()
    .rename(columns={"Severity": "sev", "Vulnerability Title": "Unique Vulnerability Title Count"})
)
ve_summary = (
    ve_df.groupby(["SLA", "Severity"])["Vulnerability Title"]
    .nunique().reset_index()
    .rename(columns={"Severity": "sev", "Vulnerability Title": "Unique Vulnerability Title Count"})
)

# Add an analysis guide sheet so the workbook is self-explanatory.
guide = pd.DataFrame({
    "Field / Sheet": [
        "All Vulns", "Critical & High", "VV", "VE",
        "VV Summary", "VE Summary", "Severity", "SLA"
    ],
    "Purpose": [
        "Complete synthetic vulnerability dataset with 500 records.",
        "Critical and High vulnerabilities only.",
        "Critical/High records whose test result code contains VV.",
        "Critical/High records whose test result code contains VE.",
        "Unique vulnerability-title counts grouped by SLA and severity for VV.",
        "Unique vulnerability-title counts grouped by SLA and severity for VE.",
        "Derived from CVSSv3; if missing/zero, CVSS Score is used.",
        "VV threshold is 60 days; VE threshold is 30 days."
    ]
})

output_path = Path("/mnt/data/IT_Infra_Vulns_Synthetic_Analysis.xlsx")

with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
    df.to_excel(writer, sheet_name="All Vulns", index=False)
    filtered_df.to_excel(writer, sheet_name="Critical & High", index=False)
    vv_df.to_excel(writer, sheet_name="VV", index=False)
    ve_df.to_excel(writer, sheet_name="VE", index=False)
    vv_summary.to_excel(writer, sheet_name="VV Summary", index=False)
    ve_summary.to_excel(writer, sheet_name="VE Summary", index=False)
    guide.to_excel(writer, sheet_name="Analysis Guide", index=False)

    # Professional workbook formatting
    from openpyxl import load_workbook
    from openpyxl.styles import Font, PatternFill, Alignment
    from openpyxl.utils import get_column_letter
    from openpyxl.worksheet.table import Table, TableStyleInfo

    wb = writer.book

    for ws in wb.worksheets:
        ws.freeze_panes = "A2"
        ws.auto_filter.ref = ws.dimensions

        # Header formatting
        for cell in ws[1]:
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = PatternFill("solid", fgColor="1F4E78")
            cell.alignment = Alignment(horizontal="center", vertical="center")

        # Widths
        for col_cells in ws.columns:
            max_len = max(
                len(str(c.value)) if c.value is not None else 0
                for c in col_cells[:100]
            )
            ws.column_dimensions[get_column_letter(col_cells[0].column)].width = min(max(max_len + 2, 12), 45)

        # Dates
        for row in ws.iter_rows():
            for cell in row:
                if cell.column in [
                    ws[1].index(next((x for x in ws[1] if x.value == "Vulnerable Since"), ws[1][0])) + 1
                    if any(x.value == "Vulnerable Since" for x in ws[1]) else -1,
                    ws[1].index(next((x for x in ws[1] if x.value == "Vulnerability Test Date"), ws[1][0])) + 1
                    if any(x.value == "Vulnerability Test Date" for x in ws[1]) else -1
                ]:
                    cell.number_format = "yyyy-mm-dd"

        # Wrap long text
        for row in ws.iter_rows():
            for cell in row:
                if isinstance(cell.value, str) and len(cell.value) > 50:
                    cell.alignment = Alignment(wrap_text=True, vertical="top")

        # Add Excel table for data sheets
        if ws.title not in ["Analysis Guide"] and ws.max_row > 1:
            ref = f"A1:{get_column_letter(ws.max_column)}{ws.max_row}"
            table_name = "Tbl" + "".join(c for c in ws.title if c.isalnum())
            table = Table(displayName=table_name[:250], ref=ref)
            table.tableStyleInfo = TableStyleInfo(
                name="TableStyleMedium2",
                showFirstColumn=False,
                showLastColumn=False,
                showRowStripes=True,
                showColumnStripes=False
            )
            ws.add_table(table)

    # Set useful tab colors
    colors = {
        "All Vulns": "1F4E78",
        "Critical & High": "C00000",
        "VV": "ED7D31",
        "VE": "70AD47",
        "VV Summary": "FFC000",
        "VE Summary": "5B9BD5",
        "Analysis Guide": "7F7F7F"
    }
    for name, color in colors.items():
        wb[name].sheet_properties.tabColor = color

    wb.save(output_path)

# Return useful generation statistics
stats = {
    "file": str(output_path),
    "records": len(df),
    "critical": int((df["Severity"] == "Critical").sum()),
    "high": int((df["Severity"] == "High").sum()),
    "medium": int((df["Severity"] == "Medium").sum()),
    "low": int((df["Severity"] == "Low").sum()),
    "within_sla": int((df["SLA"] == "Within SLA").sum()),
    "out_of_sla": int((df["SLA"] == "Out of SLA").sum()),
    "vv_records": len(vv_df),
    "ve_records": len(ve_df),
}
print(stats)
