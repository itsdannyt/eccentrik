import React from 'react';
import { Button } from './ui/Button';
import { ArrowRight, Rocket } from 'lucide-react';
import { ParticleEffect } from './ParticleEffect';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthProvider';

export function ClosingCTA() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <section className="relative py-24 overflow-hidden">
      <ParticleEffect />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-block mb-8">
          <div className="relative">
            <div className="bg-orange-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto">
              <Rocket className="w-10 h-10 text-orange-500" />
            </div>
            <div className="absolute -top-2 -right-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full animate-ping" />
            </div>
          </div>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to grow your channel{' '}
          <span className="text-gradient">faster</span>?
        </h2>
        
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          Join thousands of creators who are using AI-powered insights to optimize
          their content and reach more viewers.
        </p>
        
        <Button 
          size="lg" 
          variant="outline" 
          className="border-orange-500 text-orange-500 hover:bg-orange-500/10 text-lg px-8"
          onClick={handleGetStarted}
        >
          Crack The Code
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </section>
  );
}