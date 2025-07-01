"use client"

import { useState, useContext, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Search, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LanguageContext } from "../layout"

export default function CouponsPage() {
  const [showAddCoupon, setShowAddCoupon] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { lang } = useContext(LanguageContext)

  // State for coupons and products from API
  const [coupons, setCoupons] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")

  // Add coupon form state
  const [couponCode, setCouponCode] = useState("")
  const [discountValue, setDiscountValue] = useState("")
  const [maxUses, setMaxUses] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [editCoupon, setEditCoupon] = useState<any | null>(null)
  const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchCouponsAndProducts()
  }, [])

  // Refetch coupons/products when dialog closes
  useEffect(() => {
    if (!showAddCoupon) {
      fetchCouponsAndProducts()
    }
  }, [showAddCoupon])

  const fetchCouponsAndProducts = async () => {
    try {
      const res = await fetch("/api/main/coupons")
      const data = await res.json()
      setCoupons(data.coupons || [])
      setProducts(data.products || [])
    } catch (e) {
      setCoupons([])
      setProducts([])
    }
  }

  const filteredCoupons = coupons.filter((coupon) => coupon.code.toLowerCase().includes(searchTerm.toLowerCase()))

  const generateCouponCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Add coupon handler
  const handleAddCoupon = async () => {
    setFormError("")
    setIsSubmitting(true)
    // Validate required fields
    if (!couponCode || !discountValue || !selectedProductId) {
      setFormError("Please fill all required fields and select a product.")
      setIsSubmitting(false)
      return
    }
    // Validate discount is a float
    const discount = parseFloat(discountValue)
    if (isNaN(discount)) {
      setFormError("Discount must be a number.")
      setIsSubmitting(false)
      return
    }
    // Validate maxUses if provided
    let maxUsage: number | null = null
    if (maxUses) {
      const parsed = parseInt(maxUses)
      if (isNaN(parsed) || parsed < 1) {
        setFormError("Maximum uses must be a positive number or empty for unlimited.")
        setIsSubmitting(false)
        return
      }
      maxUsage = parsed
    }
    // Prepare payload
    const payload: any = {
      code: couponCode,
      discount,
      isActive,
      expiresAt: expiryDate ? expiryDate : null,
      maxUsage,
      productIds: selectedProductId ? [selectedProductId] : []
    }
    // Send POST request
    const res = await fetch("/api/main/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) {
      setFormError(data.error || "Failed to add coupon.")
      setIsSubmitting(false)
      return
    }
    // Success: close dialog, refresh coupons, reset form
    setShowAddCoupon(false)
    setCouponCode("")
    setDiscountValue("")
    setMaxUses("")
    setExpiryDate("")
    setSelectedProductId("")
    setIsActive(true)
    setFormError("")
    setIsSubmitting(false)
  }

  // Update coupon handler
  const handleUpdateCoupon = async () => {
    if (!editCoupon) return
    setFormError("")
    setIsSubmitting(true)
    // Validate required fields
    if (!editCoupon.code || !editCoupon.discount || !editCoupon.products?.[0]?.product?.id) {
      setFormError("Please fill all required fields and select a product.")
      setIsSubmitting(false)
      return
    }
    const payload: any = {
      code: editCoupon.code,
      discount: parseFloat(editCoupon.discount),
      isActive: editCoupon.isActive,
      expiresAt: editCoupon.expiresAt ? editCoupon.expiresAt : null,
      maxUsage: editCoupon.maxUsage,
      productIds: [editCoupon.products[0].product.id]
    }
    const res = await fetch(`/api/main/coupons/${editCoupon.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) {
      setFormError(data.error || "Failed to update coupon.")
      setIsSubmitting(false)
      return
    }
    setEditCoupon(null)
    setFormError("")
    setIsSubmitting(false)
    fetchCouponsAndProducts()
  }

  // Delete coupon handler
  const handleDeleteCoupon = async () => {
    if (!deleteCouponId) return
    setIsDeleting(true)
    const res = await fetch(`/api/main/coupons/${deleteCouponId}`, {
      method: "DELETE"
    })
    const data = await res.json()
    setIsDeleting(false)
    setDeleteCouponId(null)
    fetchCouponsAndProducts()
  }

  const translations = {
    en: {
      coupons: "Coupons",
      manageCoupons: "Manage discount coupons and promotional codes",
      addCoupon: "Add Coupon",
      addNewCoupon: "Add New Coupon",
      couponCode: "Coupon Code",
      enterCouponCode: "Enter coupon code",
      generate: "Generate",
      discountType: "Discount Type",
      selectType: "Select type",
      percentage: "Percentage",
      fixedAmount: "Fixed Amount",
      freeShipping: "Free Shipping",
      discountValue: "Discount Value",
      minOrder: "Minimum Order ($)",
      maxUses: "Maximum Uses",
      expiryDate: "Expiry Date",
      cancel: "Cancel",
      add: "Add Coupon",
      searchCoupons: "Search coupons...",
      allCoupons: "All Coupons",
      code: "Code",
      type: "Type",
      value: "Value",
      minOrderCol: "Min Order",
      usage: "Usage",
      status: "Status",
      expiry: "Expiry",
      actions: "Actions",
      active: "Active",
      expired: "Expired",
      fixed: "Fixed Amount",
      percentageType: "Percentage",
      free: "Free",
      edit: "Edit",
      delete: "Delete",
      nA: "N/A",
      product: "Product",
      deleteConfirmation: "Are you sure you want to delete this coupon?"
    },
    ar: {
      coupons: "الكوبونات",
      manageCoupons: "إدارة كوبونات الخصم والرموز الترويجية",
      addCoupon: "إضافة كوبون",
      addNewCoupon: "إضافة كوبون جديد",
      couponCode: "رمز الكوبون",
      enterCouponCode: "أدخل رمز الكوبون",
      generate: "توليد",
      discountType: "نوع الخصم",
      selectType: "اختر النوع",
      percentage: "نسبة مئوية",
      fixedAmount: "مبلغ ثابت",
      freeShipping: "شحن مجاني",
      discountValue: "قيمة الخصم",
      minOrder: "الحد الأدنى للطلب (دج)",
      maxUses: "الحد الأقصى للاستخدامات",
      expiryDate: "تاريخ الانتهاء",
      cancel: "إلغاء",
      add: "إضافة الكوبون",
      searchCoupons: "ابحث عن الكوبونات...",
      allCoupons: "كل الكوبونات",
      code: "الرمز",
      type: "النوع",
      value: "القيمة",
      minOrderCol: "الحد الأدنى",
      usage: "الاستخدام",
      status: "الحالة",
      expiry: "الانتهاء",
      actions: "الإجراءات",
      active: "نشط",
      expired: "منتهي",
      fixed: "مبلغ ثابت",
      percentageType: "نسبة مئوية",
      free: "مجاني",
      edit: "تعديل",
      delete: "حذف",
      nA: "غير متوفر",
      product: "المنتج",
      deleteConfirmation: "هل أنت متأكد أنك تريد حذف هذا الكوبون؟"
    },
    fr: {
      coupons: "Coupons",
      manageCoupons: "Gérer les coupons de réduction et les codes promotionnels",
      addCoupon: "Ajouter un coupon",
      addNewCoupon: "Ajouter un nouveau coupon",
      couponCode: "Code du coupon",
      enterCouponCode: "Entrez le code du coupon",
      generate: "Générer",
      discountType: "Type de remise",
      selectType: "Sélectionnez le type",
      percentage: "Pourcentage",
      fixedAmount: "Montant fixe",
      freeShipping: "Livraison gratuite",
      discountValue: "Valeur de la remise",
      minOrder: "Commande min. (€)",
      maxUses: "Utilisations max.",
      expiryDate: "Date d'expiration",
      cancel: "Annuler",
      add: "Ajouter le coupon",
      searchCoupons: "Rechercher des coupons...",
      allCoupons: "Tous les coupons",
      code: "Code",
      type: "Type",
      value: "Valeur",
      minOrderCol: "Commande min.",
      usage: "Utilisation",
      status: "Statut",
      expiry: "Expiration",
      actions: "Actions",
      active: "Actif",
      expired: "Expiré",
      fixed: "Montant fixe",
      percentageType: "Pourcentage",
      free: "Gratuit",
      edit: "Modifier",
      delete: "Supprimer",
      nA: "N/A",
      product: "Produit",
      deleteConfirmation: "Êtes-vous sûr de vouloir supprimer ce coupon ?"
    },
  } as const
  type Lang = keyof typeof translations
  const t = translations[lang as Lang] || translations.en

  return (
    <div className="space-y-6 p-6 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black font-clash">{t.coupons}</h1>
          <p className="mt-2 text-gray-700 font-inter">{t.manageCoupons}</p>
        </div>
        <Dialog open={showAddCoupon} onOpenChange={setShowAddCoupon}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              {t.addCoupon}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium text-black">{t.addNewCoupon}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coupon-code" className="text-black">{t.couponCode}</Label>
                  <div className="flex space-x-2">
                    <Input id="coupon-code" placeholder={t.enterCouponCode} className="flex-1 bg-gray-50 border border-gray-200 text-black" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-green-500 text-white border-green-500"
                      onClick={() => {
                        const code = generateCouponCode();
                        setCouponCode(code);
                      }}
                    >
                      {t.generate}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount-value" className="text-black">{t.discountValue}</Label>
                  <Input id="discount-value" type="number" step="0.01" placeholder="0" className="bg-gray-50 border border-gray-200 text-black" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-uses" className="text-black">{t.maxUses}</Label>
                  <Input id="max-uses" type="number" placeholder="Unlimited" className="bg-gray-50 border border-gray-200 text-black" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry-date" className="text-black">{t.expiryDate}</Label>
                  <Input id="expiry-date" type="date" className="bg-gray-50 border border-gray-200 text-black" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="products" className="text-black">Select Product</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger className="bg-gray-50 border border-gray-200 text-black">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>{product.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" className="bg-gray-900 text-white" onClick={() => setShowAddCoupon(false)}>
                  {t.cancel}
                </Button>
                <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleAddCoupon} disabled={isSubmitting}>
                  {t.add}
                </Button>
              </div>
            </div>
            {formError && <p className="text-red-500">{formError}</p>}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t.searchCoupons}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 bg-gray-50 border-none hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-green-200 transition-colors text-black"
            />
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-black">{t.allCoupons} ({filteredCoupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">{t.code}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">{t.product}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">{t.value}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">{t.usage}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">{t.expiry}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-gray-100 bg-white">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-medium text-black">{coupon.code}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => navigator.clipboard.writeText(coupon.code)}>
                          <Copy className="h-3 w-3 text-black" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-black">{coupon.products.map((p: any) => p.product.title).join(', ')}</td>
                    <td className="py-4 px-4 text-black">{coupon.discount} DA</td>
                    <td className="py-4 px-4 text-black">
                      {coupon.usedCount}/{coupon.maxUsage === 0 || coupon.maxUsage === null ? t.nA : coupon.maxUsage}
                    </td>
                    <td className="py-4 px-4 text-black">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : t.nA}</td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="bg-gray-50 border-green-500 text-green-700 hover:bg-green-50" onClick={() => setEditCoupon(coupon)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="bg-gray-50 border-red-300 text-red-600 hover:bg-red-50" onClick={() => setDeleteCouponId(coupon.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Coupon Dialog */}
      <Dialog open={!!editCoupon} onOpenChange={setEditCoupon}>
       
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-black">{t.edit}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-code" className="text-black">{t.couponCode}</Label>
                <Input id="coupon-code" placeholder={t.enterCouponCode} className="flex-1 bg-gray-50 border border-gray-200 text-black" value={editCoupon?.code} onChange={(e) => setEditCoupon({ ...editCoupon, code: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount-value" className="text-black">{t.discountValue}</Label>
                <Input id="discount-value" type="number" step="0.01" placeholder="0" className="bg-gray-50 border border-gray-200 text-black" value={editCoupon?.discount} onChange={(e) => setEditCoupon({ ...editCoupon, discount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-uses" className="text-black">{t.maxUses}</Label>
                <Input id="max-uses" type="number" placeholder="Unlimited" className="bg-gray-50 border border-gray-200 text-black" value={editCoupon?.maxUsage} onChange={(e) => setEditCoupon({ ...editCoupon, maxUsage: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry-date" className="text-black">{t.expiryDate}</Label>
                <Input id="expiry-date" type="date" className="bg-gray-50 border border-gray-200 text-black" value={editCoupon?.expiresAt ? new Date(editCoupon.expiresAt).toISOString().split('T')[0] : ''} onChange={(e) => setEditCoupon({ ...editCoupon, expiresAt: e.target.value ? e.target.value : null })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="products" className="text-black">Select Product</Label>
              <Select value={editCoupon?.products?.[0]?.product?.id} onValueChange={(value) => setEditCoupon({ ...editCoupon, productIds: value ? [value] : [] })}>
                <SelectTrigger className="bg-gray-50 border border-gray-200 text-black">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>{product.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" className="bg-gray-900 text-white" onClick={() => setEditCoupon(null)}>
                {t.cancel}
              </Button>
              <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleUpdateCoupon} disabled={isSubmitting}>
                {t.edit}
              </Button>
            </div>
          </div>
          {formError && <p className="text-red-500">{formError}</p>}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteCouponId} onOpenChange={(open) => { if (!open) setDeleteCouponId(null) }}>
        
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-black">{t.delete}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-black">{t.deleteConfirmation}</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" className="bg-gray-900 text-white" onClick={() => setDeleteCouponId(null)}>
                {t.cancel}
              </Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDeleteCoupon} disabled={isDeleting}>
                {t.delete}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
