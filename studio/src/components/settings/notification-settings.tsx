'use client';

import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Briefcase, CheckSquare, Mail, Sparkles, Smartphone, ShieldAlert } from "lucide-react";

export default function NotificationSettings() {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);

    // Initialize state from user preferences
    useEffect(() => {
        if (user && user.notificationPreferences) {
            setPreferences(user.notificationPreferences);
        }
    }, [user]);

    const handleToggle = (id: string, checked: boolean) => {
        setPreferences((prev: Record<string, any>) => ({ ...prev, [id]: checked }));
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { updateUser } = await import('@/lib/api');
            await updateUser(user.id, { notificationPreferences: preferences });
            alert("Preferences saved!");
        } catch (error) {
            console.error("Failed to save preferences", error);
            alert("Failed to save preferences");
        } finally {
            setLoading(false);
        }
    };

    const deliveryChannels = [
        { id: 'in-app', label: 'In-app', icon: Bell },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'push', label: 'Push', icon: Smartphone },
    ] as const;

    // Helper to get checked state safely
    const isChecked = (key: string, defaultVal = true) => {
        return preferences[key] !== undefined ? preferences[key] : defaultVal;
    }

    // Wrapped Item to avoid prop drilling complex state
    const InteractiveItem = ({ id, label, description, channels, isCritical = false }: any) => (
        <div className="flex flex-col sm:flex-row items-start justify-between rounded-lg border p-4 hover:bg-muted/50">
            <div className="flex items-start gap-4">
                <Switch
                    id={id}
                    checked={isChecked(id)}
                    onCheckedChange={(c) => handleToggle(id, c)}
                    disabled={isCritical}
                    className="mt-1"
                />
                <div className="grid gap-1.5">
                    <Label htmlFor={id} className="font-semibold">{label}</Label>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0 ml-10 sm:ml-0">
                {channels.map((channel: any) => (
                    <div key={channel.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={`${id}-${channel.id}`}
                            checked={isChecked(`${id}-${channel.id}`)}
                            onCheckedChange={(c) => handleToggle(`${id}-${channel.id}`, !!c)}
                            disabled={isCritical && channel.id === 'in-app'}
                        />
                        <Label htmlFor={`${id}-${channel.id}`} className="flex items-center gap-2 text-sm font-normal">
                            <channel.icon className="h-4 w-4 text-muted-foreground" />
                            {channel.label}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Notifications</CardTitle>
                <CardDescription>Control what notifications you receive, and how you receive them.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Section for Tasks & Follow-ups */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CheckSquare className="h-5 w-5" /> Tasks & Follow-ups
                    </h3>
                    <div className="space-y-4">
                        <InteractiveItem
                            id="task-assigned"
                            label="Task Assigned"
                            description="When a new task is assigned to you."
                            channels={deliveryChannels}
                        />
                        <InteractiveItem
                            id="task-due"
                            label="Task Due"
                            description="On the day a task is due."
                            channels={deliveryChannels}
                        />
                        <InteractiveItem
                            id="follow-up-overdue"
                            label="Follow-up Overdue"
                            description="When a scheduled follow-up becomes overdue."
                            channels={deliveryChannels}
                        />
                    </div>
                </div>

                {/* Section for Leads & Deals */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Briefcase className="h-5 w-5" /> Leads & Deals
                    </h3>
                    <div className="space-y-4">
                        <InteractiveItem
                            id="lead-assigned"
                            label="New Lead Assigned"
                            description="When a new lead is assigned to you manually or automatically."
                            channels={deliveryChannels}
                        />
                        <InteractiveItem
                            id="deal-at-risk"
                            label="Deal at Risk"
                            description="When a deal you own is flagged as 'at risk' by the system."
                            channels={deliveryChannels}
                        />
                    </div>
                </div>

                {/* Section for AI & Automation */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5" /> AI & Automation
                    </h3>
                    <div className="space-y-4">
                        <InteractiveItem
                            id="ai-recommendation"
                            label="AI Recommendation Available"
                            description="When the AI has a new suggestion for one of your leads or deals."
                            channels={deliveryChannels}
                        />
                        <InteractiveItem
                            id="automation-failed"
                            label="Automation Failed"
                            description="When an automation workflow that impacts you fails to run."
                            channels={deliveryChannels}
                        />
                    </div>
                </div>

                {/* Section for System & Security */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5" /> System & Security
                    </h3>
                    <div className="space-y-4">
                        <InteractiveItem
                            id="security-alert"
                            label="Critical Security Alert"
                            description="For important security events like password changes or new device logins."
                            channels={deliveryChannels}
                            isCritical={true}
                        />
                    </div>
                </div>

            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end">
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
            </CardFooter>
        </Card>
    );
}
