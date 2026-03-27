"use client";

import { 
  CheckSquare, 
  BrainCircuit, 
  LineChart, 
  Activity,
  ArrowUpRight,
  Plus
} from "lucide-react";
import Link from "next/link";

const stats = [
  { name: "Active Tasks", value: "12", change: "+2 from yesterday", icon: CheckSquare, color: "text-blue-400", bg: "bg-blue-500/10" },
  { name: "Brain Entries", value: "1,024", change: "+8 this week", icon: BrainCircuit, color: "text-purple-400", bg: "bg-purple-500/10" },
  { name: "Portfolio (TW)", value: "+4.2%", change: "Market Open", icon: LineChart, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { name: "Efficiency Score", value: "92/100", change: "Top 5%", icon: Activity, color: "text-rose-400", bg: "bg-rose-500/10" },
];

const quickLinks = [
  { title: "Create Note", desc: "Add to Second Brain", href: "/second-brain/new", color: "from-purple-500/20 to-fuchsia-500/5 hover:to-fuchsia-500/20 border-purple-500/20" },
  { title: "New Task", desc: "Add to To-Do List", href: "/todo-list/new", color: "from-blue-500/20 to-cyan-500/5 hover:to-cyan-500/20 border-blue-500/20" },
  { title: "Analyze Stock", desc: "TW / US Markets", href: "/tw-stocks/analyze", color: "from-emerald-500/20 to-teal-500/5 hover:to-teal-500/20 border-emerald-500/20" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Robin</span>
          </h2>
          <p className="text-zinc-500 text-sm">
            Here's what's happening across your workspace today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-sm font-medium transition-colors border border-white/10">
            Customize
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transform hover:-translate-y-0.5">
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className="relative overflow-hidden p-6 rounded-2xl bg-[#141414]/80 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-colors group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Subtle background glow */}
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${stat.bg}`} />
              
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-zinc-400 text-sm font-medium">{stat.name}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
                </div>
                <p className={`text-xs mt-1 ${stat.name.includes("TW") || stat.name.includes("Active") ? stat.color : "text-zinc-500"}`}>
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action / Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-[#141414]/80 backdrop-blur-xl border border-white/5 flex flex-col h-[400px]">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-semibold text-zinc-100">Recent Activity Stream</h3>
               <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">View All</button>
             </div>
             
             {/* Mock Timeline */}
             <div className="flex-1 relative border-l border-white/10 ml-3 space-y-6 pb-4">
                <div className="relative pl-6">
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-[#141414]" />
                  <p className="text-sm font-medium text-white">Added new note to Second Brain</p>
                  <p className="text-xs text-zinc-500 mt-1">"React 19 Compiler deep dive"</p>
                  <span className="text-xs text-zinc-600 mt-2 block">2 hours ago</span>
                </div>
                
                <div className="relative pl-6">
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[#141414]" />
                  <p className="text-sm font-medium text-white">Completed Task</p>
                  <p className="text-xs text-zinc-500 mt-1">"Review Modular Monolith PR"</p>
                  <span className="text-xs text-zinc-600 mt-2 block">5 hours ago</span>
                </div>

                <div className="relative pl-6 opacity-60">
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[#141414]" />
                  <p className="text-sm font-medium text-white">Automated System Alert</p>
                  <p className="text-xs text-zinc-500 mt-1">Daisy Workspace deployed successfully to Zeabur</p>
                  <span className="text-xs text-zinc-600 mt-2 block">Yesterday</span>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Widgets (1/3 width) */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="p-6 rounded-2xl bg-[#141414]/80 backdrop-blur-xl border border-white/5">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Quick Links</h3>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className={`group flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r transition-all duration-300 ${link.color}`}
                >
                  <div>
                    <h4 className="text-sm font-medium text-white group-hover:text-white/90">{link.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{link.desc}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="p-6 rounded-2xl bg-[#141414]/80 backdrop-blur-xl border border-white/5">
            <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">System Status</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-sm text-zinc-300">Monolith Server</span>
              </div>
              <span className="text-xs text-zinc-500">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
