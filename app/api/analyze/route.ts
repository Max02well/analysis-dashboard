import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { analyzeWorkbook } from "@/lib/pvmg-analysis";

export const runtime = 'nodejs';

// File that lives in the project root and can be analysed with one click
const DEFAULT_FILE = 'IT Infra Vulns Sep_27.xlsx';

export async function POST(request: Request) {
    // let inputPath = '';
    // let outputPath = '';

    // try {
    //     const formData = await request.formData();
    //     const file = formData.get('file') as File;

    //     if (!file) {
    //         return NextResponse.json({ error: 'No Excel file uploaded.' }, { status: 400 });
    //     }

    //     // Ensure temporary processing directory exists
    //     const tmpDir = path.join(process.cwd(), 'tmp');
    //     if (!fs.existsSync(tmpDir)) {
    //         fs.mkdirSync(tmpDir, { recursive: true });
    //     }

    //     const timestamp = Date.now();
    //     const inputPath = path.join(tmpDir, `upload_${timestamp}.xlsx`);
    //     const outputPath = path.join(tmpDir, `processed_${timestamp}.csv`);

    //     // Write file stream to tmp directory
    //     const bytes = await file.arrayBuffer();
    //     fs.writeFileSync(inputPath, Buffer.from(bytes));

    //     const scriptPath = path.join(process.cwd(), 'scripts', 'pvmg_analysis.py');

    //     // Spawn Python script seamlessly using `uv run python`
    //     const pyOutput = await new Promise<string>((resolve, reject) => {
    //         execFile('uv', ['run', 'python', scriptPath, inputPath, outputPath], (error, stdout, stderr) => {
    //             if (error) {
    //                 reject(stderr || error.message);
    //                 return;
    //             }
    //             resolve(stdout);
    //         });
    //     });

    //     const summary = JSON.parse(pyOutput.trim());

    //     // Read generated CSV and convert to JSON array
    //     let records: Record<string, string>[] = [];
    //     if (fs.existsSync(outputPath)) {
    //         const csvContent = fs.readFileSync(outputPath, 'utf-8');
    //         records = parse(csvContent, {
    //             columns: true,
    //             skip_empty_lines: true,
    //         });
    //     }

    //     // Clean up temporary files
    //     if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    //     if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    //     return NextResponse.json({
    //         success: true,
    //         summary,
    //         vulnerabilities: records,
    //     });
    // } catch (err: unknown) {
    //     const errorMessage = err instanceof Error ? err.message : 'Execution failed';
    //     return NextResponse.json({ error: errorMessage }, { status: 500 });
    // }

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const useDefault = formData.get('useDefault') === 'true';

        let buffer: Buffer;
        let sourceName: string;

        //local run
        // const tmpDir = path.join(process.cwd(), 'tmp');
        // fs.mkdirSync(tmpDir, { recursive: true });

        // const timestamp = Date.now();
        // inputPath = path.join(tmpDir, `upload_${timestamp}.xlsx`);
        // outputPath = path.join(tmpDir, `processed_${timestamp}.csv`);

        // let sourceName: string;

        if (file instanceof File && file.size > 0) {
            // Option 1: user-selected file
            // fs.writeFileSync(inputPath, Buffer.from(await file.arrayBuffer()));
            //-->new :prod
            buffer = Buffer.from(
                await file.arrayBuffer()
            );
            sourceName = file.name;
        } else if (useDefault) {
            // Option 2: file already in the project root.
            // IMPORTANT: copy it first. pvmg_analysis.py rewrites the workbook it is
            // given (ExcelWriter mode='w'), so running on the original would overwrite it.
            const defaultPath = path.join(process.cwd(), DEFAULT_FILE);
            if (!fs.existsSync(defaultPath)) {
                return NextResponse.json(
                    { success: false, error: `Default file "${DEFAULT_FILE}" not found in project root.` },
                    { status: 404 }
                );
            }
            // fs.copyFileSync(defaultPath, inputPath);
            //new:prod
            buffer = fs.readFileSync(defaultPath);
            sourceName = DEFAULT_FILE;
        } else {
            return NextResponse.json(
                { success: false, error: 'No Excel file uploaded and no default file requested.' },
                { status: 400 }
            );
        }
        //Local analysis
        // const scriptPath = path.join(process.cwd(), 'scripts', 'pvmg_analysis.py');

        // const pyOutput = await new Promise<string>((resolve, reject) => {
        //     execFile(
        //         'uv',
        //         ['run', 'python', scriptPath, inputPath, outputPath],
        //         { maxBuffer: 20 * 1024 * 1024, timeout: 120_000 },
        //         (error, stdout, stderr) => {
        //             if (error) return reject(new Error(stderr || error.message));
        //             resolve(stdout);
        //         }
        //     );
        // });

        // // Take the last non-empty line so stray library warnings on stdout can't break JSON.parse
        // const lastLine = pyOutput.trim().split('\n').filter(Boolean).pop() ?? '{}';
        // const summary = JSON.parse(lastLine);
        // if (summary.error) {
        //     return NextResponse.json({ success: false, error: summary.error }, { status: 400 });
        // }

        // let records: Record<string, string>[] = [];
        // if (fs.existsSync(outputPath)) {
        //     records = parse(fs.readFileSync(outputPath, 'utf-8'), {
        //         columns: true,
        //         skip_empty_lines: true,
        //     });
        // }

        //prod analysis --JS
        /**
         * ---------------------------------------------------------
         * Production analysis
         *
         * Everything happens in memory.
         *
         * No:
         *   - /tmp
         *   - Python
         *   - uv
         *   - execFile
         *   - generated CSV
         * ---------------------------------------------------------
         */
        const result = analyzeWorkbook(buffer);

        return NextResponse.json({ success: true, sourceName, summary: result.summary, vulnerabilities: result.vulnerabilities });
    } catch (err: unknown) {
        console.error("Vulnerability analysis failed:", err);
        const message = err instanceof Error ? err.message : 'Analysis failed';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
        // } finally {
        //     // for (const p of [inputPath, outputPath]) {
        //     //     if (p && fs.existsSync(p)) fs.unlinkSync(p);
        //     // }
        //     //prod
        //     // Clean up any temporary files or resources

    }
}