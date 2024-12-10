import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Eye, EyeOff } from 'lucide-react';

const signUpStep1Schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignUpStep1Data = z.infer<typeof signUpStep1Schema>;

interface SignUpFormStep1Props {
  onNext: (data: SignUpStep1Data) => void;
  isLoading?: boolean;
}

export function SignUpFormStep1({ onNext, isLoading }: SignUpFormStep1Props) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpStep1Data>({
    resolver: zodResolver(signUpStep1Schema),
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
          Full Name
        </label>
        <input
          {...register('fullName')}
          type="text"
          className="w-full px-4 py-2 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500"
          placeholder="John Doe"
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-4 py-2 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            className="w-full px-4 py-2 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 pr-10"
            placeholder="••••••••"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-400/80"
      >
        {isLoading ? 'Processing...' : 'Continue'}
      </Button>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-orange-500 hover:text-orange-400">
          Log in
        </Link>
      </p>
    </form>
  );
}