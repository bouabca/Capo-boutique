"use client"

import { useState, useContext, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Save, ExternalLink, CheckCircle, XCircle } from "lucide-react"
import { LanguageContext } from "../layout"

const translations = {
  en: {
    integrations: "Integrations",
    manageIntegrations: "Manage your third-party integrations",
    connectService: "Connect a Service",
    connected: "Connected",
    notConnected: "Not Connected",
    connect: "Connect",
    disconnect: "Disconnect",
    integrationName: "Integration Name",
    status: "Status",
    actions: "Actions",
    'Google Sheets': 'Google Sheets',
    'Connected': 'Connected',
    'Disconnected': 'Disconnected',
    'Export orders and data to Google Sheets': 'Export orders and data to Google Sheets',
    'API Key': 'API Key',
    'Enter Google Sheets API key': 'Enter Google Sheets API key',
    'Sheet ID': 'Sheet ID',
    'Enter Google Sheet ID': 'Enter Google Sheet ID',
    'Test Connection': 'Test Connection',
    'View Documentation': 'View Documentation',
    'Google Analytics': 'Google Analytics',
    'Track website analytics and user behavior': 'Track website analytics and user behavior',
    'Tracking ID': 'Tracking ID',
    'Facebook Pixel': 'Facebook Pixel',
    'Track conversions and optimize Facebook ads': 'Track conversions and optimize Facebook ads',
    'Pixel ID': 'Pixel ID',
    'Enter Facebook Pixel ID': 'Enter Facebook Pixel ID',
    'Save All Integrations': 'Save All Integrations',
  },
  fr: {
    integrations: "Intégrations",
    manageIntegrations: "Gérez vos intégrations tierces",
    connectService: "Connecter un service",
    connected: "Connecté",
    notConnected: "Non connecté",
    connect: "Connecter",
    disconnect: "Déconnecter",
    integrationName: "Nom de l'intégration",
    status: "Statut",
    actions: "Actions",
    'Google Sheets': 'Google Sheets',
    'Connected': 'Connecté',
    'Disconnected': 'Déconnecté',
    'Export orders and data to Google Sheets': 'Exporter les commandes et données vers Google Sheets',
    'API Key': 'Clé API',
    'Enter Google Sheets API key': 'Entrez la clé API Google Sheets',
    'Sheet ID': 'ID de la feuille',
    'Enter Google Sheet ID': 'Entrez l\'ID de la feuille Google',
    'Test Connection': 'Tester la connexion',
    'View Documentation': 'Voir la documentation',
    'Google Analytics': 'Google Analytics',
    'Track website analytics and user behavior': 'Suivez les analyses et le comportement des utilisateurs',
    'Tracking ID': 'ID de suivi',
    'Facebook Pixel': 'Pixel Facebook',
    'Track conversions and optimize Facebook ads': 'Suivez les conversions et optimisez les publicités Facebook',
    'Pixel ID': 'ID du pixel',
    'Enter Facebook Pixel ID': 'Entrez l\'ID du pixel Facebook',
    'Save All Integrations': 'Enregistrer toutes les intégrations',
  },
  ar: {
    integrations: "التكاملات",
    manageIntegrations: "إدارة تكاملات الطرف الثالث",
    connectService: "ربط خدمة",
    connected: "متصل",
    notConnected: "غير متصل",
    connect: "ربط",
    disconnect: "فصل",
    integrationName: "اسم التكامل",
    status: "الحالة",
    actions: "الإجراءات",
    'Google Sheets': 'جوجل شيتس',
    'Connected': 'متصل',
    'Disconnected': 'غير متصل',
    'Export orders and data to Google Sheets': 'تصدير الطلبات والبيانات إلى جوجل شيتس',
    'API Key': 'مفتاح API',
    'Enter Google Sheets API key': 'أدخل مفتاح جوجل شيتس API',
    'Sheet ID': 'معرف الورقة',
    'Enter Google Sheet ID': 'أدخل معرف جوجل شيتس',
    'Test Connection': 'اختبار الاتصال',
    'View Documentation': 'عرض التوثيق',
    'Google Analytics': 'تحليلات جوجل',
    'Track website analytics and user behavior': 'تتبع تحليلات الموقع وسلوك المستخدم',
    'Tracking ID': 'معرف التتبع',
    'Facebook Pixel': 'فيسبوك بيكسل',
    'Track conversions and optimize Facebook ads': 'تتبع التحويلات وتحسين إعلانات فيسبوك',
    'Pixel ID': 'معرف البيكسل',
    'Enter Facebook Pixel ID': 'أدخل معرف فيسبوك بيكسل',
    'Save All Integrations': 'حفظ جميع التكاملات',
  },
} as const;

