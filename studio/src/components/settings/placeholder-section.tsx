import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface PlaceholderSectionProps {
    title: string;
    description: string;
    icon: LucideIcon;
}

export default function PlaceholderSection({ title, description, icon: Icon }: PlaceholderSectionProps) {
  return (
      <Card className="flex flex-col items-center justify-center text-center p-10 min-h-[400px] border-dashed">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
            <Icon className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="font-headline text-2xl">{title}</CardTitle>
          <CardDescription>
            {description} This section is under construction.
          </CardDescription>
        </CardHeader>
      </Card>
  );
}
