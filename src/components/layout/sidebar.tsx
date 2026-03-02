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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredNav = navigationItems.filter((item) =>
    hasPermission(user?.role, item.module, "view")
  );

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
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Factory className="h-7 w-7 text-slate-900" />
            <span className="text-lg font-bold text-slate-900">Factory ERP</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {filteredNav.map((item) => (
              <SidebarItem
                key={item.label}
                item={item}
                isActive={isActive}
                expanded={expandedItems.has(item.label)}
                onToggle={() => toggleExpand(item.label)}
                onClose={onClose}
              />
            ))}
          </ul>
        </nav>

        {/* User info footer */}
        <div className="border-t border-slate-200 p-4">
          <div className="text-sm font-medium text-slate-900">{user?.name || "User"}</div>
          <div className="text-xs text-slate-500 capitalize">{user?.role?.replace("_", " ") || "Unknown"}</div>
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
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
            active
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        )}
      </button>
      {expanded && (
        <ul className="ml-8 mt-1 space-y-1">
          {item.children!.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={onClose}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors",
                  isActive(child.href)
                    ? "font-medium text-slate-900 bg-slate-100"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
