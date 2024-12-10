import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Twitter, Youtube, Github, Mail } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthProvider';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (href: string) => {
    if (href.startsWith('/#')) {
      // Handle scroll to section
      const sectionId = href.replace('/#', '');
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (href === '/dashboard' && !user) {
      // Redirect to signup if trying to access dashboard while not authenticated
      navigate('/signup');
    } else if (href === '/about') {
      // Navigate to About page and scroll to top
      navigate('/about');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Normal navigation
      navigate(href);
    }
  };

  const sections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/#features' },
        { label: 'Pricing', href: '/#pricing' },
        { label: 'Dashboard', href: '/dashboard' }
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Billing', href: '/billing' },
        { label: 'Contact', href: '/contact' }
      ],
    },
  ];

  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Zap className="w-8 h-8 text-orange-500" fill="currentColor" strokeWidth={1.5} />
            </Link>
            <div className="flex space-x-4">
              <a href="https://twitter.com" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://github.com" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="mailto:contact@example.com" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleNavigation(link.href)}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm">
            {currentYear} Eccentrik - Much Love Y'all
          </p>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-gray-400 hover:text-orange-500 text-sm">
              Terms
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-orange-500 text-sm">
              Privacy
            </Link>
            <Link to="/cookies" className="text-gray-400 hover:text-orange-500 text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}