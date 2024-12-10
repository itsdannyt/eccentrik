import React, { useState } from 'react';
import { Plus, Minus, Search, MessageCircle, ArrowRight } from 'lucide-react';
import { ParticleEffect } from './ParticleEffect';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How does the content performance prediction work?",
      answer: "Our AI-powered system analyzes your video titles, thumbnails, and metadata using advanced algorithms. We compare these elements against successful content in your niche, providing detailed insights and optimization suggestions before you publish."
    },
    {
      question: "How accurate are the predictions?",
      answer: "Our prediction model has demonstrated an average accuracy rate of 85% in forecasting video performance metrics. The system continuously learns and improves from new data, making predictions more accurate over time."
    },
    {
      question: "What metrics do you analyze?",
      answer: "We analyze multiple factors including potential click-through rate, viewer retention likelihood, thumbnail effectiveness, title optimization, and trending topic alignment. Each element receives a detailed score with specific improvement suggestions."
    },
    {
      question: "Can I use this for any type of YouTube content?",
      answer: "Yes! Our platform is designed to work with all types of YouTube content. Whether you create gaming videos, educational content, vlogs, or any other genre, our AI adapts its analysis to your specific niche and audience."
    },
    {
      question: "How often can I analyze my content?",
      answer: "The number of analyses depends on your subscription plan. Free users get 5 analyses per month, while Premium users get 50 analyses, and Enterprise users get unlimited analyses. You can view our pricing page for more details."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="faq" className="relative py-24 overflow-hidden">
      <ParticleEffect />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to know about our content prediction platform
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 relative z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-gray-800 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-950/80 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10"
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-medium">{faq.question}</span>
                  <span className="ml-6 flex-shrink-0">
                    {openIndex === index ? (
                      <Minus className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Plus className="w-5 h-5 text-orange-500" />
                    )}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-400">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Contact Section */}
        <div className="relative max-w-3xl mx-auto mt-16">
          <div className="absolute inset-0">
            <ParticleEffect />
          </div>
          <div className="bg-gray-950/80 backdrop-blur-sm rounded-2xl p-6 relative z-10 border border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="relative">
                  <div className="bg-orange-500/10 w-16 h-16 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">
                    Need More Help?
                  </h3>
                  <p className="text-gray-400">
                    Our support team is here to assist you
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Button
                  onClick={() => navigate('/dashboard/support')}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-400/80 whitespace-nowrap group"
                >
                  Get in Touch
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}