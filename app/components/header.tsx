"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Github } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Game" },
    { href: "/create", label: "Create" },
    { href: "/map", label: "Map" },
  ]

  return (
    <header className="bg-transparent fixed top-0 z-50 w-full">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐊</span>
            <h1 className="text-xl font-bold hidden sm:block">
              Crocodile Dentist
            </h1>
          </Link>

          {/* Desktop Navigation */}

          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "default" : "ghost"}
                asChild
                className="bg-transparent hover:bg-primary/10 text-primary"
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>

          {/* Mobile Navigation + Wallet */}
          <div className="flex items-center gap-2">
            {/* GitHub Link */}
            <a
              href="https://github.com/yourusername/yourrepo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="hover:bg-white/10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-lg font-medium ${
                        pathname === item.href
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Wallet Button */}
            {/* <WalletMultiButton /> */}
          </div>
        </div>
      </div>
    </header>
  )
}
