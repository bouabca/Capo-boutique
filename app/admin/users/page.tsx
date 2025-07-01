"use client"

import { useState, useEffect, useContext } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Search, Trash } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LanguageContext } from "../layout";

interface UserType {
  id: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "EMPLOYEE"
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string>("")
  const [editingId, setEditingId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isPasswordRequired, setIsPasswordRequired] = useState(true);
  const { lang } = useContext(LanguageContext);

  const translations = {
    en: {
      userManagement: "User Management",
      manageUsers: "Manage admin users and their permissions",
      addUser: "Add User",
      addNewUser: "Add New User",
      email: "Email",
      enterEmail: "Enter email address",
      password: "Password",
      enterPassword: "Enter password",
      passwordOptional: "Password (Optional)",
      leaveBlank: "Leave blank to keep current password",
      role: "Role",
      selectRole: "Select a role",
      admin: "Admin",
      employee: "Employee",
      cancel: "Cancel",
      adding: "Adding...",
      add: "Add User",
      editUser: "Edit User",
      updating: "Updating...",
      update: "Update User",
      searchUsers: "Search users...",
      users: "Users",
      total: "total",
      loading: "Loading...",
      noUsersFound: "No users found",
      noUsersAdded: "No users added yet",
      createdAt: "Created At",
      updatedAt: "Updated At",
      actions: "Actions",
      areYouSure: "Are you sure?",
      deleteWarning: "This will permanently delete this user. This action cannot be undone.",
      delete: "Delete",
    },
    ar: {
      userManagement: "إدارة المستخدمين",
      manageUsers: "إدارة مستخدمي لوحة التحكم وصلاحياتهم",
      addUser: "إضافة مستخدم",
      addNewUser: "إضافة مستخدم جديد",
      email: "البريد الإلكتروني",
      enterEmail: "أدخل البريد الإلكتروني",
      password: "كلمة المرور",
      enterPassword: "أدخل كلمة المرور",
      passwordOptional: "كلمة المرور (اختياري)",
      leaveBlank: "اتركه فارغًا للاحتفاظ بكلمة المرور الحالية",
      role: "الدور",
      selectRole: "اختر الدور",
      admin: "مدير",
      employee: "موظف",
      cancel: "إلغاء",
      adding: "جاري الإضافة...",
      add: "إضافة المستخدم",
      editUser: "تعديل المستخدم",
      updating: "جاري التحديث...",
      update: "تحديث المستخدم",
      searchUsers: "ابحث عن المستخدمين...",
      users: "المستخدمون",
      total: "الإجمالي",
      loading: "جاري التحميل...",
      noUsersFound: "لم يتم العثور على مستخدمين",
      noUsersAdded: "لم تتم إضافة مستخدمين بعد",
      createdAt: "تاريخ الإنشاء",
      updatedAt: "تاريخ التحديث",
      actions: "الإجراءات",
      areYouSure: "هل أنت متأكد؟",
      deleteWarning: "سيتم حذف هذا المستخدم نهائيًا. لا يمكن التراجع عن هذا الإجراء.",
      delete: "حذف",
    },
    fr: {
      userManagement: "Gestion des utilisateurs",
      manageUsers: "Gérer les utilisateurs admin et leurs permissions",
      addUser: "Ajouter un utilisateur",
      addNewUser: "Ajouter un nouvel utilisateur",
      email: "Email",
      enterEmail: "Entrez l'adresse email",
      password: "Mot de passe",
      enterPassword: "Entrez le mot de passe",
      passwordOptional: "Mot de passe (Optionnel)",
      leaveBlank: "Laissez vide pour garder le mot de passe actuel",
      role: "Rôle",
      selectRole: "Sélectionnez un rôle",
      admin: "Admin",
      employee: "Employé",
      cancel: "Annuler",
      adding: "Ajout...",
      add: "Ajouter l'utilisateur",
      editUser: "Modifier l'utilisateur",
      updating: "Mise à jour...",
      update: "Mettre à jour l'utilisateur",
      searchUsers: "Rechercher des utilisateurs...",
      users: "Utilisateurs",
      total: "total",
      loading: "Chargement...",
      noUsersFound: "Aucun utilisateur trouvé",
      noUsersAdded: "Aucun utilisateur ajouté pour le moment",
      createdAt: "Créé le",
      updatedAt: "Mis à jour le",
      actions: "Actions",
      areYouSure: "Êtes-vous sûr ?",
      deleteWarning: "Cet utilisateur sera supprimé définitivement. Cette action est irréversible.",
      delete: "Supprimer",
    },
  } as const;
  type Lang = keyof typeof translations;
  const t = translations[lang as Lang] || translations.en;

