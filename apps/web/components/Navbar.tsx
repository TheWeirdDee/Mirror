"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Menu, X } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/docs", label: "Docs" },
    { href: "/explainer", label: "Explainer" },
    { href: "/dashboard", label: "Dashboard" }
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 px-5 md:px-12 border-b flex items-center justify-between z-50 bg-[var(--bg-surface)]/80 border-[var(--border-default)] backdrop-blur-md transition-colors">
        <div className="flex items-center gap-8 h-full">
          <Link href="/" className="flex items-center gap-3 font-mono uppercase tracking-[0.28em] text-[var(--text-primary)] hover:text-[var(--text-accent)] transition-all">
            <Image
              src={theme === "dark" ? "/mirror-mark-dark.png" : "/mirror-mark-light.png"}
              alt="Mirror logo"
              width={28}
              height={28}
              className="h-7 w-auto object-contain"
              priority
            />
            Mirror
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex gap-6 h-full items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative py-2 font-mono text-xs uppercase tracking-wider transition-all flex items-center"
                >
                  <span
                    className={`relative px-1 pb-1 transition-all ${
                      isActive
                        ? "text-[var(--text-primary)] font-semibold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--accent-match)]" />
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md hover:bg-[var(--bg-overlay)] transition-colors text-[var(--text-primary)]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Connect Wallet — hidden on mobile to save space */}
          <div className="hidden sm:block">
            <ConnectButton />
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md hover:bg-[var(--bg-overlay)] transition-colors text-[var(--text-primary)]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-16" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-16 left-0 right-0 bg-[var(--bg-surface)] border-b border-[var(--border-default)] shadow-lg flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-5 py-4 font-mono text-xs uppercase tracking-wider border-b border-[var(--border-subtle)] transition-colors ${
                    isActive
                      ? "text-[var(--text-primary)] border-l-2 border-l-[var(--accent-match)] bg-[var(--accent-match-bg)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {/* Connect wallet in mobile menu */}
            <div className="px-6 py-4 sm:hidden">
              <ConnectButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
