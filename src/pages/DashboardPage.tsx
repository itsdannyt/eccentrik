import React, { useState } from 'react';
import { Zap, Menu, X } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { cn } from '../lib/utils';

export function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="transition-transform hover:scale-105">
                <Zap className="w-8 h-8 text-orange-500" fill="currentColor" strokeWidth={1.5} />
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-white/5"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6 text-gray-400" />
              ) : (
                <Menu className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-20 left-0 bottom-0 z-40 w-64 bg-black border-r border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      <div className="lg:ml-64 pt-20">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 sm:py-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}