import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="glass-effect w-full max-w-md p-8 rounded-xl">
        <h1 className="text-2xl font-bold text-center mb-8">Create an Account</h1>
        
        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2.5 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Create a password"
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            Sign Up
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="text-orange-500 hover:text-orange-400">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
