"use client"

// components/public-layout.tsx - Layout wrapper for public pages
import type React from "react"
import { Header } from "./header"
import { Footer } from "./footer"

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}

export default PublicLayout
