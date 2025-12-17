'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, History, Settings, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedLogo from '@/components/animations/AnimatedLogo';

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userLinks = [
    { href: '/', label: 'Book Court', icon: Calendar },
    { href: '/bookings', label: 'My Bookings', icon: History },
    { href: '/system-design', label: 'System Design', icon: Settings },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/courts', label: 'Courts', icon: Settings },
    { href: '/admin/coaches', label: 'Coaches', icon: Settings },
    { href: '/admin/equipment', label: 'Equipment', icon: Settings },
    { href: '/admin/pricing', label: 'Pricing Rules', icon: Settings },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-dark-700 bg-dark-900/95 backdrop-blur supports-[backdrop-filter]:bg-dark-900/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
            <AnimatedLogo size="md" showText={true} />
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-dark-300 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive 
                      ? 'bg-accent-neon/10 text-accent-neon' 
                      : 'text-dark-300 hover:text-white hover:bg-dark-800'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-dark-300 hover:text-white hover:bg-dark-800 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">User View</span>
              </Link>
            )}

            {!isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary-800 text-primary-300 hover:bg-primary-700 transition-all duration-200"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-300 ease-in-out',
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="py-4 space-y-2 border-t border-dark-700">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive 
                      ? 'bg-accent-neon/10 text-accent-neon' 
                      : 'text-dark-300 hover:text-white hover:bg-dark-800'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-dark-300 hover:text-white hover:bg-dark-800 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span>User View</span>
              </Link>
            )}

            {!isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-primary-800 text-primary-300 hover:bg-primary-700 transition-all duration-200"
              >
                <Settings className="h-5 w-5" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
