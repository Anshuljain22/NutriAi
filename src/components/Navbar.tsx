"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

import NotificationsDropdown from "./NotificationsDropdown";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  const unauthLinks = [
    { name: "Home", href: "/" },
  ];

  const authLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Workout", href: "/workout" },
    { name: "Leaderboard", href: "/leaderboards" },
    { name: "Community", href: "/communities" },
    { name: "Chat", href: "/chat" },
    { name: "Profile", href: `/profile/${user?.id || ''}` },
  ];

  const currentLinks = user ? authLinks : unauthLinks;

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-colors">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">NutriAI</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {currentLinks.map((link) => {

              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${isActive ? "text-white" : "text-gray-400 hover:text-white"
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {link.name}
                </Link>
              );
            })}

            {!loading && (
              <div className="pl-4 ml-2 border-l border-white/10 flex items-center gap-4">
                {user ? (
                  <>
                    <NotificationsDropdown />
                    <button onClick={logout} className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="px-4 py-2 hover:bg-white/5 text-gray-300 text-sm font-medium rounded-lg transition-colors">
                      Log In
                    </Link>
                    <Link href="/signup" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-900 text-sm font-bold rounded-lg transition-colors shadow-lg shadow-emerald-500/20">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2 glass-button rounded-md focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {currentLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeMenu}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
