import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import AiAssistantWidget from '@/components/ai-assistant-widget';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SocketProvider } from "@/providers/socket-provider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SocketProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-0 min-w-0">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
        <AiAssistantWidget />
      </SidebarProvider>
    </SocketProvider>
  );
}
