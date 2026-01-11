"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, DollarSign, History, Settings, Wallet, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const managerNavItems: NavItem[] = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { href: "/revenue", label: "Revenue", icon: <DollarSign className="h-5 w-5" /> },
    { href: "/load-history", label: "Load History", icon: <History className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const driverNavItems: NavItem[] = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { href: "/wallet", label: "My Wallet", icon: <Wallet className="h-5 w-5" /> },
    { href: "/my-loads", label: "My Loads", icon: <Truck className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const navItems = user?.role === "driver" ? driverNavItems : managerNavItems;

  return (
    <nav className="fixed bottom-0 rounded-t-3xl left-0 right-0 z-50 bg-(--color-yellow-light)  px-2 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors", isActive ? "text-black" : "text-gray-400")}>
              <span className="text-black">{item.icon}</span>
              <span className="text-xs mt-1 font-medium text-black">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
