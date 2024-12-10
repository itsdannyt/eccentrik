import React from 'react';
import { MessageCircle, Book, HelpCircle, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function SupportPage() {
  const faqs = [
    {
      question: "How does the video analysis work?",
      answer: "Our AI-powered system analyzes your video title, thumbnail, and metadata using advanced algorithms to predict performance and provide optimization suggestions."
    },
    {
      question: "What metrics are included in the analysis?",
      answer: "We analyze click-through rate potential, viewer retention likelihood, SEO optimization, and trend alignment to provide comprehensive insights."
    },
    {
      question: "How accurate are the predictions?",
      answer: "Our predictions are based on historical data and current trends, with an average accuracy rate of 85% for engagement predictions."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold">Support Center</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[
          {
            icon: <MessageCircle className="w-6 h-6" />,
            title: "Live Chat",
            description: "Chat with our support team"
          },
          {
            icon: <Book className="w-6 h-6" />,
            title: "Documentation",
            description: "Browse our guides and tutorials"
          },
          {
            icon: <Mail className="w-6 h-6" />,
            title: "Email Support",
            description: "Get help via email"
          }
        ].map((action, index) => (
          <div key={index} className="bg-gray-950/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 sm:p-6 text-center card-hover transition-transform hover:scale-[1.02]">
            <div className="bg-orange-500/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              {React.cloneElement(action.icon, { className: 'w-6 h-6 text-orange-500' })}
            </div>
            <h3 className="font-semibold mb-1 sm:mb-2">{action.title}</h3>
            <p className="text-sm text-gray-400">{action.description}</p>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div className="bg-gray-950/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5 sm:mb-6">
          <HelpCircle className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg sm:text-xl font-semibold">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-5 sm:space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-800 last:border-0 pb-5 sm:pb-6 last:pb-0">
              <h3 className="font-medium mb-2 text-sm sm:text-base">{faq.question}</h3>
              <p className="text-gray-400 text-xs sm:text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-gray-950/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-5 sm:mb-6">Contact Support</h2>
        <form className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Subject
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
              placeholder="How can we help?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Message
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-2.5 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm sm:text-base resize-none"
              placeholder="Describe your issue..."
            />
          </div>
          <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8">
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}