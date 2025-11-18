"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Users } from "lucide-react";
import { getAdminSession, clearAdminSession } from "@/lib/auth";

export function AdminHeader() {
  const [admin, setAdmin] = useState<{ username: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const adminSession = getAdminSession();
    if (adminSession) {
      setAdmin({ username: adminSession.username });
    }
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    router.push("/login");
  };

  return (
    <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Admin Panel</h1>
              <p className="text-sm text-slate-400">Event & Prize Management System</p>
            </div>
            <div className="flex items-center gap-3">
              {admin && (
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{admin.username}</p>
                  <p className="text-xs text-slate-400">Administrator</p>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex gap-2 border-t border-slate-700 pt-4">
            <Button
              variant={pathname === "/dashboard" ? "default" : "ghost"}
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={pathname === "/users" ? "default" : "ghost"}
              size="sm"
              onClick={() => router.push("/users")}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Users
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

