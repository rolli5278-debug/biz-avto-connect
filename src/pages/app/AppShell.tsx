import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Users, ShoppingBag, ReceiptText, Settings } from "lucide-react";

import NavLink from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/auth/AuthProvider";

export default function AppShell() {
  const nav = useNavigate();
  const { email, role } = useAuth();

  const logout = async () => {
    await supabase.auth.signOut();
    nav("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="hidden w-64 border-r bg-card/30 p-4 md:block">
          <div className="mb-6">
            <div className="text-lg font-semibold">Biz Avto Connect</div>
            <div className="text-xs text-muted-foreground">{email ?? "—"} • {role ?? "—"}</div>
          </div>

          <nav className="space-y-1">
            <NavLink to="/app" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </NavLink>
            <NavLink to="/app/sales" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
              <ReceiptText className="h-4 w-4" /> Sales
            </NavLink>
            <NavLink to="/app/customers" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
              <Users className="h-4 w-4" /> Customers
            </NavLink>
            <NavLink to="/app/products" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
              <ShoppingBag className="h-4 w-4" /> Products
            </NavLink>
            <NavLink to="/app/settings" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
              <Settings className="h-4 w-4" /> Settings
            </NavLink>
          </nav>

          <div className="mt-6">
            <Button variant="outline" className="w-full gap-2" onClick={logout}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
