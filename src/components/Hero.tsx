import React from 'react';
import { Button } from './ui/Button';
import { Sparkles, Play, Rocket } from 'lucide-react';
import { ParticleEffect } from './ParticleEffect';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthProvider';

export function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-52 pb-24 overflow-hidden">
      <ParticleEffect />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="space-y-8">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="bg-orange-500/10 w-20 h-20 rounded-2xl flex items-center justify-center">
                  <Play className="w-10 h-10 text-orange-500" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" />
                </div>
                <div className="absolute -bottom-2 -left-2">
                  <Rocket className="w-6 h-6 text-orange-500 animate-pulse" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight">
              <span className="block">Crack the Code</span>
              <span className="block">
                <span className="text-white">to</span>{' '}
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-transparent bg-clip-text">Viral Videos</span>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-xl md:max-w-2xl mx-auto leading-relaxed">
              AI-powered tools to predict performance, optimize your content, and grow your channel faster.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-[300px] sm:max-w-none mx-auto">
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-lg sm:px-8 px-6"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-orange-500 text-orange-500 hover:bg-orange-500/10 text-lg sm:px-8 px-6"
                onClick={handleLearnMore}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}