"use client";

import React, { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { FloatingActionButton } from "./FloatingActionButton";

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  showFAB?: boolean;
}

export function MobileLayout({ children, showBottomNav = true, showFAB = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen pb-20">
      {children}
      {showFAB && <FloatingActionButton />}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
