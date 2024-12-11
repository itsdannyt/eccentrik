import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthLayout } from '../components/auth/AuthLayout';
import { SignUpFormStep1, type SignUpStep1Data } from '../components/auth/SignUpFormStep1';
import { SignUpFormStep2 } from '../components/auth/SignUpFormStep2';
import { LoadingPopup } from '../components/ui/LoadingPopup';
import { signUp } from '../lib/auth';

type LoadingStep = 'pending' | 'loading' | 'complete';

interface LoadingState {
  validation: LoadingStep;
  account: LoadingStep;
  analytics: LoadingStep;
}

export function SignUpPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SignUpStep1Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<LoadingState>({
    validation: 'pending',
    account: 'pending',
    analytics: 'pending'
  });

  const updateLoadingStep = (step: keyof LoadingState, status: LoadingStep) => {
    setLoadingSteps(prev => ({ ...prev, [step]: status }));
  };

  const handleStep1 = (data: SignUpStep1Data) => {
    setFormData(data);
    setStep(2);
  };

  const handleStep2 = async (credentials: { accessToken: string; channelId: string }) => {
    if (!formData) return;
    
    setIsLoading(true);
    try {
      // Start validation
      updateLoadingStep('validation', 'loading');
      // Validate the access token by making a test API call
      const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${credentials.channelId}`, {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`
        }
      });
      
      if (!channelResponse.ok) {
        throw new Error('Failed to validate YouTube channel');
      }
      updateLoadingStep('validation', 'complete');

      // Start account creation
      updateLoadingStep('account', 'loading');
      const { data: userData, confirmEmail } = await signUp({
        ...formData,
        youtubeData: {
          channelId: credentials.channelId,
          accessToken: credentials.accessToken
        }
      });
      updateLoadingStep('account', 'complete');

      // Start analytics setup
      updateLoadingStep('analytics', 'loading');
      // The backend will handle storing the YouTube credentials and setting up initial analytics
      updateLoadingStep('analytics', 'complete');

      if (confirmEmail) {
        navigate('/auth/verify-email');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? "Create your account" : "Connect your channel"}
      description={
        step === 1 
          ? "Start optimizing your YouTube content today"
          : "Link your YouTube channel to get personalized insights"
      }
    >
      {step === 1 ? (
        <SignUpFormStep1 onNext={handleStep1} />
      ) : (
        <SignUpFormStep2
          onBack={() => setStep(1)}
          onSubmit={handleStep2}
          isLoading={isLoading}
        />
      )}

      <LoadingPopup
        isOpen={isLoading}
        steps={[
          { label: 'Validating YouTube channel', status: loadingSteps.validation },
          { label: 'Creating your account', status: loadingSteps.account },
          { label: 'Setting up analytics', status: loadingSteps.analytics }
        ]}
      />
    </AuthLayout>
  );
}