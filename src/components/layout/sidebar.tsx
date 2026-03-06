"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Factory,
  Users,
  Truck,
  Percent,
  Calculator,
  BarChart3,
  UserCog,
  ChevronDown,
  ChevronRight,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth";
import { hasPermission, navigationItems, type NavItem } from "@/lib/permissions";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Factory,
  Users,
  Truck,
  Percent,
  Calculator,
  BarChart3,
  UserCog,
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // const filteredNav = navigationItems.filter((item) =>
  //   hasPermission(user?.role, item.module, "view")
  // );

  const filteredNav = navigationItems
  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 border-r border-slate-800/50 transition-transform lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/30 px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-400 group-hover:to-blue-500 transition-all shadow-lg shadow-blue-500/20">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">Factory</span>
              <span className="text-xs text-blue-400 font-semibold">ERP</span>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-300 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {filteredNav.length > 0 ? (
            filteredNav.map((item) => (
              <SidebarItem
                key={item.label}
                item={item}
                isActive={isActive}
                expanded={expandedItems.has(item.label)}
                onToggle={() => toggleExpand(item.label)}
                onClose={onClose}
              />
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No modules available
            </div>
          )}
        </nav>

        {/* User info footer */}
        <div className="border-t border-slate-800/30 p-4 space-y-3">
          <div className="rounded-lg bg-slate-800/40 px-3 py-3 border border-slate-700/50">
            <div className="text-sm font-semibold text-white">{user?.name || "User"}</div>
            <div className="text-xs text-slate-400 capitalize mt-1">{user?.role?.replace("_", " ") || "Unknown"}</div>
          </div>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({
  item,
  isActive,
  expanded,
  onToggle,
  onClose,
}: {
  item: NavItem;
  isActive: (href: string) => boolean;
  expanded: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const Icon = iconMap[item.icon] || LayoutDashboard;
  const hasChildren = item.children && item.children.length > 0;
  const active = isActive(item.href);

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={item.href}
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative group",
            active
              ? "bg-gradient-to-r from-blue-600/30 to-blue-500/20 text-blue-200 border border-blue-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          )}
        >
          {active && (
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r" />
          )}
          <Icon className="h-5 w-5 shrink-0" />
          <span className="flex-1">{item.label}</span>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "bg-slate-800/50 text-slate-200"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 transition-transform" />
        )}
      </button>
      {expanded && (
        <ul className="ml-3 mt-2 space-y-1 pl-3 border-l border-slate-700/50">
          {item.children!.map((child) => {
            const childActive = isActive(child.href);
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                    childActive
                      ? "font-medium text-blue-300 bg-blue-500/10"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                  )}
                >
                  <span className="w-1 h-1 rounded-full" style={{
                    backgroundColor: childActive ? "#60a5fa" : "transparent"
                  }} />
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