type Lang = keyof typeof translations;

const t = (key: string, lang: string) => {
  const translations: any = {
    en: {
      'Integrations': 'Integrations',
      'Connect your store with external services': 'Connect your store with external services',
      'Google Sheets': 'Google Sheets',
      'Connected': 'Connected',
      'Disconnected': 'Disconnected',
      'Export orders and data to Google Sheets': 'Export orders and data to Google Sheets',
      'API Key': 'API Key',
      'Enter Google Sheets API key': 'Enter Google Sheets API key',
      'Sheet ID': 'Sheet ID',
      'Enter Google Sheet ID': 'Enter Google Sheet ID',
      'Test Connection': 'Test Connection',
      'View Documentation': 'View Documentation',
      'Google Analytics': 'Google Analytics',
      'Track website analytics and user behavior': 'Track website analytics and user behavior',
      'Tracking ID': 'Tracking ID',
      'Facebook Pixel': 'Facebook Pixel',
      'Track conversions and optimize Facebook ads': 'Track conversions and optimize Facebook ads',
      'Pixel ID': 'Pixel ID',
      'Enter Facebook Pixel ID': 'Enter Facebook Pixel ID',
      'Save All Integrations': 'Save All Integrations',
    },
    fr: {
      'Integrations': 'Intégrations',
      'Connect your store with external services': 'Connectez votre boutique à des services externes',
      'Google Sheets': 'Google Sheets',
      'Connected': 'Connecté',
      'Disconnected': 'Déconnecté',
      'Export orders and data to Google Sheets': 'Exporter les commandes et données vers Google Sheets',
      'API Key': 'Clé API',
      'Enter Google Sheets API key': 'Entrez la clé API Google Sheets',
      'Sheet ID': 'ID de la feuille',
      'Enter Google Sheet ID': 'Entrez l\'ID de la feuille Google',
      'Test Connection': 'Tester la connexion',
      'View Documentation': 'Voir la documentation',
      'Google Analytics': 'Google Analytics',
      'Track website analytics and user behavior': 'Suivez les analyses et le comportement des utilisateurs',
      'Tracking ID': 'ID de suivi',
      'Facebook Pixel': 'Pixel Facebook',
      'Track conversions and optimize Facebook ads': 'Suivez les conversions et optimisez les publicités Facebook',
      'Pixel ID': 'ID du pixel',
      'Enter Facebook Pixel ID': 'Entrez l\'ID du pixel Facebook',
      'Save All Integrations': 'Enregistrer toutes les intégrations',
    },
    ar: {
      'Integrations': 'التكاملات',
      'Connect your store with external services': 'اربط متجرك بالخدمات الخارجية',
      'Google Sheets': 'جوجل شيتس',
      'Connected': 'متصل',
      'Disconnected': 'غير متصل',
      'Export orders and data to Google Sheets': 'تصدير الطلبات والبيانات إلى جوجل شيتس',
      'API Key': 'مفتاح API',
      'Enter Google Sheets API key': 'أدخل مفتاح جوجل شيتس API',
      'Sheet ID': 'معرف الورقة',
      'Enter Google Sheet ID': 'أدخل معرف جوجل شيتس',
      'Test Connection': 'اختبار الاتصال',
      'View Documentation': 'عرض التوثيق',
      'Google Analytics': 'تحليلات جوجل',
      'Track website analytics and user behavior': 'تتبع تحليلات الموقع وسلوك المستخدم',
      'Tracking ID': 'معرف التتبع',
      'Facebook Pixel': 'فيسبوك بيكسل',
      'Track conversions and optimize Facebook ads': 'تتبع التحويلات وتحسين إعلانات فيسبوك',
      'Pixel ID': 'معرف البيكسل',
      'Enter Facebook Pixel ID': 'أدخل معرف فيسبوك بيكسل',
      'Save All Integrations': 'حفظ جميع التكاملات',
    },
  };
  return translations[lang]?.[key] || key;
};

