import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useNavigate } from 'react-router-dom';

export function PremiumUpgradePage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();

  const prices = {
    monthly: 19,
    yearly: 190, // Save ~15%
  };

  const features = [
    "50 video analyses per month",
    "Advanced AI title optimization",
    "Detailed thumbnail analysis",
    "Full trend analytics",
    "Metadata optimization",
    "Priority support",
  ];

  const handleContinueToPayment = () => {
    navigate('/premium-payment', { 
      state: { 
        billingCycle,
        amount: prices[billingCycle]
      }
    });
  };

  return (
    <AuthLayout
      title="Upgrade to Premium"
      description="Unlock advanced features and grow your channel faster"
    >
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="flex justify-center gap-4 p-2 bg-white/5 rounded-lg">
            <button
              className={`px-4 py-2 rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly (Save 15%)
            </button>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              ${prices[billingCycle]}
              <span className="text-lg text-gray-400">
                /{billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
            {billingCycle === 'yearly' && (
              <div className="text-sm text-green-500">Save $38 per year</div>
            )}
          </div>

          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <div className="mr-3 flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-orange-500" />
                  </div>
                </div>
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-400/80"
            onClick={handleContinueToPayment}
          >
            Continue to Payment
          </Button>

          <p className="text-center text-sm text-gray-400">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}