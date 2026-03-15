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
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/getUserRole";
import { ChatBot } from "@/components/ChatBot";
import { getUserOrganizations } from "@/server/actions/organizations";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const role = userId ? await getUserRole(userId) : 'candidate';

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  const organizations = await getUserOrganizations();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <SidebarProvider>
      <AppSidebar role={role} initialOrganizations={organizations} />
      <main className="flex-1 overflow-auto min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 sticky top-0 z-30 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard" className="capitalize text-slate-400 hover:text-white">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                {paths.length > 1 && <BreadcrumbSeparator className="text-slate-600" />}
                {paths.slice(1).map((path, index) => (
                  <div key={path} className="flex items-center gap-2">
                    <BreadcrumbItem>
                      <BreadcrumbPage className="capitalize max-w-[150px] truncate text-slate-200">
                        {path.replace(/-/g, " ")}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                    {index < paths.slice(1).length - 1 && <BreadcrumbSeparator className="text-slate-600" />}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="pt-6 md:pt-8 px-6 md:px-10 pb-10">{children}</div>
        <ChatBot role={role} />
      </main>
    </SidebarProvider>
  );
}
