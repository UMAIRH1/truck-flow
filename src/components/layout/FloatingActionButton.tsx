"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function FloatingActionButton() {
  const { user } = useAuth();

  // Only show for manager role
  if (user?.role !== "manager") return null;

  return (
    <Link
      href="/add-load"
      className="fixed bottom-9 border-2 border-(--color-yellow-light) left-1/2 -translate-x-1/2 z-[999] bg-black text-white rounded-full p-4 shadow-lg hover:bg-gray-800 transition-colors"
    >
      <Plus className="h-6 w-6" />
    </Link>
  );
}
