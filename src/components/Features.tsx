import React from 'react';
import { BarChart2, Image, TrendingUp, Layout } from 'lucide-react';
import { ParticleEffect } from './ParticleEffect';

export function Features() {
  const coreFeatures = [
    {
      icon: <BarChart2 className="w-8 h-8 text-orange-500" />,
      title: "Predictive Title Scoring",
      description: "AI-powered analysis of your video titles to predict click-through rates and maximize engagement."
    },
    {
      icon: <Image className="w-8 h-8 text-orange-500" />,
      title: "Thumbnail Performance Analysis",
      description: "AI-driven scoring to ensure your thumbnails capture attention and drive clicks."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-500" />,
      title: "Trend Pulse",
      description: "Real-time insights into trending topics tailored to your niche, with actionable suggestions."
    },
    {
      icon: <Layout className="w-8 h-8 text-orange-500" />,
      title: "Performance Dashboard",
      description: "Track, compare, and refine predictions across all your videos with actionable insights."
    }
  ];

  const FeatureCard = ({ feature, isCore = false }) => (
    <div className="group relative bg-gray-950/80 backdrop-blur-sm rounded-xl p-6 card-hover overflow-hidden flex items-start gap-4 border border-white/10">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon Container */}
      <div className="relative flex-shrink-0">
        <div className={`bg-gray-900/80 w-14 h-14 rounded-lg flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:bg-gray-800/80 border border-white/10 ${feature.isFeatured ? 'animate-pulse' : ''}`}>
          {feature.icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1 min-w-0">
        <h3 className="text-lg font-bold mb-2 group-hover:text-orange-500 transition-colors">
          {feature.title}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Hover Line Effect */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </div>
  );

  return (
    <section id="features" className="relative py-24 overflow-hidden">
      <ParticleEffect />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful <span className="text-gradient">AI-Driven</span> Features
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Optimize your content before publishing with our predictive insights
            and performance analysis tools.
          </p>
        </div>

        {/* Core Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 mb-12">
          {coreFeatures.map((feature, index) => (
            <FeatureCard key={index} feature={feature} isCore={true} />
          ))}
        </div>
      </div>
    </section>
  );
}