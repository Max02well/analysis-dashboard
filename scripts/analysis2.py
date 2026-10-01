import pandas as pd

# Load the Excel file
# file_path = "Fintech 2.0 N_Asset_List Vulns.xlsx"
file_path = "IT Infra Vulns Sep_27.xlsx"
df = pd.read_excel(file_path, sheet_name=0, engine='openpyxl')

# Convert serial dates to datetime format
for column in ['Vulnerable Since', 'Vulnerability Test Date']:
    if column in df.columns:
        df[column] = pd.to_datetime(df[column], origin='1899-12-30', unit='D', errors='coerce')

# Add Severity column
def calculate_severity(row):
    score = row.get('Vulnerability CVSSv3 Score', 0)
    if score == 0 or pd.isnull(score):
        score = row.get('Vulnerability CVSS Score', 0)
    if 9 <= score <= 10:
        return "Critical"
    elif 7 <= score < 9:
        return "High"
    elif 4 <= score < 7:
        return "Medium"
    elif 0 <= score < 4:
        return "Low"
    else:
        return ""

df['Severity'] = df.apply(calculate_severity, axis=1)

# Insert Severity before 'Service Name'
cols = df.columns.tolist()
if 'Service Name' in cols:
    service_index = cols.index('Service Name')
    cols = cols[:service_index] + ['Severity'] + cols[service_index:]
    cols = list(dict.fromkeys(cols))  # Remove duplicates
    df = df[cols]

# Add SLA column
def calculate_sla(row):
    vs = row.get('Vulnerable Since')
    vtd = row.get('Vulnerability Test Date')
    code = row.get('Vulnerability Test Result Code', '')
    if pd.isnull(vs) or pd.isnull(vtd):
        return ""
    age = (vtd - vs).days
    if code == "vv":
        return "Within SLA" if age < 60 else "Out of SLA"
    else:
        return "Within SLA" if age < 30 else "Out of SLA"

df['SLA'] = df.apply(calculate_sla, axis=1)

# Insert SLA after 'Vulnerability Age'
if 'Vulnerability Age' in df.columns:
    age_index = df.columns.get_loc('Vulnerability Age') + 1
    cols = df.columns.tolist()
    cols = cols[:age_index] + ['SLA'] + cols[age_index:]
    cols = list(dict.fromkeys(cols))  # Remove duplicates
    df = df[cols]

# Format dates to short date format
df['Vulnerable Since'] = df['Vulnerable Since'].dt.strftime('%Y-%m-%d')
df['Vulnerability Test Date'] = df['Vulnerability Test Date'].dt.strftime('%Y-%m-%d')

# Create filtered sheet for Critical & High severity
filtered_df = df[df['Severity'].isin(['Critical', 'High'])]

# Create VV and VE sheets from filtered data
vv_df = filtered_df[filtered_df['Vulnerability Test Result Code'].str.contains('vv', na=False)]
ve_df = filtered_df[filtered_df['Vulnerability Test Result Code'].str.contains('ve', na=False)]

# Create summary tables with 'sev' column
ve_summary = ve_df.groupby(['SLA', 'Severity'])['Vulnerability Title'].nunique().reset_index()
ve_summary.columns = ['SLA', 'sev', 'Unique Vulnerability Title Count']

vv_summary = vv_df.groupby(['SLA', 'Severity'])['Vulnerability Title'].nunique().reset_index()
vv_summary.columns = ['SLA', 'sev', 'Unique Vulnerability Title Count']

# Save all sheets to the same file
with pd.ExcelWriter(file_path, engine='openpyxl', mode='w') as writer:
    df.to_excel(writer, sheet_name='All Vulns', index=False)
    filtered_df.to_excel(writer, sheet_name='Critical & High', index=False)
    vv_df.to_excel(writer, sheet_name='VV', index=False)
    ve_df.to_excel(writer, sheet_name='VE', index=False)
    vv_summary.to_excel(writer, sheet_name='VV Summary', index=False)
    ve_summary.to_excel(writer, sheet_name='VE Summary', index=False)
