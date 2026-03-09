"use client";
import React, { useState, useRef, useEffect } from "react";
import { Menu, Bell, LogOut, User, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { getInitials } from "@/utils/formatters";

interface NavbarProps {
  onMenuToggle: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');

        .nb-root {
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
        }

        .nb-header {
          position: sticky;
          top: 0;
          z-index: 30;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
        }

        /* Subtle gold accent line on bottom */
        .nb-header::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 80px;
          height: 1px;
          background: var(--gold);
          opacity: 0.6;
        }

        /* Menu toggle */
        .nb-menu-btn {
          width: 32px; height: 32px;
          border: 1px solid var(--border);
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-dim);
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .nb-menu-btn:hover {
          border-color: var(--gold-border);
          color: var(--gold);
          background: var(--gold-dim);
        }
        @media (min-width: 1024px) {
          .nb-menu-btn { display: none; }
        }

        /* Breadcrumb/title */
        .nb-title {
          display: none;
          font-family: 'DM Mono', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        @media (min-width: 1024px) {
          .nb-title { display: block; }
        }

        /* Right cluster */
        .nb-right {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        /* Bell button */
        .nb-bell-btn {
          position: relative;
          width: 32px; height: 32px;
          border: 1px solid var(--border);
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-dim);
          cursor: pointer;
          transition: all 0.2s;
        }
        .nb-bell-btn:hover {
          border-color: var(--gold-border);
          color: var(--gold);
          background: var(--gold-dim);
        }
        .nb-bell-dot {
          position: absolute;
          top: 7px; right: 7px;
          width: 5px; height: 5px;
          background: var(--red);
          border-radius: 50%;
          border: 1px solid var(--bg);
        }

        /* Divider */
        .nb-divider {
          width: 1px;
          height: 20px;
          background: var(--border);
          margin: 0 0.5rem;
        }

        /* User button */
        .nb-user-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.3rem 0.5rem 0.3rem 0.3rem;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nb-user-btn:hover {
          border-color: var(--border);
          background: var(--surface-2);
        }
        .nb-user-btn.open {
          border-color: var(--gold-border);
          background: var(--gold-dim);
        }
        .nb-avatar {
          width: 28px; height: 28px;
          border: 1px solid var(--gold-border);
          background: var(--gold-dim);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--gold-light);
          flex-shrink: 0;
          letter-spacing: 0.02em;
        }
        .nb-user-info {
          display: none;
          text-align: left;
          line-height: 1;
        }
        @media (min-width: 768px) {
          .nb-user-info { display: block; }
        }
        .nb-user-name {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text);
          letter-spacing: 0.01em;
        }
        .nb-user-role {
          font-family: 'DM Mono', monospace;
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
        .nb-chevron {
          color: var(--text-muted);
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .nb-chevron.open {
          transform: rotate(180deg);
        }

        /* Dropdown */
        .nb-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 6px);
          width: 220px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-top: 1px solid var(--gold-border);
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          z-index: 100;
          animation: nb-fade-in 0.15s ease;
        }
        @keyframes nb-fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .nb-dd-header {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid var(--border);
        }
        .nb-dd-name {
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text);
        }
        .nb-dd-email {
          font-family: 'DM Mono', monospace;
          font-size: 0.62rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
          letter-spacing: 0.02em;
        }

        .nb-dd-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.65rem 1rem;
          font-size: 0.78rem;
          font-family: 'Outfit', sans-serif;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          color: var(--text-dim);
          text-align: left;
          letter-spacing: 0.01em;
        }
        .nb-dd-item:hover {
          background: var(--surface-2);
          color: var(--text);
        }
        .nb-dd-item.danger {
          color: rgba(248,113,113,0.7);
        }
        .nb-dd-item.danger:hover {
          background: rgba(248,113,113,0.06);
          color: var(--red);
        }
        .nb-dd-divider {
          height: 1px;
          background: var(--border);
          margin: 0;
        }
      `}</style>

      <header className="nb-root nb-header">
        {/* Left */}
        <button className="nb-menu-btn" onClick={onMenuToggle}>
          <Menu size={14} />
        </button>
        <div className="nb-title">Factory ERP &nbsp;/&nbsp; Management System</div>

        {/* Right */}
        <div className="nb-right">
          {/* Bell */}
          <button className="nb-bell-btn">
            <Bell size={14} />
            <span className="nb-bell-dot" />
          </button>

          <div className="nb-divider" />

          {/* User dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              className={`nb-user-btn${dropdownOpen ? " open" : ""}`}
              onClick={() => setDropdownOpen((v) => !v)}
            >
              <div className="nb-avatar">
                {user ? getInitials(user.name) : "U"}
              </div>
              <div className="nb-user-info">
                <div className="nb-user-name">{user?.name || "User"}</div>
                <div className="nb-user-role">{user?.role?.replace("_", " ") || "Unknown"}</div>
              </div>
              <ChevronDown size={12} className={`nb-chevron${dropdownOpen ? " open" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="nb-dropdown">
                <div className="nb-dd-header">
                  <div className="nb-dd-name">{user?.name}</div>
                  <div className="nb-dd-email">{user?.email}</div>
                </div>
                <button
                  className="nb-dd-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={13} />
                  Profile
                </button>
                <div className="nb-dd-divider" />
                <button
                  className="nb-dd-item danger"
                  onClick={() => { setDropdownOpen(false); logout(); }}
                >
                  <LogOut size={13} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}