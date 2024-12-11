import React from 'react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth/AuthProvider';
import { User, CreditCard, Package, Bell, ExternalLink, Shield, Youtube } from 'lucide-react';
import { disconnectYouTubeChannel } from '../../lib/services/youtube';
import { toast } from 'react-hot-toast';

export function ProfilePage() {
  const { user } = useAuth();
  
  const handleDisconnectYouTube = async () => {
    try {
      await disconnectYouTubeChannel();
      toast.success('YouTube channel disconnected successfully');
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Example subscription data - replace with actual data from your backend
  const subscriptionData = {
    plan: 'Pro',
    status: 'active',
    nextBilling: '2024-01-09',
    price: '$29',
    interval: 'month'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Profile Settings</h1>

      <div className="space-y-6 sm:space-y-8">
        {/* Profile Information */}
        <div className="bg-gray-950/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-2 text-orange-500 mb-4">
            <User className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Profile Information</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-white/5 border border-gray-800 rounded-lg text-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={user?.user_metadata?.full_name || ''}
                className="w-full px-4 py-2 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <Button 
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
            >
              Update Profile
            </Button>
          </div>
        </div>

        {/* Subscription Information */}
        <div className="bg-gray-950/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-2 text-orange-500 mb-4">
            <CreditCard className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Subscription</h2>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-white/5 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Current Plan</span>
                </div>
                <p className="text-2xl font-bold text-orange-500">{subscriptionData.plan}</p>
                <p className="text-sm text-gray-400">{subscriptionData.price}/{subscriptionData.interval}</p>
              </div>

              <div className="bg-white/5 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Next Billing</span>
                </div>
                <p className="text-2xl font-bold">{new Date(subscriptionData.nextBilling).toLocaleDateString()}</p>
                <p className="text-sm text-gray-400">Auto-renewal {subscriptionData.status}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
              >
                Manage Subscription
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button 
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
              >
                Billing History
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* YouTube Connection */}
        <div className="bg-gray-950/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-2 text-orange-500 mb-4">
            <Youtube className="w-5 h-5" />
            <h2 className="text-lg font-semibold">YouTube Connection</h2>
          </div>

          <div className="space-y-4">
            <p className="text-gray-400">
              Manage your YouTube channel connection. Disconnecting will remove access to your channel's analytics and data.
            </p>

            <Button 
              onClick={handleDisconnectYouTube}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              Disconnect YouTube Channel
              <Youtube className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-gray-950/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-2 text-orange-500 mb-4">
            <Shield className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>

          <div className="space-y-4">
            <Button 
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
            >
              Change Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}