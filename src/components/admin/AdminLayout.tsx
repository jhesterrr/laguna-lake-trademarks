import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Inbox, CreditCard, Users,
  MessageSquare, Settings, LogOut, ChevronRight,
  Menu, X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { inquiries, threads, subscribe, adminProfile, loadAdminData, setupRealtime } from "@/store/adminStore";
import { NotificationBell } from "./NotificationPanel";
import { supabase } from "@/lib/supabase";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/cases", label: "Cases", icon: Briefcase },
  { path: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { path: "/admin/payments", label: "Payments", icon: CreditCard },
  { path: "/admin/clients", label: "Clients", icon: Users },
  { path: "/admin/messages", label: "Messages", icon: MessageSquare },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, forceUpdate] = useState(0);

  // Subscribe to store for sidebar badge updates
  useEffect(() => {
    return subscribe(() => forceUpdate((v) => v + 1));
  }, []);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
      } else {
        setIsAuthenticated(true);
        loadAdminData();
      }
    };
    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        navigate("/admin/login");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      const cleanup = setupRealtime();
      return cleanup;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-20 flex items-center gap-3 px-5 border-b border-slate-100">
          <div className="w-14 h-14 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="Laguna Lake Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800 leading-tight">
              Laguna Lake
            </div>
            <div className="text-xs text-slate-500">Admin Portal</div>
          </div>
          <button
            className="lg:hidden ml-auto text-slate-400 hover:text-slate-600"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                {item.label}
                {item.label === "Messages" && threads.reduce((s,t)=>s+t.unreadCount,0) > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {threads.reduce((s,t)=>s+t.unreadCount,0)}
                  </span>
                )}
                {item.label === "Inquiries" && inquiries.filter(i=>i.status==="Pending").length > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {inquiries.filter(i=>i.status==="Pending").length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to Main Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
            <Link to="/admin/dashboard" className="hover:text-blue-600 transition-colors">
              Admin
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-800 font-medium">
              {navItems.find((i) => i.path === location.pathname)?.label ||
                "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-700">
                  {adminProfile.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700">
                  {adminProfile.name}
                </div>
                <div className="text-xs text-slate-400">Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
