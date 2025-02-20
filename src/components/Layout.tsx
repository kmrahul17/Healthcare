
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, FileText, Calendar, Search, History, Settings, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: FileText, label: "Health Records", href: "/records" },
  { icon: Calendar, label: "Appointments", href: "/appointments" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: History, label: "History", href: "/history" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="px-6 py-4">
            <h1 className="text-xl font-semibold text-primary">HealthHub</h1>
          </SidebarHeader>
          <SidebarContent>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center px-6 py-3 text-sm transition-colors",
                    "hover:bg-gray-100 hover:text-primary",
                    "rounded-lg mx-2",
                    window.location.pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </a>
              ))}
            </nav>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8">
            <SidebarTrigger />
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <UserRound className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
