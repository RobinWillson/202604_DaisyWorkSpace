"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Menu } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  // Simple Breadcrumb logic
  const getBreadcrumbs = () => {
    if (pathname === "/") return "Overview";
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")).join(" / ");
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0a0a0a]/70 border-b border-white/5 flex items-center justify-between px-6 h-16 transition-all">
      <div className="flex items-center gap-4">
        {/* Mobile menu button (hidden on lg) */}
        <button className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white rounded-md bg-white/5">
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Breadcrumbs */}
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Workspace</span>
          <h1 className="text-lg font-semibold text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            {getBreadcrumbs()}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative group hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-64 pl-10 pr-3 py-2 border border-white/10 rounded-full leading-5 bg-[#141414]/80 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-[#1a1a1a] transition-all sm:text-sm"
            placeholder="Search across workspace (Cmd+K)"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-full transition-colors group">
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-[#0a0a0a]"></span>
        </button>
      </div>
    </header>
  );
}
