"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Bot, User, Settings, LogOut, PieChart, Wallet } from "lucide-react";

import { supabase } from "@/lib/supabase";

const navItems = [
  { href: "/dashboard", label: "Panel Inicial", icon: LayoutDashboard },
  { href: "/dashboard/transacciones", label: "Ingresos y Gastos", icon: Wallet },
  { href: "/dashboard/asesor", label: "Asesor IA", icon: Bot },
  { href: "/dashboard/cartera", label: "Inversiones", icon: PieChart },
  { href: "/dashboard/perfil", label: "Perfil Pro", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <aside className="w-64 border-r border-white/10 glass hidden md:flex flex-col shrink-0">
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 leading-tight">
              Financial AI
            </span>
            <span className="text-xs font-normal text-white/40 uppercase tracking-wider">Advisor</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive
                   ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                   : "text-white/50 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-red-400 w-full transition-colors rounded-xl hover:bg-red-500/10 text-left font-medium"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
