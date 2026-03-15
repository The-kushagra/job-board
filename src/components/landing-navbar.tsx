"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SignInButton, SignOutButton } from "@clerk/nextjs"
import { BriefcaseBusiness, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface LandingNavbarProps {
  userId: string | null
}

export function LandingNavbar({ userId }: LandingNavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Stats", href: "#stats" },
  ]

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link className="flex items-center gap-2 group" href="/">
          <div className="size-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
            <BriefcaseBusiness className="size-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white group-hover:text-purple-400 transition-colors">
            NextHire
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              className="text-sm font-semibold text-slate-400 hover:text-white transition-colors" 
              href={link.href}
            >
              {link.name}
            </Link>
          ))}
          {userId ? (
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm" className="hidden sm:flex border-white/10 hover:bg-white/5">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <SignOutButton>
                <Button variant="ghost" size="sm" className="hover:bg-white/5 hover:text-white">Sign Out</Button>
              </SignOutButton>
            </div>
          ) : (
            <SignInButton mode="modal">
              <Button size="sm" className="font-bold">Sign In</Button>
            </SignInButton>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden flex items-center justify-center size-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div className={cn(
        "absolute top-20 left-0 w-full bg-[#1E293B] border-b border-[#334155] md:hidden transition-all duration-300 ease-in-out overflow-hidden shadow-2xl",
        isOpen ? "max-h-[400px] py-6" : "max-h-0 py-0 border-none"
      )}>
        <div className="container mx-auto px-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              className="text-lg font-bold text-slate-300 hover:text-white transition-colors py-2" 
              href={link.href}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-white/5 my-2" />
          {userId ? (
            <div className="flex flex-col gap-4">
              <Button asChild className="w-full justify-start font-black text-lg h-14" variant="outline">
                <Link href="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
              </Button>
              <SignOutButton>
                <Button variant="ghost" className="w-full justify-start text-lg h-14 font-bold text-slate-300 hover:bg-white/5" onClick={() => setIsOpen(false)}>
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <SignInButton mode="modal">
                <Button className="w-full font-black text-lg h-14" onClick={() => setIsOpen(false)}>
                  Sign In
                </Button>
              </SignInButton>
              <Link href="/sign-up" className="w-full" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full font-black text-lg h-14 border-white/10 text-slate-300 hover:bg-white/5">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
