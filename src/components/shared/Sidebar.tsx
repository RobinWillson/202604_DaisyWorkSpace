"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CheckSquare, 
  BrainCircuit, 
  LineChart, 
  BarChart4, 
  Users, 
  ShoppingBag, 
  Settings,
  ChevronLeft
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "To-Do List", href: "/todo-list", icon: CheckSquare },
  { name: "Second Brain", href: "/second-brain", icon: BrainCircuit },
  { name: "TW Stocks", href: "/tw-stocks", icon: LineChart },
  { name: "US Stocks", href: "/us-stocks", icon: BarChart4 },
  { name: "Coaching", href: "/coaching", icon: Users },
  { name: "Ecom Analysis", href: "/ecom-analysis", icon: ShoppingBag },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside 
      className={cn(
        "relative flex flex-col h-full bg-[#111111]/80 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ease-in-out z-50",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 mb-4 mt-2">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
            <span className="font-bold text-lg text-white">D</span>
          </div>
          <div className={cn("flex flex-col transition-opacity duration-300", collapsed && "opacity-0 invisible")}>
            <span className="font-semibold text-zinc-100 tracking-wide text-sm">Daisy Workspace</span>
            <span className="text-xs text-zinc-500 font-medium">Modular Monolith</span>
          </div>
        </div>
      </div>

      {/* Collapse Button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-[#1c1c1c] border border-white/10 text-zinc-400 p-1 rounded-full hover:text-white hover:bg-zinc-800 transition-colors z-50 shadow-md"
      >
        <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300", collapsed && "rotate-180")} />
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
                isActive 
                  ? "bg-purple-500/10 text-purple-400 font-medium" 
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-full bg-purple-500 rounded-r-full" />
              )}
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-purple-400" : "text-zinc-500 group-hover:text-zinc-300 transition-colors")} />
              <span className={cn(
                "whitespace-nowrap transition-all duration-300 text-sm",
                collapsed ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
              )}>
                {item.name}
              </span>
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-zinc-800 text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap border border-white/10 shadow-xl z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile snippet at bottom */}
      <div className="p-4 mt-auto border-t border-white/10">
        <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Robin" alt="User" className="w-9 h-9 rounded-full bg-zinc-800 flex-shrink-0 ring-2 ring-transparent group-hover:ring-purple-500 transition-all" />
          <div className={cn("flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300", collapsed && "opacity-0 w-0")}>
            <span className="text-sm font-medium text-zinc-100">Robin Willson</span>
            <span className="text-xs text-zinc-500">Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
