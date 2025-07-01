"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Search, ShoppingBag, Menu, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useContext, useEffect } from 'react';
import { Drawer } from "@/components/ui/drawer";
import { LanguageContext } from './LanguageProvider';
import Image from "next/image";

export function Header() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang } = useContext(LanguageContext);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  useEffect(() => {
    if (!showLangDropdown) return;
    const handler = (e: MouseEvent) => {
      const dropdown = document.getElementById('header-lang-dropdown');
      if (dropdown && !dropdown.contains(e.target as Node)) setShowLangDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLangDropdown]);

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo/capoboutique.jpeg" alt="Logo" width={64} height={64} />
          <span className="ml-2 text-xl font-bold text-gray-900 font-clash">Capo boutique</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/shop" className="text-gray-800 hover:text-black font-medium">
            Shop All
          </Link>
        </nav>

        {/* Actions (always visible) */}
        <div className="flex items-center space-x-4">
          {/* Language Switcher (Always visible) */}
          <div className="relative">
            <button onClick={() => setShowLangDropdown(v => !v)} className="p-2 rounded hover:bg-gray-100 focus:outline-none">
              <Globe className="h-5 w-5 text-black" />
            </button>
            {showLangDropdown && (
              <div id="header-lang-dropdown" className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-lg z-50">
                <button onClick={() => { setLang('en'); setShowLangDropdown(false); }} className={`block w-full text-left px-4 py-2 hover:bg-green-50 ${lang === 'en' ? 'text-green-700 font-bold' : 'text-gray-700'}`}>English</button>
                <button onClick={() => { setLang('fr'); setShowLangDropdown(false); }} className={`block w-full text-left px-4 py-2 hover:bg-green-50 ${lang === 'fr' ? 'text-green-700 font-bold' : 'text-gray-700'}`}>Français</button>
                <button onClick={() => { setLang('ar'); setShowLangDropdown(false); }} className={`block w-full text-left px-4 py-2 hover:bg-green-50 ${lang === 'ar' ? 'text-green-700 font-bold' : 'text-gray-700'}`}>العربية</button>
              </div>
            )}
          </div>
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link 
                  href="/admin"
                  className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Dashboard
                </Link>
              )}
              <button 
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.reload();
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6 text-black" />
        </button>

        {/* Mobile Drawer Menu */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex justify-end md:hidden" onClick={() => setMenuOpen(false)}>
            <div className="bg-white w-64 h-full p-6 flex flex-col space-y-6" onClick={e => e.stopPropagation()}>
              <button className="self-end mb-4 text-black text-2xl" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
              <Link href="/shop" className="text-lg font-medium text-black" onClick={() => setMenuOpen(false)}>
                Shop All
              </Link>
              {/* Language Switcher (Always visible) */}
              <div className="relative">
                <button onClick={() => setShowLangDropdown(v => !v)} className="p-2 rounded hover:bg-gray-100 focus:outline-none">
                  <Globe className="h-5 w-5 text-black" />
                </button>
                {showLangDropdown && (
                  <div id="header-lang-dropdown" className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <button onClick={() => { setLang('en'); setShowLangDropdown(false); }} className={`block w-full text-left px-4 py-2 hover:bg-green-50 ${lang === 'en' ? 'text-green-700 font-bold' : 'text-gray-700'}`}>English</button>
                    <button onClick={() => { setLang('fr'); setShowLangDropdown(false); }} className={`block w-full text-left px-4 py-2 hover:bg-green-50 ${lang === 'fr' ? 'text-green-700 font-bold' : 'text-gray-700'}`}>Français</button>
                    <button onClick={() => { setLang('ar'); setShowLangDropdown(false); }} className={`block w-full text-left px-4 py-2 hover:bg-green-50 ${lang === 'ar' ? 'text-green-700 font-bold' : 'text-gray-700'}`}>العربية</button>
                  </div>
                )}
              </div>
              {user ? (
                <>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="text-lg font-medium text-black" onClick={() => setMenuOpen(false)}>
                      Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      window.location.reload();
                    }}
                    className="text-lg text-black hover:text-black text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-lg text-black hover:text-black"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
