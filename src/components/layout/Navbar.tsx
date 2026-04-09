'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import {
  BookOpen, LayoutDashboard, Code2, Trophy, Bookmark,
  LogOut, Menu, X, Shield, User, ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (loading) return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-[var(--border)]" />
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-black">Py</span>
          </div>
          <span className="text-blue-600">PyQuiz</span>
        </Link>

        {/* Desktop Nav */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavLink href="/quiz/setup" icon={<BookOpen size={18} />} label="Practice" />
            <NavLink href="/practice/coding" icon={<Code2 size={18} />} label="Coding" />
            <NavLink href="/progress" icon={<Trophy size={18} />} label="Progress" />
            <NavLink href="/bookmarks" icon={<Bookmark size={18} />} label="Bookmarks" />
            {user.role === 'ADMIN' && (
              <NavLink href="/admin" icon={<Shield size={18} />} label="Admin" />
            )}
          </div>
        )}

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile menu toggle (Swapped to be more central/left of profile) */}
          {user && (
            <button 
              onClick={() => setMobileOpen(!mobileOpen)} 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-blue-600" />
                </div>
                <span className="hidden md:block text-sm font-medium">{user.displayName || user.username}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-[var(--border)] py-1 fade-in">
                  <div className="px-3 py-2 border-b border-[var(--border)]">
                    <p className="text-sm font-medium">{user.displayName || user.username}</p>
                    <p className="text-xs text-gray-400">{user.role}</p>
                  </div>
                  <button
                    onClick={() => { logout(); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && user && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-[var(--border)] shadow-xl fade-in overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="px-4 py-3 space-y-1">
            <MobileNavLink href="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={() => setMobileOpen(false)} />
            <MobileNavLink href="/quiz/setup" icon={<BookOpen size={18} />} label="Practice" onClick={() => setMobileOpen(false)} />
            <MobileNavLink href="/practice/coding" icon={<Code2 size={18} />} label="Coding" onClick={() => setMobileOpen(false)} />
            <MobileNavLink href="/progress" icon={<Trophy size={18} />} label="Progress" onClick={() => setMobileOpen(false)} />
            <MobileNavLink href="/bookmarks" icon={<Bookmark size={18} />} label="Bookmarks" onClick={() => setMobileOpen(false)} />
            {user.role === 'ADMIN' && (
              <MobileNavLink href="/admin" icon={<Shield size={18} />} label="Admin" onClick={() => setMobileOpen(false)} />
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
      {icon}
      {label}
    </Link>
  );
}

function MobileNavLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
      {icon}
      {label}
    </Link>
  );
}
