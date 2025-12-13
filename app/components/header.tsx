"use client"

import { motion } from "framer-motion"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, Map } from "lucide-react"
import { WalletInfo } from "./wallet-info"

export function Header() {
  const { publicKey } = useWallet()
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Game", icon: Home },
    { href: "/create", label: "Create", icon: Plus },
    { href: "/map", label: "Map", icon: Map },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="text-white text-xl">🐊</span>
            </div>
            <h1 className="text-xl font-bold text-foreground hidden sm:block">
              Crocodile Dentist
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-secondary/50 rounded-full p-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Mobile Navigation */}
          <nav className="flex md:hidden items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              )
            })}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center gap-2">
            {publicKey && (
              <div className="hidden md:block">
                <WalletInfo />
              </div>
            )}
            <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !rounded-full !text-sm !font-medium !transition-all !shadow-sm hover:!shadow-md" />
          </div>
        </div>
      </div>
    </motion.header>
  )
}
