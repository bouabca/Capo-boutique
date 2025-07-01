"use client"

import { useEffect, useState, useContext } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, User, ShoppingBag, Minus, Plus, Heart, Star, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LanguageContext } from "@/components/LanguageProvider"

interface Product {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price: number;
  productPriceForQty?: { qty: number; price: number }[];
}

interface Wilaya {
  id: string;
  name: string;
  wilaya_number: number;
  deliveryPrice: number;
}

interface Baladia {
  name: string;
  ar_name?: string;
  wilaya_id: string;
}

const t = (key: string, lang: string) => {
  const translations: any = {
    en: {
      'First Name': 'First Name',
      'Last Name': 'Last Name',
      'Phone': 'Phone',
      'Email (optional)': 'Email (optional)',
      'Select Wilaya': 'Select Wilaya',
      'Select Baladia': 'Select Baladia',
      'House': 'House',
      'Checkout': 'Checkout',
      'Place Order': 'Place Order',
      'Order placed successfully!': 'Order placed successfully!',
      'Order failed': 'Order failed',
      'Bulk Pricing:': 'Bulk Pricing:',
      'Loading...': 'Loading...',
      'Product not found': 'Product not found',
      'for each item': 'for each item',
      'Total': 'Total',
      'Total cost': 'Total cost',
      'Shipping': 'Shipping',
    },
    fr: {
      'First Name': 'Prénom',
      'Last Name': 'Nom',
      'Phone': 'Téléphone',
      'Email (optional)': 'Email (optionnel)',
      'Select Wilaya': 'Sélectionnez la Wilaya',
      'Select Baladia': 'Sélectionnez la Baladia',
      'House': 'Maison',
      'Checkout': 'Commander',
      'Place Order': 'Passer la commande',
      'Order placed successfully!': 'Commande passée avec succès !',
      'Order failed': 'Échec de la commande',
      'Bulk Pricing:': 'Tarifs de gros :',
      'Loading...': 'Chargement...',
      'Product not found': 'Produit non trouvé',
      'for each item': 'par article',
      'Total': 'Total',
      'Total cost': 'Coût total',
      'Shipping': 'Livraison',
    },
    ar: {
      'First Name': 'الاسم الأول',
      'Last Name': 'اللقب',
      'Phone': 'الهاتف',
      'Email (optional)': 'البريد الإلكتروني (اختياري)',
      'Select Wilaya': 'اختر الولاية',
      'Select Baladia': 'اختر البلدية',
      'House': 'منزل',
      'Checkout': 'الدفع',
      'Place Order': 'تأكيد الطلب',
      'Order placed successfully!': 'تم تقديم الطلب بنجاح!',
      'Order failed': 'فشل الطلب',
      'Bulk Pricing:': 'أسعار الجملة:',
      'Loading...': 'جاري التحميل...',
      'Product not found': 'المنتج غير موجود',
      'for each item': 'لكل قطعة',
      'Total': 'المجموع',
      'Total cost': 'التكلفة الإجمالية',
      'Shipping': 'الشحن',
    },
  };
  return translations[lang]?.[key] || key;
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderFields, setOrderFields] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    wilayaId: '',
    baladia: '',
    house: false,
  })
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState("")
  const [orderError, setOrderError] = useState("")
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [baladias, setBaladias] = useState<Baladia[]>([])
  const [filteredBaladias, setFilteredBaladias] = useState<Baladia[]>([])
  const { lang: contextLang } = useContext(LanguageContext);
  const lang = contextLang || 'ar';
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [shipping, setShipping] = useState<number | null>(null);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [couponSuccessMessage, setCouponSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true)
    fetch(`/api/shope/${params.id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .finally(() => setLoading(false))
  }, [params.id])

  // Fetch wilayas
  useEffect(() => {
    fetch('/api/main/wilayas')
      .then(res => res.json())
      .then(data => setWilayas(data.wilayas || []));
  }, []);

  // Fetch all baladias once
  useEffect(() => {
    fetch('/shipping/filtered_output_baladia.json')
      .then(res => res.json())
      .then(data => setBaladias(data));
  }, []);

  // Filter baladias when wilayaId changes
  useEffect(() => {
    const selectedWilaya = wilayas.find(w => w.id === orderFields.wilayaId);
    if (selectedWilaya) {
      setFilteredBaladias(baladias.filter(b => String(b.wilaya_id) === String(selectedWilaya.wilaya_number)));
    } else {
      setFilteredBaladias([]);
    }
  }, [orderFields.wilayaId, wilayas, baladias]);

  // Fetch shipping price when wilaya changes
  useEffect(() => {
    if (orderFields.wilayaId) {
      const wilaya = wilayas.find(w => w.id === orderFields.wilayaId);
      setShipping(wilaya ? wilaya.deliveryPrice : null);
    } else {
      setShipping(null);
    }
    // eslint-disable-next-line
  }, [orderFields.wilayaId, wilayas]);

  // Facebook Pixel: Track ViewContent ("Voir le contenu") when product loads
  useEffect(() => {
    if (product && typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', {
        content_name: product.title,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'DZD',
      });
    }
    // eslint-disable-next-line
  }, [product]);

  function getCurrentPrice() {
    if (!product) return 0
    if (product.productPriceForQty && Array.isArray(product.productPriceForQty)) {
      // Find the best price for the current quantity
      const sorted = [...product.productPriceForQty].sort((a, b) => a.qty - b.qty)
      let price = product.price
      for (let i = 0; i < sorted.length; i++) {
        if (quantity >= sorted[i].qty) {
          price = sorted[i].price
        }
      }
      return price
    }
    return product.price
  }

  const handleOrderFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: string | boolean = value;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      fieldValue = e.target.checked;
    }
    setOrderFields(prev => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setOrderLoading(true)
    setOrderError("")
    setOrderSuccess("")
    setCouponMessage(null)
    setCouponApplied(false)
    setCouponSuccessMessage(null)
    try {
      const res = await fetch("/api/main/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderFields,
          orderItems: [{ productId: product?.id, quantity, price: getCurrentPrice() }],
          couponCode: quantity === 1 ? coupon : undefined
        }),
      })
      const data = await res.json()
      if (data.couponMessage) {
        setCouponMessage(data.couponMessage[lang] || data.couponMessage.en)
      } else {
        setCouponMessage(null)
      }
      if (data.couponApplied && data.couponSuccessMessage) {
        setCouponApplied(true);
        setCouponSuccessMessage(data.couponSuccessMessage[lang] || data.couponSuccessMessage.en);
      } else {
        setCouponApplied(false);
        setCouponSuccessMessage(null);
      }
      if (res.ok) {
        setOrderSuccess("Order placed successfully!")
        setShipping(data.deliveryPrice ?? null)
        setTotalCost(data.totalCost ?? null)
        if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
          // Facebook Pixel: Track Purchase ("Achat")
          window.fbq('track', 'Purchase', {
            value: data.totalCost,
            currency: 'DZD',
            content_ids: [product?.id],
          });
        }
      } else {
        setOrderError(data.error || "Order failed")
        setShipping(null)
        setTotalCost(null)
      }
    } catch (err) {
      setOrderError("Order failed")
    } finally {
      setOrderLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">{t('Loading...', lang)}</div>
  if (!product) return <div className="min-h-screen flex items-center justify-center">{t('Product not found', lang)}</div>

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <Link href="/" className="text-xl font-bold text-black border-2 border-black px-2 py-1 font-clash">
            Planted
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-6 space-y-4">
          <Link
            href="/shop"
            className="block text-gray-800 font-medium font-inter"
            onClick={() => setMobileMenuOpen(false)}
          >
            Shop All
          </Link>
          <Link
            href="/plants"
            className="block text-gray-800 font-medium font-inter"
            onClick={() => setMobileMenuOpen(false)}
          >
            Plants
          </Link>
          <Link
            href="/accessories"
            className="block text-gray-800 font-medium font-inter"
            onClick={() => setMobileMenuOpen(false)}
          >
            Accessories
          </Link>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="flex-1 aspect-square bg-[#C4B5A0] rounded-lg overflow-hidden flex items-center justify-center">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-white">
                  <span className="text-white font-bold text-2xl">No Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-black mb-4 font-clash">{product.title}</h1>
              <p className="text-gray-600 leading-relaxed font-inter mb-4">{product.description}</p>
              {/* Price and Quantity */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-12 w-12 text-black bg-white hover:bg-[#9AE66E] active:bg-[#9AE66E] focus:bg-[#9AE66E] transition-colors"
                    style={{ boxShadow: 'none' }}
                  >
                    <Minus className="h-4 w-4 text-black" />
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center font-inter text-black font-semibold text-lg">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-12 w-12 text-black bg-white hover:bg-[#9AE66E] active:bg-[#9AE66E] focus:bg-[#9AE66E] transition-colors"
                    style={{ boxShadow: 'none' }}
                  >
                    <Plus className="h-4 w-4 text-black" />
                  </Button>
                </div>
                <span className="text-xl font-semibold text-black font-inter">{getCurrentPrice()} DA <span className="text-base font-normal">{t('for each item', lang)}</span></span>
              </div>
              {/* Total price */}
              <div className="mb-2 text-lg font-bold text-green-700 font-inter">{t('Total', lang)}: {getCurrentPrice() * quantity} DA</div>
              {/* Show price tiers if available */}
              {product.productPriceForQty && Array.isArray(product.productPriceForQty) && product.productPriceForQty.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Bulk Pricing:</h3>
                  <ul className="list-disc pl-6">
                    {product.productPriceForQty.map((tier, idx) => (
                      <li key={idx} className="text-gray-700">{tier.qty}+ : {tier.price} DA</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Checkout Button */}
            {!showCheckout && (
              <Button
                className={`h-12 rounded-full font-inter w-full border-2 transition font-semibold ${quantity > 1 ? 'bg-white text-black border-black hover:bg-gray-50' : 'bg-[#9AE66E] hover:bg-[#8BD65A] text-black border-[#9AE66E]'}`}
                style={quantity > 1 ? { background: 'white', color: 'black', borderColor: 'black' } : {}}
                onClick={() => {
                  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
                    // Facebook Pixel: Track InitiateCheckout ("Démarrer le paiement")
                    window.fbq('track', 'InitiateCheckout', {
                      value: getCurrentPrice() * quantity,
                      currency: 'DZD',
                      content_ids: [product?.id],
                    });
                  }
                  setShowCheckout(true);
                }}
              >
                {t('Checkout', lang)}
              </Button>
            )}
            {/* Checkout Form */}
            {showCheckout && (
              <form className="space-y-5 bg-white p-6 rounded-2xl shadow-lg border max-w-lg mx-auto" onSubmit={handleCheckout}>
                <input name="firstName" required placeholder={t('First Name', lang)} className="w-full border border-gray-300 p-3 rounded-lg bg-white text-black font-inter text-base focus:outline-none focus:ring-2 focus:ring-[#9AE66E] transition" value={orderFields.firstName} onChange={handleOrderFieldChange} />
                <input name="lastName" required placeholder={t('Last Name', lang)} className="w-full border border-gray-300 p-3 rounded-lg bg-white text-black font-inter text-base focus:outline-none focus:ring-2 focus:ring-[#9AE66E] transition" value={orderFields.lastName} onChange={handleOrderFieldChange} />
                <input name="phone" required placeholder={t('Phone', lang)} className="w-full border border-gray-300 p-3 rounded-lg bg-white text-black font-inter text-base focus:outline-none focus:ring-2 focus:ring-[#9AE66E] transition" value={orderFields.phone} onChange={handleOrderFieldChange} />
                <input name="email" type="email" placeholder={t('Email (optional)', lang)} className="w-full border border-gray-300 p-3 rounded-lg bg-white text-black font-inter text-base focus:outline-none focus:ring-2 focus:ring-[#9AE66E] transition" value={orderFields.email} onChange={handleOrderFieldChange} />
                <Select value={orderFields.wilayaId} onValueChange={val => setOrderFields(f => ({ ...f, wilayaId: val, baladia: '' }))}>
                  <SelectTrigger className="w-full border border-gray-300 p-3 rounded-lg bg-white text-black font-inter text-base focus:outline-none focus:ring-2 focus:ring-[#9AE66E] transition">
                    <SelectValue placeholder={t('Select Wilaya', lang)} />
                  </SelectTrigger>
                  <SelectContent>
                    {wilayas.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Show shipping cost immediately after wilaya selection */}
                {orderFields.wilayaId && shipping !== null && (
                  <div className="text-green-700 font-inter text-base mt-1 mb-2">{t('Shipping', lang)}: {shipping} DA</div>
                )}
                <Select value={orderFields.baladia} onValueChange={val => setOrderFields(f => ({ ...f, baladia: val }))} disabled={!orderFields.wilayaId}>
                  <SelectTrigger className="w-full border border-gray-300 p-3 rounded-lg bg-white text-black font-inter text-base focus:outline-none focus:ring-2 focus:ring-[#9AE66E] transition" disabled={!orderFields.wilayaId}>
                    <SelectValue placeholder={t('Select Baladia', lang)} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBaladias.map(b => (
                      <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <label className="flex items-center space-x-3 mt-2">
                  <input type="checkbox" name="house" checked={orderFields.house} onChange={handleOrderFieldChange} className="h-5 w-5 accent-[#9AE66E] border-gray-400 rounded focus:ring-2 focus:ring-[#9AE66E]" />
                  <span className="text-gray-700 font-inter text-base">{t('House', lang)}</span>
                </label>
                {/* Coupon input, only if quantity is 1 */}
                <div className="space-y-2">
                  <label className="block text-gray-700 font-inter text-base">Coupon</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 p-3 rounded-lg bg-white text-black font-inter text-base focus:outline-none focus:ring-2 focus:ring-[#9AE66E] transition"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    placeholder={lang === 'fr' ? 'Entrez le code du coupon' : lang === 'ar' ? 'أدخل رمز القسيمة' : 'Enter coupon code'}
                    disabled={quantity !== 1}
                  />
                  {quantity !== 1 && (
                    <div className="text-red-600 text-sm mt-1">
                      {lang === 'fr' ? 'Le coupon ne peut être utilisé que pour une seule quantité.' : lang === 'ar' ? 'يمكن استخدام القسيمة لكمية واحدة فقط.' : 'Coupon can only be used for a single quantity.'}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="h-12 rounded-full font-inter w-full border-2 transition font-semibold bg-green-600 hover:bg-green-700 text-white border-green-600"
                  disabled={orderLoading}
                >
                  {orderLoading ? (lang === 'fr' ? 'Traitement...' : lang === 'ar' ? 'جاري المعالجة...' : 'Placing Order...') : t('Place Order', lang)}
                </Button>
                {/* Show coupon/order messages at the bottom, persistent */}
                {(couponMessage || couponApplied || orderError || orderSuccess) && (
                  <div className={`mt-4 text-center font-inter text-base ${orderError ? 'text-red-600' : orderSuccess ? 'text-green-600' : couponApplied ? 'text-green-600' : (couponMessage && !couponApplied) ? 'text-red-600' : 'text-yellow-700'}`}>
                    {orderError ? (
                      lang === 'fr' ? 'Échec de la commande' : lang === 'ar' ? 'فشل الطلب' : orderError
                    ) : (
                      <>
                        {/* Show coupon error/info if not applied (always show above success) */}
                        {couponMessage && !couponApplied && (
                          <div className="mb-2">{couponMessage}</div>
                        )}
                        {/* Show coupon success message if applied */}
                        {couponApplied && couponSuccessMessage && (
                          <div className="mb-2">{couponSuccessMessage}</div>
                        )}
                        {/* Show order success message if order placed */}
                        {orderSuccess && (
                          <>
                            {lang === 'fr' ? 'Commande passée avec succès !' : lang === 'ar' ? 'تم تقديم الطلب بنجاح!' : orderSuccess}
                            {totalCost !== null && (
                              <div className="mt-2">
                                {t('Total cost', lang)}: {totalCost} DA
                                {shipping !== null && shipping > 0 && (
                                  <span className="block">{t('Shipping', lang)}: {shipping} DA</span>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
