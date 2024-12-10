import React from 'react';
import { Building2, Send } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const inquirySchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  numChannels: z.string().min(1, 'Number of channels is required'),
  additionalNeeds: z.string().optional(),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

export function EnterpriseInquiryPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
  });

  const onSubmit = async (data: InquiryFormData) => {
    try {
      // Here you would typically send the inquiry to your backend
      console.log('Enterprise inquiry:', data);
      
      toast.success('Thank you for your inquiry! We\'ll be in touch soon.');
      navigate('/enterprise-confirmation');
    } catch (error) {
      toast.error('Failed to submit inquiry. Please try again.');
    }
  };

  return (
    <AuthLayout
      title="Enterprise Inquiry"
      description="Get a custom solution for your team"
    >
      <div className="space-y-8">
        <div className="flex justify-center mb-8">
          <div className="bg-orange-500/10 p-4 rounded-xl">
            <Building2 className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Company Name
            </label>
            <input
              {...register('companyName')}
              className="w-full px-4 py-2 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Your company name"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Number of YouTube Channels
            </label>
            <select
              {...register('numChannels')}
              className="w-full px-4 py-2 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select number of channels</option>
              <option value="1-5">1-5 channels</option>
              <option value="6-10">6-10 channels</option>
              <option value="11-20">11-20 channels</option>
              <option value="20+">20+ channels</option>
            </select>
            {errors.numChannels && (
              <p className="mt-1 text-sm text-red-500">{errors.numChannels.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Additional Requirements
            </label>
            <textarea
              {...register('additionalNeeds')}
              rows={4}
              className="w-full px-4 py-2 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Tell us about your specific needs..."
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-400/80"
            disabled={isSubmitting}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
          </Button>

          <p className="text-center text-sm text-gray-400">
            Our team will contact you within 24 hours with a custom proposal.
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}