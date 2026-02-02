'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

export default function WorkspaceSettings() {
    const [config, setConfig] = useState({
        name: 'ApexAI Inc.',
        timezone: 'utc-5',
        currency: 'usd'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { fetchSettings } = await import('@/lib/api');
            const data = await fetchSettings('workspace_global');
            if (data && Object.keys(data).length > 0) {
                setConfig(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error("Failed to load workspace settings", error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { saveSettings } = await import('@/lib/api');
            await saveSettings('workspace_global', config);
            // toast.success("Workspace settings saved");
            alert("Workspace settings saved!");
        } catch (error) {
            console.error("Failed to save settings", error);
            alert("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Workspace</CardTitle>
                <CardDescription>Manage your organization's general settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                        id="workspace-name"
                        value={config.name}
                        onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select value={config.timezone} onValueChange={(val) => setConfig({ ...config, timezone: val })}>
                            <SelectTrigger id="timezone">
                                <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="utc-8">(UTC-08:00) Pacific Time</SelectItem>
                                <SelectItem value="utc-7">(UTC-07:00) Mountain Time</SelectItem>
                                <SelectItem value="utc-6">(UTC-06:00) Central Time</SelectItem>
                                <SelectItem value="utc-5">(UTC-05:00) Eastern Time</SelectItem>
                                <SelectItem value="utc+5.5">(UTC+05:30) Indian Standard Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currency">Default Currency</Label>
                        <Select value={config.currency} onValueChange={(val) => setConfig({ ...config, currency: val })}>
                            <SelectTrigger id="currency">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="usd">USD - US Dollar</SelectItem>
                                <SelectItem value="eur">EUR - Euro</SelectItem>
                                <SelectItem value="gbp">GBP - British Pound</SelectItem>
                                <SelectItem value="inr">INR - Indian Rupee</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end">
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </CardFooter>
        </Card>
    );
}
