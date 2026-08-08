import { useState } from "react";
import { Outlet } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

import Sidebar from "../components/layout/sidebar";
import Navbar from "../components/layout/navbar";
import CommandPalette from "../components/layout/CommandPalette";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative">
          <Sidebar />

          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-white text-xl"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between bg-white dark:bg-slate-900 shadow px-4 py-3">

          <button
            onClick={() => setSidebarOpen(true)}
            className="text-2xl text-slate-700 dark:text-slate-200"
          >
            <FaBars />
          </button>

          <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100">
            RLMS
          </h1>

          <div />
        </div>

        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="rlms-fade-in">
            <Outlet />
          </div>
        </main>

      </div>

      {/* Global command palette (Ctrl+K) */}
      <CommandPalette />
    </div>
  );
}

export default DashboardLayout;
