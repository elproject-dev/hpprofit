import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toast"
import { BottomNav } from "@/components/bottom-nav"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 50)",
          "--header-height": "calc(var(--spacing) * 9)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="sticky top-0 z-[100] w-full h-0 pointer-events-none relative">
          <Toaster />
        </div>
        <SiteHeader />
        <div className="flex flex-1 flex-col pb-16 md:pb-0">
          {children}
        </div>
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
