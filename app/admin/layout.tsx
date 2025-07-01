"use client"

import type React from "react"
import { useState, useContext, createContext } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Truck,
  FileText,
  Puzzle,
  Users,
  Settings,
  Menu,
  X,
  Ticket,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/categories", label: "Categories", icon: Package },
  { href: "/admin/stock", label: "Stock", icon: Warehouse },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
  { href: "/admin/cms", label: "CMS", icon: FileText },
  { href: "/admin/integrations", label: "Integrations", icon: Puzzle },
  { href: "/admin/sheets", label: "Sheets", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export const LanguageContext = createContext({ lang: 'en', setLang: (l: string) => {} });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean | 'lang'>(false)
  const [lang, setLang] = useState('en');
  const pathname = usePathname()
  const isArabic = false; // Always keep sidebar on the left
  const t = (key: string) => {
    const translations: any = {
      en: { Dashboard: 'Dashboard', Products: 'Products', Orders: 'Orders', Coupons: 'Coupons', Categories: 'Categories', Stock: 'Stock', Shipping: 'Shipping', CMS: 'CMS', Integrations: 'Integrations', Users: 'Users', Settings: 'Settings', 'Planted Admin': 'Planted Admin' },
      fr: { Dashboard: 'Tableau de bord', Products: 'Produits', Orders: 'Commandes', Coupons: 'Coupons', Categories: 'Catégories', Stock: 'Stock', Shipping: 'Livraison', CMS: 'CMS', Integrations: 'Intégrations', Users: 'Utilisateurs', Settings: 'Paramètres', 'Planted Admin': 'Planted Admin' },
      ar: { Dashboard: 'لوحة التحكم', Products: 'المنتجات', Orders: 'الطلبات', Coupons: 'كوبونات', Categories: 'الفئات', Stock: 'المخزون', Shipping: 'الشحن', CMS: 'المحتوى', Integrations: 'التكاملات', Users: 'المستخدمون', Settings: 'الإعدادات', 'Planted Admin': 'لوحة إدارة بلانتد' },
    };
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
    <div className={`min-h-screen bg-white w-full overflow-x-hidden ltr`} dir="ltr">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          `fixed inset-y-0 left-0 z-50 w-64 max-w-full bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-sm`,
          sidebarOpen && sidebarOpen !== 'lang' ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-100 relative">
          <Link href="/admin" className="text-xl font-semibold text-green-600">
            {t('Planted Admin')}
          </Link>
          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button onClick={() => setSidebarOpen('lang')} className="p-2 rounded hover:bg-gray-100 focus:outline-none">
              <Globe className="h-5 w-5 text-black" />
            </button>
            {sidebarOpen === 'lang' && (
              <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-lg z-50">
                <button onClick={() => { setLang('en'); setSidebarOpen(false); }} className={`block w-full text-left px-4 py-2 hover:bg-green-50 ${lang === 'en' ? 'text-green-700 font-bold' : 'text-gray-700'}`}>English</button>
                <button onClick={() => { setLang('fr'); setSidebarOpen(false); }} className={`block w-full text-left px-4 py-2 hover:bg-green-50 ${lang === 'fr' ? 'text-green-700 font-bold' : 'text-gray-700'}`}>Français</button>
                <button onClick={() => { setLang('ar'); setSidebarOpen(false); }} className={`block w-full text-left px-4 py-2 hover:bg-green-50 ${lang === 'ar' ? 'text-green-700 font-bold' : 'text-gray-700'}`}>العربية</button>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-black" />
          </Button>
        </div>

        <nav className="mt-6 px-2 sm:px-3">
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-green-50 text-green-700 border-r-2 border-green-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-green-600",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {t(item.label)}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 w-full">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-100 bg-white px-2 sm:px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-black" />
          </Button>
        </div>

        {/* Page content */}
        <main className="py-4 px-2 sm:px-4 md:px-6 lg:px-8 w-full max-w-full overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
    </LanguageContext.Provider>
  );
}
