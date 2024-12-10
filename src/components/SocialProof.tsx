import React from 'react';
import { Star, Quote } from 'lucide-react';
import { ParticleEffect } from './ParticleEffect';

export function SocialProof() {
  const testimonials = [
    {
      quote: "This tool has completely transformed how I prepare my content. My views have increased by 50% since I started using it.",
      author: "Alex Chen",
      role: "Tech Reviewer",
      subscribers: "500K+",
      avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop"
    },
    {
      quote: "The metadata optimization feature alone has boosted my video discoverability significantly.",
      author: "Sarah Johnson",
      role: "Lifestyle Creator",
      subscribers: "250K+",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
    },
    {
      quote: "Finally, a tool that helps me understand what works before I publish. Game changer!",
      author: "Mike Williams",
      role: "Gaming Creator",
      subscribers: "1M+",
      avatar: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?w=400&h=400&fit=crop"
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      <ParticleEffect />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trusted by <span className="text-gradient">Leading Creators</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join thousands of content creators who use our platform to optimize their videos
            and grow their channels faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-6 border border-white/10 card-hover relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-orange-500/20" />
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-14 h-14 rounded-full mr-4 object-cover"
                />
                <div>
                  <div className="font-bold">{testimonial.author}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                  <div className="text-sm text-orange-500">{testimonial.subscribers}</div>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-orange-500 fill-orange-500" />
                ))}
              </div>
              <blockquote className="text-gray-300 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}