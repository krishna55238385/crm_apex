"use client";

import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function ImportLeadsSheet({ children, onSuccess }: { children: React.ReactNode, onSuccess?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setError(null);

        // Basic CSV Parsing
        const text = await selectedFile.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const parsed = lines.slice(1).filter(l => l.trim()).map(line => {
            const values = line.split(',');
            const entry: any = {};
            headers.forEach((header, index) => {
                // Basic sanitization
                if (['name', 'email', 'company', 'phone'].includes(header)) {
                    entry[header] = values[index]?.trim();
                }
            });
            return entry;
        }).filter(p => p.name && p.email); // Filter invalid rows

        setPreview(parsed);
    };

    const handleImport = async () => {
        if (!preview.length) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/leads/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leads: preview })
            });

            if (!res.ok) throw new Error('Failed to import leads');

            setOpen(false);
            setFile(null);
            setPreview([]);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to import');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Import Leads (CSV)</SheetTitle>
                    <SheetDescription>
                        Upload a CSV file with headers: <code>name, company, email, phone</code>.
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-4 py-8">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="csv">CSV File</Label>
                        <Input id="csv" type="file" accept=".csv" onChange={handleFileChange} />
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {error}
                        </div>
                    )}

                    {preview.length > 0 && (
                        <div className="rounded-md border p-3 bg-muted/20">
                            <p className="text-sm font-medium mb-2 flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Ready to import {preview.length} leads
                            </p>
                            <div className="text-xs text-muted-foreground whitespace-pre-wrap max-h-[100px] overflow-auto">
                                {preview.slice(0, 3).map((l, i) =>
                                    `${i + 1}. ${l.name} (${l.company})`
                                ).join('\n')}
                                {preview.length > 3 && `\n...and ${preview.length - 3} more`}
                            </div>
                        </div>
                    )}
                </div>

                <SheetFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleImport} disabled={!preview.length || loading}>
                        {loading ? 'Importing...' : 'Import Leads'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
