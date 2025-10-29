"use client"

// components/header.tsx - Migrated from Vite app
import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false)
  const pathname = usePathname()
  const servicesRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => pathname === path
  const isServiceActive = () => pathname?.startsWith("/services")

  const handleMobileMenuClose = () => {
    setIsMenuOpen(false)
    setIsServicesOpen(false)
    setIsMobileServicesOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="shadow-sm border-b sticky top-0 z-50" style={{ backgroundColor: "#6C44B4" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" onClick={handleMobileMenuClose}>
                <img
                  src="/navlogo.png"
                  alt="VisionBoost"
                  className="h-10 w-auto sm:h-12 hover:opacity-90 transition-opacity"
                />
              </Link>
            </div>
          </div>

          <nav className="hidden lg:flex space-x-8">
            <Link
              href="/"
              className={`px-3 py-2 text-sm font-medium transition-colors text-white hover:text-gray-200 ${
                isActive("/") ? "border-b-2 border-white" : ""
              }`}
            >
              Home
            </Link>

            <div
              ref={servicesRef}
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button
                className={`px-3 py-2 text-sm font-medium transition-colors text-white hover:text-gray-200 flex items-center ${
                  isServiceActive() ? "border-b-2 border-white" : ""
                }`}
              >
                Services
                <ChevronDown
                  className={`w-4 h-4 ml-1 transition-transform duration-200 ${isServicesOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isServicesOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <Link
                    href="/services/instagram"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-3 flex-shrink-0">
                        <img src="/instagram.png" alt="Instagram" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="font-semibold">Instagram Growth</div>
                        <div className="text-xs text-gray-500">Grow your Instagram</div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/services/tiktok"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-3 flex-shrink-0">
                        <img src="/tiktok.png" alt="TikTok" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="font-semibold">TikTok Growth</div>
                        <div className="text-xs text-gray-500">Go viral on TikTok</div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/services/youtube"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-3 flex-shrink-0">
                        <img src="/youtube.png" alt="YouTube" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="font-semibold">YouTube Growth</div>
                        <div className="text-xs text-gray-500">Grow your channel</div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/how-it-works"
              className={`px-3 py-2 text-sm font-medium transition-colors text-white hover:text-gray-200 ${
                isActive("/how-it-works") ? "border-b-2 border-white" : ""
              }`}
            >
              How It Works
            </Link>

            <Link
              href="/contact"
              className={`px-3 py-2 text-sm font-medium transition-colors text-white hover:text-gray-200 ${
                isActive("/contact") ? "border-b-2 border-white" : ""
              }`}
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:block">
              <Link href="/auth">
                <Button size="sm" className="bg-white text-purple-800 hover:bg-gray-100 transition-colors border-white">
                  Get Started
                </Button>
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-gray-200 transition-colors focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-purple-400">
            <Link
              href="/"
              className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive("/") ? "bg-white text-purple-800" : "text-white hover:bg-white hover:text-purple-800"
              }`}
              onClick={handleMobileMenuClose}
            >
              Home
            </Link>

            <div>
              <button
                onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                  isServiceActive() ? "bg-white text-purple-800" : "text-white hover:bg-white hover:text-purple-800"
                }`}
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isMobileServicesOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isMobileServicesOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    href="/services/instagram"
                    className="block px-3 py-2 text-sm text-white hover:bg-white hover:text-purple-800 rounded-md transition-all duration-200"
                    onClick={handleMobileMenuClose}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-2">
                        <img src="/instagram.png" alt="Instagram" className="w-full h-full object-contain" />
                      </div>
                      Instagram Growth
                    </div>
                  </Link>

                  <Link
                    href="/services/tiktok"
                    className="block px-3 py-2 text-sm text-white hover:bg-white hover:text-purple-800 rounded-md transition-all duration-200"
                    onClick={handleMobileMenuClose}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-2">
                        <img src="/tiktok.png" alt="TikTok" className="w-full h-full object-contain" />
                      </div>
                      TikTok Growth
                    </div>
                  </Link>

                  <Link
                    href="/services/youtube"
                    className="block px-3 py-2 text-sm text-white hover:bg-white hover:text-purple-800 rounded-md transition-all duration-200"
                    onClick={handleMobileMenuClose}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-2">
                        <img src="/youtube.png" alt="YouTube" className="w-full h-full object-contain" />
                      </div>
                      YouTube Growth
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/how-it-works"
              className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive("/how-it-works")
                  ? "bg-white text-purple-800"
                  : "text-white hover:bg-white hover:text-purple-800"
              }`}
              onClick={handleMobileMenuClose}
            >
              How It Works
            </Link>

            <Link
              href="/contact"
              className={`block px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive("/contact") ? "bg-white text-purple-800" : "text-white hover:bg-white hover:text-purple-800"
              }`}
              onClick={handleMobileMenuClose}
            >
              Contact
            </Link>

            <div className="pt-2">
              <Link href="/auth" onClick={handleMobileMenuClose}>
                <Button
                  size="sm"
                  className="w-full bg-white text-purple-800 hover:bg-gray-100 transition-colors border-white"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
