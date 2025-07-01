import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Image src="/logo/capoboutique.jpeg" alt="Logo" width={64} height={64} />
          <div className="text-lg font-inter text-white">+213 770 16 76 78</div>
          <div className="text-lg font-inter text-white">capoboutique@gmail.com</div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm font-inter">© 2024 Capo boutique. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors font-inter">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors font-inter">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
