"use client"

import { Header } from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { usePathname } from 'next/navigation'

export function RootContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  return (    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      {!isAdminRoute && <Header />}
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
