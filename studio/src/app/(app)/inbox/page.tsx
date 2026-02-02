import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox as InboxIcon } from "lucide-react";

export default function InboxPage() {
  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Inbox</h1>
          <p className="text-muted-foreground">Your unified communication hub.</p>
        </div>
      
      <Card className="flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <InboxIcon className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Unified Inbox Coming Soon</CardTitle>
          <CardDescription>
            Email, WhatsApp, SMS, and call logs all in one place, with AI-powered summaries.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
