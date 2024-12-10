import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuth } from '../lib/auth/AuthProvider';

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-orange-500" fill="currentColor" strokeWidth={1.5} />
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                size="default"
              >
                <LayoutDashboard className="w-5 h-5 sm:hidden" />
                <span className="hidden sm:inline text-lg px-2">Dashboard</span>
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-orange-500"
                  size="default"
                  onClick={() => navigate('/login')}
                >
                  Log in
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  size="default"
                  onClick={() => navigate('/signup')}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}