"use client"

import { useState, useContext } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LanguageContext } from "../layout"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName: "Capo boutique",
    storeEmail: "capoboutique@gmail.com",
    currency: "USD",
    timezone: "UTC",
    emailNotifications: true,
    orderNotifications: true,
    lowStockAlerts: true,
    maintenanceMode: false,
  })

  const { lang } = useContext(LanguageContext)

  const translations = {
    en: {
      settings: "Settings",
      configure: "Configure your store settings and preferences",
      generalSettings: "General Settings",
      storeName: "Store Name",
      storeEmail: "Store Email",
      currency: "Currency",
      timezone: "Timezone",
      notifications: "Notifications",
      emailNotifications: "Email Notifications",
      receiveEmail: "Receive general email notifications",
      orderNotifications: "Order Notifications",
      getNotified: "Get notified when new orders are placed",
      lowStockAlerts: "Low Stock Alerts",
      alertLowStock: "Alert when products are running low",
      system: "System",
      maintenanceMode: "Maintenance Mode",
      putStoreMaintenance: "Put your store in maintenance mode",
      saveSettings: "Save Settings",
    },
    ar: {
      settings: "الإعدادات",
      configure: "قم بتكوين إعدادات متجرك وتفضيلاتك",
      generalSettings: "الإعدادات العامة",
      storeName: "اسم المتجر",
      storeEmail: "البريد الإلكتروني للمتجر",
      currency: "العملة",
      timezone: "المنطقة الزمنية",
      notifications: "الإشعارات",
      emailNotifications: "إشعارات البريد الإلكتروني",
      receiveEmail: "تلقي إشعارات البريد الإلكتروني العامة",
      orderNotifications: "إشعارات الطلبات",
      getNotified: "تلقي إشعار عند وجود طلبات جديدة",
      lowStockAlerts: "تنبيهات انخفاض المخزون",
      alertLowStock: "تنبيه عند انخفاض المنتجات في المخزون",
      system: "النظام",
      maintenanceMode: "وضع الصيانة",
      putStoreMaintenance: "ضع متجرك في وضع الصيانة",
      saveSettings: "حفظ الإعدادات",
    },
    fr: {
      settings: "Paramètres",
      configure: "Configurez les paramètres et préférences de votre boutique",
      generalSettings: "Paramètres généraux",
      storeName: "Nom du magasin",
      storeEmail: "Email du magasin",
      currency: "Devise",
      timezone: "Fuseau horaire",
      notifications: "Notifications",
      emailNotifications: "Notifications par email",
      receiveEmail: "Recevoir des notifications générales par email",
      orderNotifications: "Notifications de commande",
      getNotified: "Recevoir une notification lors de nouvelles commandes",
      lowStockAlerts: "Alertes de stock faible",
      alertLowStock: "Alerte lorsque les produits sont en rupture de stock",
      system: "Système",
      maintenanceMode: "Mode maintenance",
      putStoreMaintenance: "Mettre votre boutique en mode maintenance",
      saveSettings: "Enregistrer les paramètres",
    },
  } as const
  type Lang = keyof typeof translations
  const t = translations[lang as Lang] || translations.en

  const handleSave = () => {
    console.log("Saving settings:", settings)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-clash">{t.settings}</h1>
        <p className="mt-2 text-gray-600 font-inter">{t.configure}</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t.generalSettings}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">{t.storeName}</Label>
              <Input
                id="store-name"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-email">{t.storeEmail}</Label>
              <Input
                id="store-email"
                type="email"
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">{t.currency}</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => setSettings({ ...settings, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="DZD">DZD (د.ج)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">{t.timezone}</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => setSettings({ ...settings, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Africa/Algiers">Africa/Algiers</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t.notifications}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">{t.emailNotifications}</Label>
              <p className="text-sm text-gray-600">{t.receiveEmail}</p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="order-notifications">{t.orderNotifications}</Label>
              <p className="text-sm text-gray-600">{t.getNotified}</p>
            </div>
            <Switch
              id="order-notifications"
              checked={settings.orderNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, orderNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="low-stock-alerts">{t.lowStockAlerts}</Label>
              <p className="text-sm text-gray-600">{t.alertLowStock}</p>
            </div>
            <Switch
              id="low-stock-alerts"
              checked={settings.lowStockAlerts}
              onCheckedChange={(checked) => setSettings({ ...settings, lowStockAlerts: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t.system}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance-mode">{t.maintenanceMode}</Label>
              <p className="text-sm text-gray-600">{t.putStoreMaintenance}</p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          <Save className="mr-2 h-4 w-4" />
          {t.saveSettings}
        </Button>
      </div>
    </div>
  )
}
