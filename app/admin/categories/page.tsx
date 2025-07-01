"use client"

import { useState, useEffect, useContext } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Search, Plus, Edit, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { LanguageContext } from "../layout"

interface CategoryType {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export default function CategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [newCategory, setNewCategory] = useState({ name: "" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string>("")
  const [editingId, setEditingId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const { language, lang } = useContext(LanguageContext)

  const translations = {
    en: {
      categoryManagement: "Category Management",
      manageCategories: "Manage your product categories",
      addCategory: "Add Category",
      addNewCategory: "Add New Category",
      categoryName: "Category Name",
      enterCategoryName: "Enter category name",
      cancel: "Cancel",
      adding: "Adding...",
      add: "Add Category",
      editCategory: "Edit Category",
      updating: "Updating...",
      update: "Update Category",
      searchCategories: "Search categories...",
      categories: "Categories",
      total: "total",
      loading: "Loading...",
      noCategoriesFound: "No categories found",
      noCategoriesAdded: "No categories added yet",
      createdAt: "Created At",
      updatedAt: "Updated At",
      actions: "Actions",
      areYouSure: "Are you sure?",
      deleteWarning: "This will permanently delete this category. This action cannot be undone. Products associated with this category will not have a category.",
      delete: "Delete",
    },
    ar: {
      categoryManagement: "إدارة الفئات",
      manageCategories: "إدارة فئات المنتجات",
      addCategory: "إضافة فئة",
      addNewCategory: "إضافة فئة جديدة",
      categoryName: "اسم الفئة",
      enterCategoryName: "أدخل اسم الفئة",
      cancel: "إلغاء",
      adding: "جاري الإضافة...",
      add: "إضافة الفئة",
      editCategory: "تعديل الفئة",
      updating: "جاري التحديث...",
      update: "تحديث الفئة",
      searchCategories: "ابحث عن الفئات...",
      categories: "الفئات",
      total: "الإجمالي",
      loading: "جاري التحميل...",
      noCategoriesFound: "لم يتم العثور على فئات",
      noCategoriesAdded: "لم تتم إضافة فئات بعد",
      createdAt: "تاريخ الإنشاء",
      updatedAt: "تاريخ التحديث",
      actions: "الإجراءات",
      areYouSure: "هل أنت متأكد؟",
      deleteWarning: "سيتم حذف هذه الفئة نهائيًا. لا يمكن التراجع عن هذا الإجراء. المنتجات المرتبطة بهذه الفئة لن يكون لها فئة.",
      delete: "حذف",
    },
    fr: {
      categoryManagement: "Gestion des catégories",
      manageCategories: "Gérer vos catégories de produits",
      addCategory: "Ajouter une catégorie",
      addNewCategory: "Ajouter une nouvelle catégorie",
      categoryName: "Nom de la catégorie",
      enterCategoryName: "Entrez le nom de la catégorie",
      cancel: "Annuler",
      adding: "Ajout...",
      add: "Ajouter la catégorie",
      editCategory: "Modifier la catégorie",
      updating: "Mise à jour...",
      update: "Mettre à jour la catégorie",
      searchCategories: "Rechercher des catégories...",
      categories: "Catégories",
      total: "total",
      loading: "Chargement...",
      noCategoriesFound: "Aucune catégorie trouvée",
      noCategoriesAdded: "Aucune catégorie ajoutée pour le moment",
      createdAt: "Créé le",
      updatedAt: "Mis à jour le",
      actions: "Actions",
      areYouSure: "Êtes-vous sûr ?",
      deleteWarning: "Cette catégorie sera supprimée définitivement. Cette action est irréversible. Les produits associés à cette catégorie n'auront plus de catégorie.",
      delete: "Supprimer",
    },
  } as const;
  type Lang = keyof typeof translations;
  const t = translations[lang as Lang] || translations.en;

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/main/categories')
      const data = await response.json()
      if (response.ok) {
        setCategories(data.categories || [])
      } else {
        throw new Error(data.error || "Failed to load categories")
      }
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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/main/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add category")
      }

      toast({
        variant: "success",
        title: "Success!",
        description: data.message || "Category added successfully"
      })
      setNewCategory({ name: "" })
      setIsDialogOpen(false)
      fetchCategories()
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

  const handleEditClick = (category: CategoryType) => {
    setEditingId(category.id)
    setNewCategory({ name: category.name })
    setIsEditDialogOpen(true)
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/main/categories/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update category")
      }

      toast({
        variant: "success",
        title: "Success!",
        description: data.message || "Category updated successfully"
      })
      setNewCategory({ name: "" })
      setIsEditDialogOpen(false)
      fetchCategories()
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

  const handleDeleteCategory = async () => {
    if (!deleteId) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/main/categories/${deleteId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to delete category")

      toast({
        variant: "success",
        title: "Success!",
        description: data.message || "Category deleted successfully"
      })
      setIsDeleteDialogOpen(false)
      fetchCategories()
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

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <Toaster />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{t.categoryManagement}</h1>
          <p className="mt-2 text-gray-500">{t.manageCategories}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-white rounded-md">
              <Plus className="mr-2 h-4 w-4" />
              {t.addCategory}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium text-gray-900">{t.addNewCategory}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.categoryName}</Label>
                <Input
                  placeholder={t.enterCategoryName}
                  className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ name: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="text-gray-700 hover:bg-gray-50">
                  {t.cancel}
                </Button>
                <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white" disabled={isLoading}>
                  {isLoading ? t.adding : t.add}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium text-gray-900">{t.editCategory}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateCategory} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.categoryName}</Label>
                <Input
                  placeholder={t.enterCategoryName}
                  className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ name: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="text-gray-700 hover:bg-gray-50">
                  {t.cancel}
                </Button>
                <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white" disabled={isLoading}>
                  {isLoading ? t.updating : t.update}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative w-full mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder={t.searchCategories}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-500"
        />
      </div>

      {/* Categories Table */}
      <Card className="rounded-lg border border-gray-100">
        <CardHeader className="py-4 px-6 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-xl font-semibold text-gray-900">{t.categories}</CardTitle>
              <span className="text-sm text-gray-500">({filteredCategories.length} {t.total})</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-gray-500 bg-white">{t.loading}</div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500 bg-white">
              {searchTerm ? t.noCategoriesFound : t.noCategoriesAdded}
            </div>
          ) : (
            <div className="relative overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-3">{t.categoryName}</th>
                    <th className="px-6 py-3">{t.createdAt}</th>
                    <th className="px-6 py-3">{t.updatedAt}</th>
                    <th className="px-6 py-3">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{new Date(category.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{new Date(category.updatedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <button
                          className="text-gray-700 hover:text-green-600 hover:bg-green-50 p-2 rounded-md transition-colors"
                          onClick={() => handleEditClick(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-700 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors"
                          onClick={() => {
                            setDeleteId(category.id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="h-4 w-4" />
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
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleDeleteCategory}
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 