  // Fetch users
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/main/users')
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users || [])
      } else {
        throw new Error(data.error || "Failed to load users")
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

  // Add new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/main/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to add user")
      toast({
        variant: "success",
        title: "Success!",
        description: data.message || "User added successfully"
      })
      setNewUser({ email: "", password: "", role: "EMPLOYEE" })
      setIsDialogOpen(false)
      fetchUsers()
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

  // Delete user
  const handleDeleteUser = async () => {
    if (!deleteId) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/main/users/${deleteId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to delete user")
      toast({
        variant: "success",
        title: "Success!",
        description: data.message || "User deleted successfully"
      })
      setIsDeleteDialogOpen(false)
      fetchUsers()
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

  // Handle edit click to populate form
  const handleEditClick = (user: UserType) => {
    setEditingId(user.id);
    setNewUser({
      email: user.email,
      password: "",
      role: user.role,
    });
    setIsPasswordRequired(false);
    setIsEditDialogOpen(true);
  };

  // Edit user
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const updateData: any = { email: newUser.email, role: newUser.role };
      if (newUser.password) {
        updateData.password = newUser.password;
      }

      const response = await fetch(`/api/main/users/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to update user")
      toast({
        variant: "success",
        title: "Success!",
        description: data.message || "User updated successfully"
      })
      setNewUser({ email: "", password: "", role: "EMPLOYEE" })
      setIsEditDialogOpen(false)
      fetchUsers()
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

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6">
      <Toaster />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{t.userManagement}</h1>
          <p className="mt-2 text-gray-500">{t.manageUsers}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-white rounded-md">
              <Plus className="mr-2 h-4 w-4" />
              {t.addUser}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium text-gray-900">{t.addNewUser}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.email}</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t.enterEmail}
                  required
                  className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.password}</Label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={t.enterPassword}
                  required={isPasswordRequired}
                  className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.role}</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                  required
                >
                  <SelectTrigger className="w-full bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400">
                    <SelectValue placeholder={t.selectRole} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="ADMIN">{t.admin}</SelectItem>
                    <SelectItem value="EMPLOYEE">{t.employee}</SelectItem>
                  </SelectContent>
                </Select>
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

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium text-gray-900">{t.editUser}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditUser} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.email}</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t.enterEmail}
                  required
                  className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.passwordOptional}</Label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={t.leaveBlank}
                  required={false}
                  className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t.role}</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                  required
                >
                  <SelectTrigger className="w-full bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400">
                    <SelectValue placeholder={t.selectRole} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="ADMIN">{t.admin}</SelectItem>
                    <SelectItem value="EMPLOYEE">{t.employee}</SelectItem>
                  </SelectContent>
                </Select>
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
          placeholder={t.searchUsers}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-500"
        />
      </div>

      {/* Users Table */}
      <Card className="rounded-lg border border-gray-100">
        <CardHeader className="py-4 px-6 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-xl font-semibold text-gray-900">{t.users}</CardTitle>
              <span className="text-sm text-gray-500">({filteredUsers.length} {t.total})</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-gray-500 bg-white">{t.loading}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500 bg-white">
              {searchQuery ? t.noUsersFound : t.noUsersAdded}
            </div>
          ) : (
            <div className="relative overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-3">{t.email}</th>
                    <th className="px-6 py-3">{t.role}</th>
                    <th className="px-6 py-3">{t.createdAt}</th>
                    <th className="px-6 py-3">{t.updatedAt}</th>
                    <th className="px-6 py-3">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{new Date(user.updatedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <button
                          className="text-gray-700 hover:text-green-600 hover:bg-green-50 p-2 rounded-md transition-colors"
                          onClick={() => handleEditClick(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-700 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors"
                          onClick={() => {
                            setDeleteId(user.id)
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleDeleteUser}
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
