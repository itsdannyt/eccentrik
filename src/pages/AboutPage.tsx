import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ParticleEffect } from '../components/ParticleEffect';
import { Users, Rocket, Heart } from 'lucide-react';

export function AboutPage() {
  const values = [
    {
      icon: <Users className="w-6 h-6 text-orange-500" />,
      title: "Community First",
      description: "We believe in the power of community and collaboration. Every feature we build is inspired by your needs and feedback."
    },
    {
      icon: <Rocket className="w-6 h-6 text-orange-500" />,
      title: "Innovation Driven",
      description: "Pushing the boundaries of what's possible with AI and content creation, while keeping things simple and accessible."
    },
    {
      icon: <Heart className="w-6 h-6 text-orange-500" />,
      title: "Passion Led",
      description: "Built by creators for creators. We're passionate about helping you succeed in your content journey."
    }
  ];

  return (
    <>
      <Header />
      <main className="relative min-h-screen">
        <ParticleEffect />
        
        {/* Story Section */}
        <section className="pt-40 sm:pt-48 pb-16 sm:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-8 sm:p-10 mb-12 sm:mb-16 border border-white/10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 sm:mb-8 text-center">
                Our <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-transparent bg-clip-text">Story</span>
              </h2>
              <div className="space-y-4 sm:space-y-6 text-gray-300 text-base sm:text-lg max-w-4xl mx-auto">
                <p>
                  Born from the creative minds of content creators and tech enthusiasts,
                  Eccentrik emerged as a solution to a common challenge: making data-driven
                  content decisions without getting lost in complex analytics.
                </p>
                <p>
                  We started as a small team with a big vision - to democratize content
                  optimization and make it accessible to creators of all sizes. Our journey
                  began with a simple idea: what if we could harness the power of AI to
                  help creators make better content decisions?
                </p>
                <p>
                  Today, we're proud to serve a growing community of creators, helping them
                  unlock their full potential through innovative AI-powered tools and
                  insights.
                </p>
              </div>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 card-hover transition-transform hover:scale-[1.02] border border-white/10"
                >
                  <div className="flex flex-col items-center text-center gap-4 sm:gap-5">
                    <div className="bg-orange-500/10 p-4 sm:p-5 rounded-xl">
                      {value.icon}
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">{value.title}</h3>
                      <p className="text-gray-400 text-base sm:text-lg leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
