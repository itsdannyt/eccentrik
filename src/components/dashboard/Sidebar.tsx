import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Settings,
  UserCircle,
  FileText,
  HelpCircle,
  LogOut,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { signOut } from '../../lib/auth';
import { toast } from 'react-hot-toast';

interface SidebarProps {
  onClose?: () => void;
}

const menuItems = {
  main: [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      title: 'Predictive Insights',
      icon: Sparkles,
      href: '/dashboard/predictive-insights',
    },
    {
      title: 'Trend Pulse',
      icon: TrendingUp,
      href: '/dashboard/trend-pulse',
    },
  ],
  settings: [
    {
      title: 'Profile',
      icon: UserCircle,
      href: '/dashboard/profile',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
    },
    {
      title: 'Policies',
      icon: FileText,
      href: '/dashboard/policies',
    },
    {
      title: 'Support',
      icon: HelpCircle,
      href: '/dashboard/support',
    },
  ],
};

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await signOut();
    
    if (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
      return;
    }

    // Clear any remaining auth state and redirect
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-black border-r border-gray-800">
      <div className="flex flex-col h-full px-4 py-6">
        {/* Navigation */}
        <nav className="flex-1 space-y-6">
          {/* Main Menu */}
          <div>
            <h2 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Production
            </h2>
            <div className="space-y-1">
              {menuItems.main.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors',
                    location.pathname === item.href
                      ? 'bg-orange-500/10 text-orange-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Settings Menu */}
          <div>
            <h2 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Control Center
            </h2>
            <div className="space-y-1">
              {menuItems.settings.map((item, index) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors',
                    location.pathname === item.href
                      ? 'bg-orange-500/10 text-orange-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800',
                    index === menuItems.settings.length - 1 ? 'mb-4' : ''
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.title}
                </Link>
              ))}
              {/* Divider */}
              <div className="my-2 border-t border-gray-800" />
              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-400 rounded-lg hover:text-white hover:bg-orange-500 hover:bg-opacity-10 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}