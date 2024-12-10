import React from 'react';
import { Button } from '../../components/ui/Button';
import { Bell, Globe, Info } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Settings</h1>

      <div className="space-y-6 sm:space-y-8">
        {/* Notifications */}
        <div className="bg-gray-950/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <Bell className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          
          <div className="space-y-5">
            {[
              "Email notifications for analysis completion",
              "Weekly trend reports",
              "Performance alerts"
            ].map((setting, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 flex-1 mr-4">
                  <span className="text-gray-300 text-sm sm:text-base">{setting}</span>
                  <Info className="w-4 h-4 text-gray-500 cursor-help" />
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="bg-gray-950/80 backdrop-blur-sm border border-white/10 rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <Globe className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Language & Region</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Language
              </label>
              <select className="w-full px-4 py-2.5 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </div>

        <Button 
          className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}