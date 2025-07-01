"use client"

import { useState, useContext, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Upload, X } from "lucide-react"
import { LanguageContext } from "../layout"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function CMSPage() {
  const [heroData, setHeroData] = useState({
    title: "",
    subtitle: "",
    heroImage: "",
    heroTitleColor: "#000000",
    heroDescriptionColor: "#000000",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [customToast, setCustomToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { lang } = useContext(LanguageContext)
  const { toast } = useToast()

  const translations = {
    en: {
      contentManagement: "Content Management",
      manageContent: "Manage your website content and appearance",
      heroSection: "Hero Section",
      heroTitle: "Hero Title",
      enterHeroTitle: "Enter hero title",
      heroSubtitle: "Hero Subtitle",
      enterHeroSubtitle: "Enter hero subtitle",
      heroImage: "Hero Image",
      upload: "Upload",
      saveChanges: "Save Changes",
    },
    ar: {
      contentManagement: "إدارة المحتوى",
      manageContent: "إدارة محتوى ومظهر موقعك",
      heroSection: "قسم البطل",
      heroTitle: "عنوان البطل",
      enterHeroTitle: "أدخل عنوان البطل",
      heroSubtitle: "وصف البطل",
      enterHeroSubtitle: "أدخل وصف البطل",
      heroImage: "صورة البطل",
      upload: "رفع",
      saveChanges: "حفظ التغييرات",
    },
    fr: {
      contentManagement: "Gestion du contenu",
      manageContent: "Gérez le contenu et l'apparence de votre site web",
      heroSection: "Section Héros",
      heroTitle: "Titre du héros",
      enterHeroTitle: "Entrez le titre du héros",
      heroSubtitle: "Sous-titre du héros",
      enterHeroSubtitle: "Entrez le sous-titre du héros",
      heroImage: "Image du héros",
      upload: "Télécharger",
      saveChanges: "Enregistrer les modifications",
    },
  } as const
  type Lang = keyof typeof translations
  const t = translations[lang as Lang] || translations.en

  useEffect(() => {
    // Fetch CMS data on mount
    const fetchCMS = async () => {
      try {
        const res = await fetch("/api/main/cms")
        const data = await res.json()
        if (data.cms) {
          setHeroData({
            title: data.cms.heroTitle || "",
            subtitle: data.cms.heroDescription || "",
            heroImage: data.cms.heroImage || "",
            heroTitleColor: data.cms.heroTitleColor || "#000000",
            heroDescriptionColor: data.cms.heroDescriptionColor || "#000000",
          })
        }
      } catch (e) {
        // ignore
      }
    }
    fetchCMS()
    // eslint-disable-next-line
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
      setHeroData({ ...heroData, heroImage: URL.createObjectURL(e.target.files[0]) })
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError("")
    setCustomToast(null)
    try {
      const formData = new FormData()
      formData.append("heroTitle", heroData.title)
      formData.append("heroDescription", heroData.subtitle)
      formData.append("heroTitleColor", heroData.heroTitleColor)
      formData.append("heroDescriptionColor", heroData.heroDescriptionColor)
      if (imageFile) {
        formData.append("heroImage", imageFile)
      }
      if (!heroData.heroImage) {
        formData.append("removeHeroImage", "true")
      }
      const res = await fetch("/api/main/cms", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to save CMS data.")
        setCustomToast({ type: 'error', message: data.error || "Failed to save CMS data." })
      } else {
        setHeroData({
          ...heroData,
          heroImage: data.cms.heroImage,
        })
        setImageFile(null)
        setCustomToast({ type: 'success', message: data.message || "CMS content saved successfully!" })
      }
    } catch (e) {
      setError("Failed to save CMS data.")
      setCustomToast({ type: 'error', message: "Failed to save CMS data." })
    }
    setLoading(false)
    setTimeout(() => setCustomToast(null), 3000)
  }

  return (
    <>
      {customToast && (
        <div className={`fixed top-4 left-1/2 z-[9999] -translate-x-1/2 px-6 py-3 rounded shadow-lg font-semibold text-center ${customToast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{customToast.message}</div>
      )}
      <Toaster />
      <div className="space-y-6 bg-white text-black">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-clash">{t.contentManagement}</h1>
          <p className="mt-2 text-gray-600 font-inter">{t.manageContent}</p>
        </div>

        {/* Hero Section Editor */}
        <Card className="bg-white text-black">
          <CardHeader>
            <CardTitle>{t.heroSection}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="hero-title">{t.heroTitle}</Label>
              <Input
                id="hero-title"
                value={heroData.title}
                onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                placeholder={t.enterHeroTitle}
                className="bg-white text-black border-gray-300 focus:ring-green-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero-subtitle">{t.heroSubtitle}</Label>
              <Textarea
                id="hero-subtitle"
                value={heroData.subtitle}
                onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                placeholder={t.enterHeroSubtitle}
                rows={3}
                className="bg-white text-black border-gray-300 focus:ring-green-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero-image">{t.heroImage}</Label>
              <div className="flex items-center space-x-2">
                <Input id="hero-image" type="file" accept="image/*" className="flex-1 bg-white text-black border-gray-300" ref={fileInputRef} onChange={handleImageChange} />
                <Button className="bg-green-600 hover:bg-green-700 text-white" type="button" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t.upload}
                </Button>
                {heroData.heroImage && (
                  <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => { setHeroData({ ...heroData, heroImage: "" }); setImageFile(null); }}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {heroData.heroImage && (
                <img src={heroData.heroImage} alt="Hero Preview" className="mt-2 rounded max-h-40" />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero-title-color">Hero Title Color</Label>
              <input
                id="hero-title-color"
                type="color"
                value={heroData.heroTitleColor}
                onChange={e => setHeroData({ ...heroData, heroTitleColor: e.target.value })}
                className="w-16 h-10 bg-white border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-description-color">Hero Description Color</Label>
              <input
                id="hero-description-color"
                type="color"
                value={heroData.heroDescriptionColor}
                onChange={e => setHeroData({ ...heroData, heroDescriptionColor: e.target.value })}
                className="w-16 h-10 bg-white border-gray-300"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : t.saveChanges}
              </Button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
