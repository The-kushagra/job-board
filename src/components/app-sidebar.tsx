import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  Plus,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";
import { OrganizationTable, OrganizationUserSettingsTable, UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function AppSidebar() {
  const { userId } = await auth();
  
  let organizations: { id: string, name: string }[] = []
  
  try {
    if (userId) {
      const user = await db.query.UserTable.findFirst({
        where: eq(UserTable.id, userId),
        with: {
          organizationUserSettings: {
            with: {
              organization: true
            }
          }
        }
      })
      
      if (user?.organizationUserSettings) {
        organizations = user.organizationUserSettings
          .map(ous => ous.organization)
          .filter((org): org is { id: string; name: string; imageUrl: string; createdAt: Date; updatedAt: Date } => !!org)
      }
    }
  } catch (error) {
    console.error("SIDEBAR QUERY ERROR:", error)
  }

  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Jobs Marketplace",
      url: "/jobs",
      icon: BriefcaseBusiness,
    },
    {
      title: "My Applications",
      url: "/applications",
      icon: Sparkles,
    },
  ];

  const secondaryItems = [
    {
      title: "Profile",
      url: "/user-profile",
      icon: User,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
            <BriefcaseBusiness className="size-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
            NextHire
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            Organizations
            <Link href="/organizations/new" className="hover:text-primary transition-colors">
              <Plus className="size-3" />
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {organizations.map((org) => (
                <SidebarMenuItem key={org.id}>
                  <SidebarMenuButton asChild tooltip={org.name}>
                    <Link href={`/organizations/${org.id}`}>
                      <Building2 className="size-4" />
                      <span>{org.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {organizations.length === 0 && (
                 <SidebarMenuItem>
                    <div className="px-2 py-1 text-xs text-muted-foreground italic">
                      No organizations yet
                    </div>
                 </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 p-4 group-data-[collapsible=icon]:p-2">
           <UserButton />
           <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
             <span className="text-sm font-medium">My Account</span>
             <span className="text-xs text-muted-foreground">Manage profile</span>
           </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
