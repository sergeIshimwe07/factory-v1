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

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number; color?: string }>> = {
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

  const filteredNav = navigationItems;

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const roleInitial = (user?.name || "U").charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');

        .sb-root {
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --gold-dim: rgba(201,168,76,0.12);
          --gold-border: rgba(201,168,76,0.22);
          --bg: #0A0C10;
          --surface: #0E1117;
          --surface-2: #141820;
          --surface-3: #1A1F2C;
          --border: rgba(255,255,255,0.06);
          --text: #F0EDE8;
          --text-muted: #525866;
          --text-dim: #818896;
          --red: #F87171;
          font-family: 'Outfit', sans-serif;
          background: var(--bg);
          color: var(--text);
          width: 260px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border);
          position: fixed;
          left: 0; top: 0;
          z-index: 50;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .sb-root.closed {
          transform: translateX(-100%);
        }
        @media (min-width: 1024px) {
          .sb-root { position: static; transform: none !important; }
        }

        /* Logo area */
        .sb-logo {
          padding: 1.5rem 1.5rem 1.25rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .sb-logo-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }
        .sb-logo-icon {
          width: 34px; height: 34px;
          border: 1px solid var(--gold-border);
          display: flex; align-items: center; justify-content: center;
          background: var(--gold-dim);
          flex-shrink: 0;
          transition: background 0.2s, border-color 0.2s;
        }
        .sb-logo-link:hover .sb-logo-icon {
          background: rgba(201,168,76,0.2);
          border-color: var(--gold);
        }
        .sb-logo-wordmark {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }
        .sb-logo-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
          letter-spacing: 0.03em;
        }
        .sb-logo-tag {
          font-family: 'DM Mono', monospace;
          font-size: 0.55rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-top: 0.1rem;
        }
        .sb-close-btn {
          width: 28px; height: 28px;
          border: 1px solid var(--border);
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .sb-close-btn:hover {
          border-color: var(--gold-border);
          color: var(--gold);
        }
        @media (min-width: 1024px) {
          .sb-close-btn { display: none; }
        }

        /* Nav section */
        .sb-nav {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 0.875rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.08) transparent;
        }
        .sb-nav::-webkit-scrollbar { width: 3px; }
        .sb-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 0; }

        /* Section label */
        .sb-section-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.58rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 0.5rem 0.5rem 0.35rem;
          margin-top: 0.5rem;
        }

        /* Nav item */
        .sb-nav-item {
          list-style: none;
          margin-bottom: 1px;
        }
        .sb-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.75rem;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 400;
          color: var(--text-dim);
          position: relative;
          transition: color 0.15s, background 0.15s;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
        }
        .sb-nav-link::before {
          content: '';
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 0;
          background: var(--gold);
          transition: height 0.2s;
        }
        .sb-nav-link:hover {
          color: var(--text);
          background: var(--surface-2);
        }
        .sb-nav-link:hover::before {
          height: 12px;
        }
        .sb-nav-link.active {
          color: var(--gold-light);
          background: var(--gold-dim);
        }
        .sb-nav-link.active::before {
          height: 20px;
        }
        .sb-nav-icon {
          flex-shrink: 0;
          opacity: 0.7;
          transition: opacity 0.15s;
        }
        .sb-nav-link:hover .sb-nav-icon,
        .sb-nav-link.active .sb-nav-icon {
          opacity: 1;
        }
        .sb-nav-label {
          flex: 1;
          letter-spacing: 0.01em;
        }
        .sb-nav-chevron {
          flex-shrink: 0;
          color: var(--text-muted);
          transition: transform 0.2s;
        }
        .sb-nav-chevron.open {
          transform: rotate(90deg);
        }

        /* Children */
        .sb-children {
          padding: 0.25rem 0 0.25rem 1.25rem;
          border-left: 1px solid var(--border);
          margin-left: 1.5rem;
          margin-bottom: 2px;
        }
        .sb-child-link {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.45rem 0.75rem;
          font-size: 0.78rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.15s;
          position: relative;
        }
        .sb-child-link::before {
          content: '';
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--text-muted);
          flex-shrink: 0;
          transition: background 0.15s, transform 0.15s;
        }
        .sb-child-link:hover {
          color: var(--text);
        }
        .sb-child-link:hover::before {
          background: var(--gold);
          transform: scale(1.4);
        }
        .sb-child-link.active {
          color: var(--gold-light);
        }
        .sb-child-link.active::before {
          background: var(--gold);
        }

        /* Divider */
        .sb-divider {
          height: 1px;
          background: var(--border);
          margin: 0.5rem 0.5rem;
        }

        /* Footer */
        .sb-footer {
          border-top: 1px solid var(--border);
          padding: 1rem 0.875rem;
          flex-shrink: 0;
        }
        .sb-user-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--surface-2);
          border: 1px solid var(--border);
          margin-bottom: 0.5rem;
        }
        .sb-avatar {
          width: 32px; height: 32px;
          border: 1px solid var(--gold-border);
          background: var(--gold-dim);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          font-weight: 600;
          color: var(--gold-light);
        }
        .sb-user-name {
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text);
          line-height: 1;
        }
        .sb-user-role {
          font-family: 'DM Mono', monospace;
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }
        .sb-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.55rem 0.75rem;
          font-size: 0.78rem;
          font-family: 'Outfit', sans-serif;
          color: var(--text-muted);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
          letter-spacing: 0.01em;
        }
        .sb-logout-btn:hover {
          color: var(--red);
          background: rgba(248,113,113,0.06);
        }

        /* Overlay */
        .sb-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 40;
          backdrop-filter: blur(2px);
        }
        @media (min-width: 1024px) {
          .sb-overlay { display: none; }
        }
      `}</style>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="sb-overlay" onClick={onClose} />
      )}

      <aside className={`sb-root${!isOpen ? " closed" : ""}`}>
        {/* Logo */}
        <div className="sb-logo">
          <Link href="/dashboard" className="sb-logo-link">
            <div className="sb-logo-icon">
              <Factory size={15} color="#C9A84C" />
            </div>
            <div className="sb-logo-wordmark">
              <span className="sb-logo-name">Factory</span>
              <span className="sb-logo-tag">Enterprise&nbsp;ERP</span>
            </div>
          </Link>
          <button className="sb-close-btn" onClick={onClose}>
            <X size={13} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filteredNav.length > 0 ? (
              filteredNav.map((item, i) => (
                <SidebarItem
                  key={item.label}
                  item={item}
                  isActive={(href) => pathname === href || pathname.startsWith(href + "/")}
                  expanded={expandedItems.has(item.label)}
                  onToggle={() => toggleExpand(item.label)}
                  onClose={onClose}
                />
              ))
            ) : (
              <li style={{ padding: "2rem 0.5rem", textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
                No modules available
              </li>
            )}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sb-footer">
          <div className="sb-user-card">
            <div className="sb-avatar">{roleInitial}</div>
            <div>
              <div className="sb-user-name">{user?.name || "User"}</div>
              <div className="sb-user-role">{user?.role?.replace("_", " ") || "Unknown"}</div>
            </div>
          </div>
          <button
            className="sb-logout-btn"
            onClick={() => { logout(); onClose(); }}
          >
            <LogOut size={13} />
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
      <li className="sb-nav-item">
        <Link
          href={item.href}
          onClick={onClose}
          className={`sb-nav-link${active ? " active" : ""}`}
        >
          <Icon size={15} className="sb-nav-icon" />
          <span className="sb-nav-label">{item.label}</span>
        </Link>
      </li>
    );
  }

  return (
    <li className="sb-nav-item">
      <button
        onClick={onToggle}
        className={`sb-nav-link${active ? " active" : ""}`}
      >
        <Icon size={15} className="sb-nav-icon" />
        <span className="sb-nav-label">{item.label}</span>
        <ChevronRight size={12} className={`sb-nav-chevron${expanded ? " open" : ""}`} />
      </button>
      {expanded && (
        <ul className="sb-children" style={{ listStyle: "none", padding: "0.25rem 0 0.25rem 1rem", borderLeft: "1px solid rgba(255,255,255,0.06)", marginLeft: "1.5rem" }}>
          {item.children!.map((child) => {
            const childActive = isActive(child.href);
            return (
              <li key={child.href} style={{ listStyle: "none" }}>
                <Link
                  href={child.href}
                  onClick={onClose}
                  className={`sb-child-link${childActive ? " active" : ""}`}
                >
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