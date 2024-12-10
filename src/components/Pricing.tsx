import React from 'react';
import { Check, Info, Zap } from 'lucide-react';
import { Button } from './ui/Button';
import { ParticleEffect } from './ParticleEffect';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthProvider';

interface PricingFeature {
  text: string;
  tooltip?: string;
}

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: PricingFeature[];
  popular?: boolean;
}

export function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const plans: PricingTier[] = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for getting started",
      features: [
        { text: "Basic Channel Summary" },
        { text: "3 video analyses per month" },
        { text: "1 trending topic per week" },
        { text: "Basic performance metrics" }
      ]
    },
    {
      name: "Basic",
      price: "19",
      description: "For growing creators",
      features: [
        { text: "Everything in Free plan" },
        { 
          text: "Unlimited video analysis",
          tooltip: "Analyze all your past videos for performance insights" 
        },
        { 
          text: "10 predictive insights/month",
          tooltip: "AI-powered title and thumbnail analysis with feedback" 
        },
        { text: "Unlimited trending topics" },
        { 
          text: "3 metadata optimizations/month",
          tooltip: "Get tag and description suggestions for better discoverability" 
        },
        { text: "Basic email support" }
      ],
      popular: true
    },
    {
      name: "Premium",
      price: "49",
      description: "For serious content creators",
      features: [
        { text: "Everything in Basic plan" },
        { 
          text: "Unlimited predictive insights",
          tooltip: "No limits on title and thumbnail analysis" 
        },
        { 
          text: "Advanced AI predictions",
          tooltip: "Long-term performance forecasting and deep analytics" 
        },
        { 
          text: "Upload schedule optimization",
          tooltip: "Get personalized recommendations for the best upload times" 
        },
        { 
          text: "Deep trend analysis",
          tooltip: "Receive alerts about emerging topics in your niche" 
        },
        { text: "Unlimited metadata optimization" },
        { text: "Priority email support" }
      ]
    }
  ];

  const handlePlanSelection = (planName: string) => {
    if (!user) {
      navigate('/login', { state: { from: '/#pricing', selectedPlan: planName } });
      return;
    }

    if (planName === 'Basic' || planName === 'Premium') {
      navigate('/premium-upgrade');
    }
  };

  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      <ParticleEffect />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, <span className="text-gradient">Transparent</span> Pricing
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose the perfect plan to grow your channel and reach more viewers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-gray-950/80 backdrop-blur-sm rounded-2xl p-8 card-hover flex flex-col border border-white/10
                ${plan.popular ? 'border-orange-500 shadow-orange-500/20 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-500/60 px-4 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-5xl font-bold mb-2">
                  ${plan.price}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                <p className="text-gray-400">{plan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start group">
                    <div className="mr-3 flex-shrink-0">
                      <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-orange-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-300">{feature.text}</span>
                      {feature.tooltip && (
                        <div className="hidden group-hover:block absolute bg-gray-900 text-sm p-2 rounded-lg mt-1 max-w-xs z-10">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300">{feature.tooltip}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              
              <Button
                size="lg"
                variant={plan.name === "Basic" ? "default" : "outline"}
                className={
                  plan.name === "Basic"
                    ? "bg-gradient-to-r from-orange-500 to-orange-400/80 hover:opacity-90 text-lg px-8"
                    : "border-orange-500 text-orange-500 hover:bg-orange-500/10 text-lg px-8"
                }
                onClick={() => handlePlanSelection(plan.name)}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}