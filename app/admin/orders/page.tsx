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
import { Search, Plus, Edit, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LanguageContext } from "../layout"

interface OrderType {
  id: string
  firstName: string
  lastName: string
  address: string
  phone: string
  email?: string
  status: string
  total: number
  createdAt: string
  orderItems: {
    product: {
      title: string
      imageUrl: string
    }
    quantity: number
    price: number
  }[]
  wilaya?: {
    name: string
    deliveryPrice: number
  }
  baladia?: string
  house?: boolean
}

interface ProductType {
  id: string
  title: string
  price: number
  imageUrl: string
}

interface WilayaType {
  id: string
  name: string
  wilaya_number?: number | string
}

export default function OrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<OrderType[]>([])
  const [products, setProducts] = useState<ProductType[]>([])
  const [wilayas, setWilayas] = useState<WilayaType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateOrder, setShowCreateOrder] = useState(false)
  const [newOrder, setNewOrder] = useState({
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    wilayaId: "",
    baladia: "",
    house: false,
    orderItems: [{ productId: "", quantity: 1 }]
  })
  const [baladias, setBaladias] = useState<{ name: string; ar_name: string; wilaya_id: string }[]>([])
  const [baladiaData, setBaladiaData] = useState<any[]>([])
  const [viewOrder, setViewOrder] = useState<OrderType | null>(null)
  const { lang } = useContext(LanguageContext)
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const translations = {
    en: {
      orders: "Orders",
      manageOrders: "Manage customer orders",
      createOrder: "Create Order",
      createNewOrder: "Create New Order",
      firstName: "First Name",
      enterFirstName: "Enter first name",
      lastName: "Last Name",
      enterLastName: "Enter last name",
      address: "Address",
      enterAddress: "Enter address",
      phone: "Phone",
      enterPhone: "Enter phone number",
      email: "Email",
      enterEmail: "Enter email",
      wilaya: "Wilaya",
      selectWilaya: "Select wilaya",
      baladia: "Baladia",
      selectBaladia: "Select a baladia",
      houseDelivery: "House Delivery",
      deliverToHouse: "Deliver to house (checked) or agency office (unchecked)",
      products: "Products",
      selectProduct: "Select product",
      qty: "Qty",
      addProduct: "Add Product",
      cancel: "Cancel",
      creating: "Creating...",
      create: "Create Order",
      searchOrders: "Search orders...",
      allOrders: "All Orders",
      orderId: "Order ID",
      customer: "Customer",
      total: "Total",
      status: "Status",
      date: "Date",
      actions: "Actions",
      pending: "Pending",
      confirmed: "Confirmed",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      orderDetails: "Order Details",
      phoneCol: "Phone",
      addressCol: "Address",
      wilayaCol: "Wilaya",
      baladiaCol: "Baladia",
      delivery: "Delivery",
      house: "House",
      agencyOffice: "Agency Office",
      statusCol: "Status",
      totalCol: "Total",
      productsCol: "Products:",
      title: "Title",
      price: "Price (DA)",
      previous: "Previous",
      next: "Next",
      page: "Page",
      of: "of",
      delete: "Delete",
      areYouSure: "Are you sure you want to delete this order?",
      nA: "N/A",
    },
    ar: {
      orders: "الطلبات",
      manageOrders: "إدارة طلبات العملاء",
      createOrder: "إنشاء طلب",
      createNewOrder: "إنشاء طلب جديد",
      firstName: "الاسم الأول",
      enterFirstName: "أدخل الاسم الأول",
      lastName: "اسم العائلة",
      enterLastName: "أدخل اسم العائلة",
      address: "العنوان",
      enterAddress: "أدخل العنوان",
      phone: "الهاتف",
      enterPhone: "أدخل رقم الهاتف",
      email: "البريد الإلكتروني",
      enterEmail: "أدخل البريد الإلكتروني",
      wilaya: "الولاية",
      selectWilaya: "اختر الولاية",
      baladia: "البلدية",
      selectBaladia: "اختر البلدية",
      houseDelivery: "توصيل للمنزل",
      deliverToHouse: "توصيل للمنزل (محدد) أو لمكتب الوكالة (غير محدد)",
      products: "المنتجات",
      selectProduct: "اختر المنتج",
      qty: "الكمية",
      addProduct: "إضافة منتج",
      cancel: "إلغاء",
      creating: "جاري الإنشاء...",
      create: "إنشاء الطلب",
      searchOrders: "ابحث عن الطلبات...",
      allOrders: "كل الطلبات",
      orderId: "رقم الطلب",
      customer: "العميل",
      total: "الإجمالي",
      status: "الحالة",
      date: "التاريخ",
      actions: "الإجراءات",
      pending: "قيد الانتظار",
      confirmed: "تم التأكيد",
      shipped: "تم الشحن",
      delivered: "تم التسليم",
      cancelled: "ملغي",
      orderDetails: "تفاصيل الطلب",
      phoneCol: "الهاتف",
      addressCol: "العنوان",
      wilayaCol: "الولاية",
      baladiaCol: "البلدية",
      delivery: "التوصيل",
      house: "منزل",
      agencyOffice: "مكتب الوكالة",
      statusCol: "الحالة",
      totalCol: "الإجمالي",
      productsCol: "المنتجات:",
      title: "العنوان",
      price: "السعر (دج)",
      previous: "السابق",
      next: "التالي",
      page: "صفحة",
      of: "من",
      delete: "حذف",
      areYouSure: "هل أنت متأكد أنك تريد حذف هذا الطلب؟",
      nA: "غير متوفر",
    },
    fr: {
      orders: "Commandes",
      manageOrders: "Gérer les commandes clients",
      createOrder: "Créer une commande",
      createNewOrder: "Créer une nouvelle commande",
      firstName: "Prénom",
      enterFirstName: "Entrez le prénom",
      lastName: "Nom",
      enterLastName: "Entrez le nom",
      address: "Adresse",
      enterAddress: "Entrez l'adresse",
      phone: "Téléphone",
      enterPhone: "Entrez le numéro de téléphone",
      email: "Email",
      enterEmail: "Entrez l'email",
      wilaya: "Wilaya",
      selectWilaya: "Sélectionnez la wilaya",
      baladia: "Baladia",
      selectBaladia: "Sélectionnez la baladia",
      houseDelivery: "Livraison à domicile",
      deliverToHouse: "Livrer à domicile (coché) ou à l'agence (non coché)",
      products: "Produits",
      selectProduct: "Sélectionnez le produit",
      qty: "Qté",
      addProduct: "Ajouter un produit",
      cancel: "Annuler",
      creating: "Création...",
      create: "Créer la commande",
      searchOrders: "Rechercher des commandes...",
      allOrders: "Toutes les commandes",
      orderId: "ID commande",
      customer: "Client",
      total: "Total",
      status: "Statut",
      date: "Date",
      actions: "Actions",
      pending: "En attente",
      confirmed: "Confirmée",
      shipped: "Expédiée",
      delivered: "Livrée",
      cancelled: "Annulée",
      orderDetails: "Détails de la commande",
      phoneCol: "Téléphone",
      addressCol: "Adresse",
      wilayaCol: "Wilaya",
      baladiaCol: "Baladia",
      delivery: "Livraison",
      house: "Maison",
      agencyOffice: "Agence",
      statusCol: "Statut",
      totalCol: "Total",
      productsCol: "Produits :",
      title: "Titre",
      price: "Prix (DA)",
      previous: "Précédent",
      next: "Suivant",
      page: "Page",
      of: "de",
      delete: "Supprimer",
      areYouSure: "Êtes-vous sûr de vouloir supprimer cette commande ?",
      nA: "N/A",
    },
  } as const;
  type Lang = keyof typeof translations;
  const t = translations[lang as Lang] || translations.en;

  useEffect(() => {
    fetchOrders()
  }, [page, searchTerm])

  useEffect(() => {
    fetchWilayas()
  }, [])

  useEffect(() => {
    fetch('/shipping/filtered_output_baladia.json')
      .then(res => res.json())
      .then(setBaladiaData)
      .catch(() => setBaladiaData([]));
  }, []);

  useEffect(() => {
    if (newOrder.wilayaId) {
      const selectedWilaya = wilayas.find(w => w.id === newOrder.wilayaId)
      if (selectedWilaya) {
        const wilayaNumber = selectedWilaya.wilaya_number?.toString()
        setBaladias(baladiaData.filter(b => b.wilaya_id === wilayaNumber))
      } else {
        setBaladias([])
      }
    } else {
      setBaladias([])
    }
  }, [newOrder.wilayaId, wilayas, baladiaData])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/main/orders?page=${page}&limit=10&search=${searchTerm}`)
      const data = await response.json()
      if (response.ok) {
        setOrders(data.orders)
        setProducts(data.products || [])
        setTotalPages(data.pagination.totalPages)
      } else {
        throw new Error(data.error || "Failed to load orders")
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

  const fetchWilayas = async () => {
    try {
      const response = await fetch('/api/main/wilayas')
      const data: { wilayas: any[]; error?: string } = await response.json()
      if (response.ok) {
        setWilayas((data.wilayas || []).map((w: any) => ({
          ...w,
          wilaya_number: w.wilaya_number
        })))
      } else {
        throw new Error(data.error || "Failed to load wilayas")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load wilayas for order creation"
      })
    }
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("handleCreateOrder called!");
    setIsLoading(true)

    try {
      const response = await fetch('/api/main/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order")
      }

      toast({
        variant: "success",
        title: "Success!",
        description: data.message || "Order created successfully"
      })
      setNewOrder({
        firstName: "",
        lastName: "",
        address: "",
        phone: "",
        email: "",
        wilayaId: "",
        baladia: "",
        house: false,
        orderItems: [{ productId: "", quantity: 1 }]
      })
      setShowCreateOrder(false)
      fetchOrders()
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

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/main/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order")
      }

      toast({
        variant: "success",
        title: "Success!",
        description: data.message || "Order updated successfully"
      })
      fetchOrders()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    }
  }

  const handleDeleteOrder = (orderId: string) => {
    setDeleteOrderId(orderId)
  }

  const confirmDeleteOrder = async () => {
    if (!deleteOrderId) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/main/orders/${deleteOrderId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      setDeleteOrderId(null)
      fetchOrders()
    } catch (error) {
      // handle error
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.orders}</h1>
          <p className="mt-2 text-gray-500">{t.manageOrders}</p>
        </div>
        <Dialog open={showCreateOrder} onOpenChange={setShowCreateOrder}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              {t.createOrder}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium text-gray-900">{t.createNewOrder}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrder} className="grid gap-4 py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-black">{t.firstName}</Label>
                    <Input
                      id="firstName"
                      value={newOrder.firstName}
                      onChange={(e) => setNewOrder({ ...newOrder, firstName: e.target.value })}
                      className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                      placeholder={t.enterFirstName}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-black">{t.lastName}</Label>
                    <Input
                      id="lastName"
                      value={newOrder.lastName}
                      onChange={(e) => setNewOrder({ ...newOrder, lastName: e.target.value })}
                      className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                      placeholder={t.enterLastName}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-black">{t.phone}</Label>
                  <Input
                    id="phone"
                    value={newOrder.phone}
                    onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })}
                    className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                    placeholder={t.enterPhone}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newOrder.email}
                    onChange={(e) => setNewOrder({ ...newOrder, email: e.target.value })}
                    className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
                    placeholder={t.enterEmail}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wilaya" className="text-black">{t.wilaya}</Label>
                  <Select
                    value={newOrder.wilayaId}
                    onValueChange={(value) => setNewOrder({ ...newOrder, wilayaId: value })}
                  >
                    <SelectTrigger className="bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900">
                      <SelectValue placeholder={t.selectWilaya} />
                    </SelectTrigger>
                    <SelectContent>
                      {wilayas.map((wilaya) => (
                        <SelectItem key={wilaya.id} value={wilaya.id}>
                          {wilaya.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 text-black">{t.baladia}</Label>
                  <Select
                    value={newOrder.baladia}
                    onValueChange={value => setNewOrder(o => ({ ...o, baladia: value }))}
                    required
                  >
                    <SelectTrigger className="w-full bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400">
                      <SelectValue placeholder={t.selectBaladia} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {baladias.map(b => (
                        <SelectItem key={b.name} value={b.name} className="text-black">{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium text-gray-700 text-black">{t.houseDelivery}</Label>
                  <input
                    type="checkbox"
                    checked={newOrder.house}
                    onChange={e => setNewOrder(o => ({ ...o, house: e.target.checked }))}
                    className="h-4 w-4 border-gray-300 rounded"
                  />
                  <span className="text-gray-600 text-sm">{t.deliverToHouse}</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-black">{t.products}</Label>
                  <div className="space-y-2">
                    {newOrder.orderItems.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Select
                          value={item.productId}
                          onValueChange={(value) => {
                            const updatedItems = [...newOrder.orderItems]
                            updatedItems[index] = {
                              ...item,
                              productId: value,
                            }
                            setNewOrder({ ...newOrder, orderItems: updatedItems })
                          }}
                        >
                          <SelectTrigger className="flex-1 bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900">
                            <SelectValue placeholder={t.selectProduct} />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const updatedItems = [...newOrder.orderItems]
                            updatedItems[index] = {
                              ...item,
                              quantity: parseInt(e.target.value) || 1,
                            }
                            setNewOrder({ ...newOrder, orderItems: updatedItems })
                          }}
                          className="w-24 bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-gray-200 text-gray-900"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const updatedItems = newOrder.orderItems.filter((_, i) => i !== index)
                            setNewOrder({ ...newOrder, orderItems: updatedItems })
                          }}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setNewOrder({
                          ...newOrder,
                          orderItems: [
                            ...newOrder.orderItems,
                            { productId: "", quantity: 1 },
                          ],
                        })
                      }}
                      className="w-full"
                    >
                      {t.addProduct}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateOrder(false)}>
                  {t.cancel}
                </Button>
                <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white" disabled={isLoading}>
                  {isLoading ? t.creating : t.create}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder={t.searchOrders}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 bg-gray-50 border-none hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-gray-200 transition-colors text-gray-900"
        />
      </div>

      {/* Orders Table */}
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">{t.allOrders} ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">{t.orderId}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">{t.customer}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">{t.products}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">{t.total}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">{t.status}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">{t.date}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="bg-white group cursor-pointer" onClick={() => setViewOrder(order)}>
                    <td className="py-3 px-4 font-medium text-gray-900">#{order.id.slice(-4)}</td>
                    <td className="py-3 px-4 text-gray-600">{order.firstName} {order.lastName}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {order.orderItems.map(item => `${item.product.title} (${item.quantity})`).join(", ")}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{order.total.toLocaleString()} DA</td>
                    <td className="py-3 px-4">
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleUpdateStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">{t.pending}</SelectItem>
                          <SelectItem value="CONFIRMED">{t.confirmed}</SelectItem>
                          <SelectItem value="SHIPPED">{t.shipped}</SelectItem>
                          <SelectItem value="DELIVERED">{t.delivered}</SelectItem>
                          <SelectItem value="CANCELLED">{t.cancelled}</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrder(order.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t.previous}
            </Button>
            <span className="py-2 px-4 text-gray-600">
              {t.page} {page} {t.of} {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              {t.next}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order View Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.orderDetails}</DialogTitle>
          </DialogHeader>
          <button
            aria-label="Close"
            onClick={() => setViewOrder(null)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
          {viewOrder && (
            <div className="space-y-2">
              <div className="font-bold text-lg text-black">{viewOrder.firstName} {viewOrder.lastName}</div>
              <div className="text-black">{t.phoneCol}: {viewOrder.phone}</div>
              <div className="text-black">{t.delivery}: {viewOrder.house ? t.house : t.agencyOffice}</div>
              <div className="text-black">{t.statusCol}: {viewOrder.status}</div>
              <div className="text-black">{t.totalCol}: {viewOrder.total} DA</div>
              <div className="font-semibold text-black mt-2">{t.productsCol}</div>
              <table className="w-full text-sm mt-2 border border-gray-200 rounded">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-black px-3 py-1 text-left font-bold">{t.title}</th>
                    <th className="text-black px-3 py-1 text-left font-bold">{t.qty}</th>
                    <th className="text-black px-3 py-1 text-left font-bold">{t.price}</th>
                  </tr>
                </thead>
                <tbody>
                  {viewOrder.orderItems.map((item, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="text-black px-3 py-1">{item.product.title}</td>
                      <td className="text-black px-3 py-1">{item.quantity}</td>
                      <td className="text-black px-3 py-1">{item.price} DA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteOrderId} onOpenChange={open => { if (!open) setDeleteOrderId(null) }}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">Are you sure you want to delete this order?</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" className="bg-gray-900 text-white" onClick={() => setDeleteOrderId(null)}>Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmDeleteOrder} disabled={isDeleting}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