export default function IntegrationsPage() {
  const { lang } = useContext(LanguageContext);
  const [sheets, setSheets] = useState<{ name: string; id: string }[]>([]);
  const [facebookPixelId, setFacebookPixelId] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [customToast, setCustomToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Fetch integration data on mount
  useEffect(() => {
    setLoading(true);
    fetch("/api/main/integration")
      .then(res => res.json())
      .then(data => {
        if (data.integration) {
          setSheets(Array.isArray(data.integration.sheetsIntegration) ? data.integration.sheetsIntegration : []);
          setFacebookPixelId(data.integration.facebookPixelId || "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSheetChange = (idx: number, field: 'name' | 'id', value: string) => {
    setSheets(sheets => sheets.map((sheet, i) => i === idx ? { ...sheet, [field]: value } : sheet));
  };

  const handleAddSheet = () => {
    setSheets(sheets => [...sheets, { name: '', id: '' }]);
  };

  const handleRemoveSheet = (idx: number) => {
    setSheets(sheets => sheets.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSuccess(false);
    const res = await fetch("/api/main/integration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheets, facebookPixelId }),
    });
    if (res.ok) {
      setSuccess(true);
      setCustomToast({ type: 'success', message: t('Saved successfully!', lang) || 'Saved successfully!' });
      setTimeout(() => setCustomToast(null), 3000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;

  return (
    <>
      {customToast && (
        <div className={`fixed top-4 left-1/2 z-[9999] -translate-x-1/2 px-6 py-3 rounded shadow-lg font-semibold text-center ${customToast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{customToast.message}</div>
      )}
      <div className="space-y-6 bg-white text-black">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-clash">{t("integrations", lang)}</h1>
          <p className="mt-2 text-gray-600 font-inter">{t("manageIntegrations", lang)}</p>
        </div>

        {/* Google Sheets Integrations */}
        <Card className="bg-white text-black">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  {t('Google Sheets', lang)}
                  <Badge variant={sheets.length > 0 ? "default" : "secondary"} className="ml-2">
                    {sheets.length > 0 ? t('Connected', lang) : t('Disconnected', lang)}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{t('Export orders and data to Google Sheets', lang)}</p>
              </div>
              {sheets.length > 0 ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-gray-400" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sheets.map((sheet, idx) => (
              <div key={idx} className="flex items-center space-x-2 mb-2">
                <div className="flex-1 space-y-2">
                  <Label>{t('Sheet ID', lang)}</Label>
                  <Input
                    value={sheet.id}
                    onChange={e => handleSheetChange(idx, 'id', e.target.value)}
                    placeholder={t('Enter Google Sheet ID', lang)}
                    className="bg-white text-black border-gray-300 focus:ring-green-200"
                  />
                  <Label>{t('Integration Name', lang)}</Label>
                  <Input
                    value={sheet.name}
                    onChange={e => handleSheetChange(idx, 'name', e.target.value)}
                    placeholder={t('Integration Name', lang)}
                    className="bg-white text-black border-gray-300 focus:ring-green-200"
                  />
                </div>
                <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveSheet(idx)}>
                  <XCircle className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            ))}
            <Button type="button" onClick={handleAddSheet} className="bg-green-100 text-green-800 border border-green-300 hover:bg-green-200">
              + {t('Connect Service', lang)}
            </Button>
          </CardContent>
        </Card>

        {/* Facebook Pixel Integration */}
        <Card className="bg-white text-black">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  {t('Facebook Pixel', lang)}
                  <Badge variant={facebookPixelId ? "default" : "secondary"} className="ml-2">
                    {facebookPixelId ? t('Connected', lang) : t('Disconnected', lang)}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{t('Track conversions and optimize Facebook ads', lang)}</p>
              </div>
              {facebookPixelId ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-gray-400" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pixel-id">{t('Pixel ID', lang)}</Label>
              <Input
                id="pixel-id"
                value={facebookPixelId}
                onChange={e => setFacebookPixelId(e.target.value)}
                placeholder={t('Enter Facebook Pixel ID', lang)}
                className="bg-white text-black border-gray-300 focus:ring-green-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
            <Save className="mr-2 h-4 w-4" />
            {t('Save All Integrations', lang)}
          </Button>
        </div>
      </div>
    </>
  )
}
