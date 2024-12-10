import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <Zap className="w-12 h-12 text-orange-500" fill="currentColor" strokeWidth={1.5} />
          </Link>
          <h1 className="text-3xl font-bold mb-2 text-white">{title}</h1>
          <p className="text-gray-400">{description}</p>
        </div>
        
        <div className="glass-effect rounded-2xl p-8">
          {children}
        </div>
      </div>

      {/* Background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-yellow-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>
    </div>
  );
}