"use client";
import { useContext, useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { LanguageContext } from "@/components/LanguageProvider";

export default function GlobalHeader() {
  const { lang, setLang } = useContext(LanguageContext);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  useEffect(() => {
    if (!showLangDropdown) return;
    const handler = (e: MouseEvent) => {
      const dropdown = document.getElementById('lang-dropdown');
      if (dropdown && !dropdown.contains(e.target as Node)) setShowLangDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLangDropdown]);
  return (
    <header className="flex items-center justify-end px-4 py-1 border-b bg-white relative z-50 h-12 min-h-0">
      <div className="relative">
        <button onClick={() => setShowLangDropdown(v => !v)} className="p-2 rounded hover:bg-gray-100 focus:outline-none">
          <Globe className="h-5 w-5 text-black" />
        </button>
        {showLangDropdown && (
          <div id="lang-dropdown" className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-lg z-50">
            <button onClick={() => { setLang('en'); setShowLangDropdown(false); }} className={`block w-full text-left px-4 py-2 hover:bg-green-50 ${lang === 'en' ? 'text-green-700 font-bold' : 'text-gray-700'}`}>English</button>
            <button onClick={() => { setLang('fr'); setShowLangDropdown(false); }} className={`block w-full text-left px-4 py-2 hover:bg-green-50 ${lang === 'fr' ? 'text-green-700 font-bold' : 'text-gray-700'}`}>Français</button>
            <button onClick={() => { setLang('ar'); setShowLangDropdown(false); }} className={`block w-full text-left px-4 py-2 hover:bg-green-50 ${lang === 'ar' ? 'text-green-700 font-bold' : 'text-gray-700'}`}>العربية</button>
          </div>
        )}
      </div>
    </header>
  );
} 