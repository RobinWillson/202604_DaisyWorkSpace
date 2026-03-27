import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-100 overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
        
        <Header />
        
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 z-10 w-full">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
