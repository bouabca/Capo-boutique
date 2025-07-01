"use client";

import { useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";

const LanguageContext = createContext({ lang: 'en', setLang: (l: string) => {} });

const t = (key: string, lang: string) => {
  const translations: any = {
    en: { Login: 'Login', Email: 'Email', Password: 'Password' },
    fr: { Login: 'Connexion', Email: 'E-mail', Password: 'Mot de passe' },
    ar: { Login: 'تسجيل الدخول', Email: 'البريد الإلكتروني', Password: 'كلمة المرور' },
  };
  return translations[lang][key] || key;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState('en');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to login");
      }

      // If successful, redirect to home page
      router.push("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <header className="flex items-center justify-between px-4 py-3 border-b bg-white w-full max-w-md mx-auto">
        <div className="text-xl font-bold">{t('Login', lang)}</div>
        <div className="flex gap-2">
          <button onClick={() => setLang('en')} className={`px-2 py-1 rounded ${lang === 'en' ? 'bg-green-100 text-green-700' : 'text-gray-600'}`}>EN</button>
          <button onClick={() => setLang('fr')} className={`px-2 py-1 rounded ${lang === 'fr' ? 'bg-green-100 text-green-700' : 'text-gray-600'}`}>FR</button>
          <button onClick={() => setLang('ar')} className={`px-2 py-1 rounded ${lang === 'ar' ? 'bg-green-100 text-green-700' : 'text-gray-600'}`}>AR</button>
        </div>
      </header>
      <div className="w-full max-w-[420px] space-y-8 p-8 border border-gray-200 rounded-lg shadow-sm bg-white">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-[32px] font-bold tracking-tight text-gray-900">
            {t('Login', lang)}
          </h1>
          <p className="text-[14px] text-gray-600">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="block text-[13px] font-medium text-gray-700"
            >
              {t('Email', lang)}
            </label>            <input
              id="email"
              type="email"
              placeholder={t('Enter your email', lang)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-[42px] w-full rounded-[4px] border border-gray-300 px-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-gray-800 focus:ring-0 bg-white"
            />
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="password" 
              className="block text-[13px] font-medium text-gray-700"
            >
              {t('Password', lang)}
            </label>            <input
              id="password"
              type="password"
              placeholder={t('Enter your password', lang)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-[42px] w-full rounded-[4px] border border-gray-300 px-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-gray-800 focus:ring-0 bg-white"
            />
          </div>

          <button
            type="submit"
            className="mt-6 h-[42px] w-full rounded-[4px] bg-green-500 font-medium text-white hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            disabled={loading}
          >
            {loading ? "Logging in..." : t('Login', lang)}
          </button>
        </form>
      </div>
    </div>
    </LanguageContext.Provider>
  );
}