import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { headers } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Basic breadcrumb generation logic
  const paths = pathname.split("/").filter(Boolean);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto bg-zinc-50/50 dark:bg-zinc-950/50 min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 sticky top-0 bg-background/80 backdrop-blur-md z-30 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard" className="capitalize">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                {paths.length > 1 && <BreadcrumbSeparator />}
                {paths.slice(1).map((path, index) => (
                  <div key={path} className="flex items-center gap-2">
                    <BreadcrumbItem>
                      <BreadcrumbPage className="capitalize max-w-[150px] truncate">
                        {path.replace(/-/g, " ")}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                    {index < paths.slice(1).length - 1 && <BreadcrumbSeparator />}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </SidebarProvider>
  );
}
