"use client";
import { createContext, useState } from "react";
export const LanguageContext = createContext<{ lang: string; setLang: (l: string) => void }>({ lang: 'en', setLang: () => {} });
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState('en');
  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
} 