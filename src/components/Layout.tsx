
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, FileText, Calendar, Search, History, UserRound, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: FileText, label: "Health Records", href: "/records" },
  { icon: Calendar, label: "Appointments", href: "/appointments" },
  {icon: FileText, label: "Documents", href:"/documents"},
  { icon: Search, label: "Search", href: "/search" },
  { icon: History, label: "History", href: "/history", description: "View your medical history, past appointments, and previous treatments" },
  { icon: UserRound, label: "Account", href: "/settings" },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="px-6 py-4">
            <h1 className="text-xl font-semibold text-primary">HealthHub</h1>
          </SidebarHeader>
          <SidebarContent>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    "flex items-center px-6 py-3 text-sm transition-colors group relative",
                    "hover:bg-accent hover:text-primary",
                    "rounded-lg mx-2",
                    location.pathname === item.href
                      ? "bg-accent text-primary font-medium"
                      : "text-foreground/60"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                  {item.description && (
                    <div className="absolute left-full ml-2 w-48 p-2 bg-popover rounded-md shadow-md invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  )}
                </Link>
              ))}
            </nav>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-16 border-b border-border bg-background flex items-center justify-between px-8">
            <SidebarTrigger />
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-foreground/60" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
              </Button>
              <Button variant="ghost" size="icon">
                <UserRound className="h-5 w-5 text-foreground/60" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-8 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
