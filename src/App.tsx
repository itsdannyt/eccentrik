import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { SocialProof } from './components/SocialProof';
import { Pricing } from './components/Pricing';
import { ClosingCTA } from './components/ClosingCTA';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { AboutPage } from './pages/AboutPage';
import { DashboardPage } from './pages/DashboardPage';
import { PremiumUpgradePage } from './pages/PremiumUpgradePage';
import { EnterpriseInquiryPage } from './pages/EnterpriseInquiryPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { PoliciesPage } from './pages/dashboard/PoliciesPage';
import { SupportPage } from './pages/dashboard/SupportPage';
import { PredictiveInsightsPage } from './pages/dashboard/PredictiveInsightsPage';
import { TrendPulsePage } from './pages/dashboard/TrendPulsePage';
import { AuthCallback } from './components/auth/AuthCallback';
import { VerifyEmail } from './components/auth/VerifyEmail';
import { ErrorPage } from './pages/ErrorPage';

function HomePage() {
  return (
    <Layout>
      <Header />
      <main>
        <Hero />
        <Features />
        <SocialProof />
        <Pricing />
        <ClosingCTA />
        <FAQ />
      </main>
      <Footer />
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/premium-upgrade"
              element={
                <ProtectedRoute>
                  <PremiumUpgradePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enterprise-inquiry"
              element={
                <ProtectedRoute>
                  <EnterpriseInquiryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="predictive-insights" element={<PredictiveInsightsPage />} />
              <Route path="trend-pulse" element={<TrendPulsePage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="policies" element={<PoliciesPage />} />
              <Route path="support" element={<SupportPage />} />
            </Route>
            <Route path="/error" element={<ErrorPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;