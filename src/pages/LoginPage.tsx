import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';

export function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to your account to continue"
    >
      <LoginForm />
    </AuthLayout>
  );
}