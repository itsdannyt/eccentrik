import React from 'react';
import { Shield, Lock, FileText } from 'lucide-react';

export function PoliciesPage() {
  const policies = [
    {
      icon: <Shield className="w-6 h-6 text-orange-500" />,
      title: "Terms of Service",
      description: "Our terms of service outline the rules and guidelines for using our platform.",
      lastUpdated: "February 15, 2024"
    },
    {
      icon: <Lock className="w-6 h-6 text-orange-500" />,
      title: "Privacy Policy",
      description: "Learn how we collect, use, and protect your personal information.",
      lastUpdated: "February 20, 2024"
    },
    {
      icon: <FileText className="w-6 h-6 text-orange-500" />,
      title: "Content Guidelines",
      description: "Guidelines for content analysis and optimization on our platform.",
      lastUpdated: "February 10, 2024"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold">Policies</h1>
      
      <div className="grid gap-4 sm:gap-6">
        {policies.map((policy, index) => (
          <div key={index} className="bg-gray-950/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 sm:p-6 card-hover transition-transform hover:scale-[1.02]">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="bg-orange-500/10 p-2.5 sm:p-3 rounded-lg shrink-0">
                {policy.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">{policy.title}</h3>
                <p className="text-gray-400 text-sm mb-3 sm:mb-4">{policy.description}</p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <span className="text-xs sm:text-sm text-gray-500">
                    Last updated: {policy.lastUpdated}
                  </span>
                  <button className="text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors">
                    Read More →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}