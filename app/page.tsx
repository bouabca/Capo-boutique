"use client"
import Image from "next/image"
import { useEffect, useState, useContext } from "react"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"
import Link from "next/link"
import { LanguageContext } from "@/components/LanguageProvider"

interface Product {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
}

const t = (key: string, lang: string) => {
  const translations: any = {
    en: { 'Featured collection': 'Featured collection', 'Fresh finds for every occasion': 'Fresh finds for every occasion', 'Explore our latest arrivals, curated to bring you style, functionality, and inspiration. Shop now and discover your next favorite.': 'Explore our latest arrivals, curated to bring you style, functionality, and inspiration. Shop now and discover your next favorite.', 'Explore our top picks in this featured collection. Find the perfect gift or treat yourself!': 'Explore our top picks in this featured collection. Find the perfect gift or treat yourself!' },
    fr: { 'Featured collection': 'Collection en vedette', 'Fresh finds for every occasion': 'Nouveautés pour chaque occasion', 'Explore our latest arrivals, curated to bring you style, functionality, and inspiration. Shop now and discover your next favorite.': 'Découvrez nos dernières nouveautés, sélectionnées pour vous offrir style, fonctionnalité et inspiration. Achetez maintenant et découvrez votre prochain favori.', 'Explore our top picks in this featured collection. Find the perfect gift or treat yourself!': 'Découvrez nos meilleurs choix dans cette collection en vedette. Trouvez le cadeau parfait ou faites-vous plaisir !' },
    ar: { 'Featured collection': 'مجموعة مختارة', 'Fresh finds for every occasion': 'اكتشف الجديد لكل مناسبة', 'Explore our latest arrivals, curated to bring you style, functionality, and inspiration. Shop now and discover your next favorite.': 'استكشف أحدث منتجاتنا المختارة لتمنحك الأناقة والوظيفة والإلهام. تسوق الآن واكتشف المفضل القادم لديك.', 'Explore our top picks in this featured collection. Find the perfect gift or treat yourself!': 'تصفح أفضل اختياراتنا في هذه المجموعة المميزة. ابحث عن الهدية المثالية أو دلل نفسك!' },
  };
  return translations[lang][key] || key;
};

export default function HomePage() {
  const { lang: contextLang } = useContext(LanguageContext);
  const lang = contextLang || 'ar';
  const [products, setProducts] = useState<Product[]>([]);
  const [cmsHero, setCmsHero] = useState<any>(null);
  useEffect(() => {
    fetch('/api/shope?page=1')
      .then(res => res.json())
      .then(data => setProducts(data.products ? data.products.slice(0, 3) : []));
    fetch('/api/main/cms')
      .then(res => res.json())
      .then(data => setCmsHero(data.cms || null));
  }, []);

  // Fallbacks
  const heroBg = cmsHero?.heroImage || "/plant-hero.jpg";
  const heroTitle = cmsHero?.heroTitle || t('Fresh finds for every occasion', lang);
  const heroTitleColor = cmsHero?.heroTitleColor || "#fff";
  const heroDesc = cmsHero?.heroDescription || t('Explore our latest arrivals, curated to bring you style, functionality, and inspiration. Shop now and discover your next favorite.', lang);
  const heroDescColor = cmsHero?.heroDescriptionColor || "#fff";

  return (
    <div className="min-h-screen bg-white overflow-x-hidden w-full">
      {/* Hero Section - no header or language switcher */}
      <section className="relative h-[340px] md:h-[500px] bg-[#D4C4B0] overflow-hidden w-full max-w-full">
        <Image src={heroBg} alt={heroTitle} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute left-8 top-1/2 -translate-y-1/2 max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 font-clash" style={{ color: heroTitleColor }}>
            {heroTitle}
          </h1>
          <p className="text-lg mb-8 opacity-90 font-inter" style={{ color: heroDescColor }}>
            {heroDesc}
          </p>
          <Link href="/shop">
            <Button className="bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-full text-lg font-medium font-inter">
              {t('Shop Now', lang)}
            </Button>
          </Link>
        </div>
        {/* Slide indicators */}
        <div className="absolute bottom-8 left-8 flex space-x-2">
          <div className="w-12 h-1 bg-white"></div>
          <div className="w-12 h-1 bg-white/40"></div>
          <div className="w-12 h-1 bg-white/40"></div>
        </div>
      </section>
      {/* Featured Collection */}
      <section className="py-12 md:py-16 px-2 md:px-6 bg-white w-full max-w-full">
        <div className="max-w-7xl mx-auto w-full max-w-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 items-center w-full max-w-full">
            <div className="lg:col-span-2">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 font-clash">{t('Featured collection', lang)}</h2>
              <p className="text-gray-600 text-lg mb-8 font-inter">
                {t('Explore our top picks in this featured collection. Find the perfect gift or treat yourself!', lang)}
              </p>
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 w-full max-w-full">
              {products.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <Link href={`/product/${product.id}`} className="block h-full w-full">
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-white">
                          <span className="text-white font-bold text-2xl">No Image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1 font-clash">{product.title}</h3>
                    <p className="text-gray-600 font-medium font-inter">{product.price.toFixed(2)} DA</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <Footer />
    </div>
  )
}
