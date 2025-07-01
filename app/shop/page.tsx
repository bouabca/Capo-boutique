"use client"

import { useEffect, useState, useContext } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import Footer from "@/components/footer"

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  title: string;
  imageUrl?: string;
  price: number;
}

const t = (key: string, lang: string) => {
  const translations: any = {
    en: { Shop: 'Shop', Search: 'Search', Categories: 'Categories' },
    fr: { Shop: 'Boutique', Search: 'Recherche', Categories: 'Catégories' },
    ar: { Shop: 'المتجر', Search: 'بحث', Categories: 'الفئات' },
  };
  return translations[lang][key] || key;
};

export default function ShopPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetch("/api/main/categories")
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || []);
        console.log('Fetched categories:', data.categories);
      });
  }, []);

  // Fetch products when search or selectedCategory changes
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (selectedCategory) params.append("category", selectedCategory);
    fetch(`/api/shope?${params.toString()}`)
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, [search, selectedCategory]);

  return (
    <div className="min-h-screen bg-white">
      {/* Shop All header only */}
      <div className="flex items-center justify-center py-6 mb-2">
        <span className="text-2xl font-bold text-gray-800">Shop All</span>
      </div>

      {/* Search Bar */}
      <div className="w-full px-4 md:px-0 flex justify-center mt-10 mb-4 bg-white">
        <div className="w-full max-w-xl flex items-center bg-gray-100 rounded-full px-4 py-2">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search products, brands, colors..."
            className="flex-1 bg-transparent outline-none text-gray-700 font-inter text-base"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="w-full overflow-x-auto py-2 px-2 sticky top-0 z-30 bg-white mb-4">
        <div className="flex space-x-3 min-w-max">
          {categories.length === 0 ? (
            <span className="text-gray-400 px-4">No categories found</span>
          ) : (
            categories.map((cat) => (
              <label
                key={cat.id}
                className={`flex items-center rounded-full px-4 py-2 cursor-pointer whitespace-nowrap transition-colors duration-200 ${selectedCategory === cat.id ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'}`}
              >
                <Checkbox
                  checked={selectedCategory === cat.id}
                  onCheckedChange={() => setSelectedCategory(selectedCategory === cat.id ? "" : cat.id)}
                />
                <span className="ml-2 font-inter text-sm">{cat.name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-700 font-clash">
            All Products
          </h2>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <Link href={`/product/${product.id}`}>
                  {product.imageUrl ? (
                    <div className="aspect-[4/5] bg-gray-200 rounded-2xl overflow-hidden mb-4">
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-4 flex items-center justify-center" style={{background: 'linear-gradient(135deg, #e0ffe0 0%, #ffffff 100%)'}}>
                      <span className="text-green-600 font-bold text-2xl">No Image</span>
                    </div>
                  )}
                  <h3 className="font-semibold text-lg mb-1 font-clash text-gray-700">{product.title}</h3>
                  <p className="text-gray-600 font-medium font-inter">{product.price} DA</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
