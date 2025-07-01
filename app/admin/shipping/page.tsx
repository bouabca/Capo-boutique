"use client"

import { useState, useEffect, useContext } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { LanguageContext } from "../layout"

interface Wilaya {
  id: string
  name: string
  deliveryPrice: number
  agencyName: string
  wilaya_number: number
  createdAt: string
}

export default function ShippingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [newWilaya, setNewWilaya] = useState({ name: "", deliveryPrice: "", agencyName: "", wilaya_number: "" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string>("")
  const [editingId, setEditingId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const { language, lang } = useContext(LanguageContext)

  const translations = {
    en: {
      shippingManagement: "Shipping Management",
      manageShipping: "Manage shipping fees by wilaya",
      addWilaya: "Add Wilaya",
      addNewWilaya: "Add New Wilaya",
      name: "Name",
      enterWilayaName: "Enter wilaya name",
      deliveryPrice: "Delivery Price (DA)",
      enterDeliveryPrice: "Enter delivery price",
      shippingAgency: "Shipping Agency",
      enterAgencyName: "Enter shipping agency name",
      wilayaNumber: "Wilaya Number",
      enterWilayaNumber: "Enter wilaya number",
      cancel: "Cancel",
      adding: "Adding...",
      add: "Add Wilaya",
      updateWilaya: "Update Wilaya",
      updating: "Updating...",
      update: "Update Wilaya",
      searchWilayas: "Search wilayas...",
      wilayas: "Wilayas",
      total: "total",
      loading: "Loading...",
      noWilayasFound: "No wilayas found",
      noWilayasAdded: "No wilayas added yet",
      agency: "Agency",
      actions: "Actions",
      areYouSure: "Are you sure?",
      deleteWarning: "This will permanently delete this wilaya and its shipping settings. This action cannot be undone.",
      delete: "Delete",
    },
    ar: {
      shippingManagement: "إدارة الشحن",
      manageShipping: "إدارة رسوم الشحن حسب الولاية",
      addWilaya: "إضافة ولاية",
      addNewWilaya: "إضافة ولاية جديدة",
      name: "الاسم",
      enterWilayaName: "أدخل اسم الولاية",
      deliveryPrice: "سعر التوصيل (دج)",
      enterDeliveryPrice: "أدخل سعر التوصيل",
      shippingAgency: "وكالة الشحن",
      enterAgencyName: "أدخل اسم وكالة الشحن",
      wilayaNumber: "رقم الولاية",
      enterWilayaNumber: "أدخل رقم الولاية",
      cancel: "إلغاء",
      adding: "جاري الإضافة...",
      add: "إضافة الولاية",
      updateWilaya: "تحديث الولاية",
      updating: "جاري التحديث...",
      update: "تحديث الولاية",
      searchWilayas: "ابحث عن الولايات...",
      wilayas: "الولايات",
      total: "الإجمالي",
      loading: "جاري التحميل...",
      noWilayasFound: "لم يتم العثور على ولايات",
      noWilayasAdded: "لم تتم إضافة ولايات بعد",
      agency: "الوكالة",
      actions: "الإجراءات",
      areYouSure: "هل أنت متأكد؟",
      deleteWarning: "سيتم حذف هذه الولاية وإعدادات الشحن الخاصة بها نهائيًا. لا يمكن التراجع عن هذا الإجراء.",
      delete: "حذف",
    },
    fr: {
      shippingManagement: "Gestion de la livraison",
      manageShipping: "Gérer les frais de livraison par wilaya",
      addWilaya: "Ajouter une wilaya",
      addNewWilaya: "Ajouter une nouvelle wilaya",
      name: "Nom",
      enterWilayaName: "Entrez le nom de la wilaya",
      deliveryPrice: "Prix de livraison (DA)",
      enterDeliveryPrice: "Entrez le prix de livraison",
      shippingAgency: "Agence de livraison",
      enterAgencyName: "Entrez le nom de l'agence de livraison",
      wilayaNumber: "Numéro de la wilaya",
      enterWilayaNumber: "Entrez le numéro de la wilaya",
      cancel: "Annuler",
      adding: "Ajout...",
      add: "Ajouter la wilaya",
      updateWilaya: "Mettre à jour la wilaya",
      updating: "Mise à jour...",
      update: "Mettre à jour la wilaya",
      searchWilayas: "Rechercher des wilayas...",
      wilayas: "Wilayas",
      total: "total",
      loading: "Chargement...",
      noWilayasFound: "Aucune wilaya trouvée",
      noWilayasAdded: "Aucune wilaya ajoutée pour le moment",
      agency: "Agence",
      actions: "Actions",
      areYouSure: "Êtes-vous sûr ?",
      deleteWarning: "Cette wilaya et ses paramètres de livraison seront supprimés définitivement. Cette action est irréversible.",
      delete: "Supprimer",
    },
  } as const;
  type Lang = keyof typeof translations;
  const t = translations[lang as Lang] || translations.en;

  // Fetch wilayas
  useEffect(() => {
    fetchWilayas()
  }, [])

  const fetchWilayas = async () => {
    try {
      const response = await fetch('/api/main/wilayas')
      const data = await response.json()
      setWilayas(data.wilayas || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load wilaya list",
        className: "text-red-600"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add new wilaya
  const handleAddWilaya = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/main/wilayas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newWilaya.name,
          deliveryPrice: Number(newWilaya.deliveryPrice),
          agencyName: newWilaya.agencyName,
          wilaya_number: newWilaya.wilaya_number
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to add wilaya")
      }
      
      toast({
        variant: "success",
        title: "Success!",
        description: data.message || "Wilaya added successfully",
        className: "text-green-600"
      })
      setNewWilaya({ name: "", deliveryPrice: "", agencyName: "", wilaya_number: "" })
      setIsDialogOpen(false)
      fetchWilayas()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Delete wilaya
  const handleDeleteWilaya = async () => {
    if (!deleteId) return
    
    try {
      const response = await fetch(`/api/main/wilayas/${deleteId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete wilaya")
      }
      
      toast({
        variant: "success",
        title: "Success!",
        description: data.message || "Wilaya deleted successfully",
        className: "text-green-600"
      })
      setIsDeleteDialogOpen(false)
      fetchWilayas()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    }
  }

  // Add update wilaya function
  const handleUpdateWilaya = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch(`/api/main/wilayas/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newWilaya.name,
          deliveryPrice: Number(newWilaya.deliveryPrice),
          agencyName: newWilaya.agencyName,
          wilaya_number: newWilaya.wilaya_number
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update wilaya")
      }
      
      toast({
        variant: "success",
        title: "Success!",
        description: data.message || "Wilaya updated successfully",
        className: "text-green-600"
      })
      setNewWilaya({ name: "", deliveryPrice: "", agencyName: "", wilaya_number: "" })
      setIsEditDialogOpen(false)
      fetchWilayas()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter wilayas based on search
  const filteredWilayas = wilayas.filter(wilaya => 
    wilaya.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{t.shippingManagement}</h1>
          <p className="mt-2 text-gray-500">{t.manageShipping}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-white rounded-md">
              <Plus className="mr-2 h-4 w-4" />
              {t.addWilaya}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium text-gray-900">{t.addNewWilaya}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddWilaya} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.name}</Label>
                <Input
                  value={newWilaya.name}
                  onChange={(e) => setNewWilaya(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t.enterWilayaName}
                  className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.deliveryPrice}</Label>
                <Input
                  type="number"
                  value={newWilaya.deliveryPrice}
                  onChange={(e) => setNewWilaya(prev => ({ ...prev, deliveryPrice: e.target.value }))}
                  placeholder={t.enterDeliveryPrice}
                  className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.shippingAgency}</Label>
                <Input
                  value={newWilaya.agencyName}
                  onChange={(e) => setNewWilaya(prev => ({ ...prev, agencyName: e.target.value }))}
                  placeholder={t.enterAgencyName}
                  className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.wilayaNumber}</Label>
                <Input
                  type="number"
                  value={newWilaya.wilaya_number}
                  onChange={e => setNewWilaya(prev => ({ ...prev, wilaya_number: e.target.value }))}
                  placeholder={t.enterWilayaNumber}
                  className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-gray-700 hover:bg-gray-50"
                >
                  {t.cancel}
                </Button>
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? t.adding : t.add}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium text-gray-900">{t.updateWilaya}</DialogTitle>
            </DialogHeader>              <form onSubmit={handleUpdateWilaya} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.name}</Label>
                <Input
                  value={newWilaya.name}
                  onChange={(e) => setNewWilaya(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t.enterWilayaName}
                  className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.deliveryPrice}</Label>
                <Input
                  type="number"
                  value={newWilaya.deliveryPrice}
                  onChange={(e) => setNewWilaya(prev => ({ ...prev, deliveryPrice: e.target.value }))}
                  placeholder={t.enterDeliveryPrice}
                  className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.shippingAgency}</Label>
                <Input
                  value={newWilaya.agencyName}
                  onChange={(e) => setNewWilaya(prev => ({ ...prev, agencyName: e.target.value }))}
                  placeholder={t.enterAgencyName}
                  className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.wilayaNumber}</Label>
                <Input
                  type="number"
                  value={newWilaya.wilaya_number}
                  onChange={e => setNewWilaya(prev => ({ ...prev, wilaya_number: e.target.value }))}
                  placeholder={t.enterWilayaNumber}
                  className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="text-gray-700 hover:bg-gray-50"
                >
                  {t.cancel}
                </Button>
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? t.updating : t.update}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder={t.searchWilayas}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-500"
        />
      </div>

      <Card className="rounded-lg border border-gray-100">
        <CardHeader className="py-4 px-6 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-xl font-semibold text-gray-900">{t.wilayas}</CardTitle>
              <span className="text-sm text-gray-500">({filteredWilayas.length} {t.total})</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-gray-500 bg-white">{t.loading}</div>
          ) : filteredWilayas.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500 bg-white">
              {searchQuery ? t.noWilayasFound : t.noWilayasAdded}
            </div>
          ) : (
            <div className="relative overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-3">{t.name}</th>
                    <th className="px-6 py-3">{t.deliveryPrice}</th>
                    <th className="px-6 py-3">{t.agency}</th>
                    <th className="px-6 py-3 w-[100px]">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredWilayas.map((wilaya) => (
                    <tr key={wilaya.id} className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{wilaya.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {typeof wilaya.deliveryPrice === 'number' ? `${wilaya.deliveryPrice.toLocaleString()} DA` : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{wilaya.agencyName}</td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <button
                          className="text-gray-700 hover:text-green-600 hover:bg-green-50 p-2 rounded-md transition-colors"
                          onClick={() => {
                              setEditingId(wilaya.id);
                              setNewWilaya({ 
                                name: wilaya.name,
                                deliveryPrice: wilaya.deliveryPrice.toString(),
                                agencyName: wilaya.agencyName,
                                wilaya_number: wilaya.wilaya_number?.toString() || ""
                              });
                              setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-700 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors"
                          onClick={() => {
                            setDeleteId(wilaya.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.areYouSure}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleDeleteWilaya}
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
