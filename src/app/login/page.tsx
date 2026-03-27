"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Factory,
  Eye,
  EyeOff,
  Mail,
  Lock,
  BarChart3,
  Package,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";

const loginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const FEATURES = [
  { icon: BarChart3, label: "Real-time Sales Analytics" },
  { icon: Package,   label: "Inventory & Production"    },
  { icon: Users,     label: "Team & Commission Mgmt"    },
  { icon: ShieldCheck, label: "Role-based Access Control" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused,  setPassFocused]  = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (isAuthenticated) router.replace("/dashboard"); }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      toast({ title: "Welcome back!", variant: "success" });
      router.push("/dashboard");
    } catch {
      toast({ title: "Login failed", description: "Invalid email or password.", variant: "error" });
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');

        /* ── resets ── */
        *, *::before, *::after { box-sizing: border-box; }

        /* ── page ── */
        .login-root {
          min-height: 100vh;
          display: flex;
          background: #F5F2EE;
          font-family: 'Outfit', sans-serif;
        }

        /* ── LEFT PANEL ── */
        .login-left {
          display: none;
          position: relative;
          overflow: hidden;
          flex-direction: column;
        }
        @media (min-width: 1024px) {
          .login-left { display: flex; width: 52%; }
        }

        /* Warm linen background */
        .login-left-bg {
          position: absolute; inset: 0;
          background: #1A1410;
        }

        /* Subtle grid */
        .login-left-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(201,168,76,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.07) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        /* Gold horizontal rule that sweeps across */
        .login-left-rule {
          position: absolute;
          top: 50%; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.35) 40%, rgba(201,168,76,0.35) 60%, transparent 100%);
          transform: translateY(-120px);
        }

        /* Warm glow orb bottom-right */
        .login-left-orb {
          position: absolute;
          bottom: -80px; right: -80px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(181,97,31,0.18) 0%, transparent 70%);
        }
        .login-left-orb-2 {
          position: absolute;
          top: -60px; left: -60px;
          width: 320px; height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
        }

        /* Content layer */
        .login-left-content {
          position: relative; z-index: 10;
          display: flex; flex-direction: column;
          flex: 1;
          padding: 2.5rem 3rem;
          color: #F0EDE8;
        }

        /* Logo row */
        .login-logo {
          display: flex; align-items: center; gap: 0.75rem;
          text-decoration: none;
        }
        .login-logo-box {
          width: 36px; height: 36px;
          border: 1px solid rgba(201,168,76,0.35);
          background: rgba(201,168,76,0.1);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .login-logo-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem; font-weight: 600;
          letter-spacing: 0.04em;
          color: #F0EDE8;
        }
        .login-logo-tag {
          font-family: 'DM Mono', monospace;
          font-size: 0.52rem; letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #C9A84C; margin-top: 0.1rem;
        }

        /* Hero section */
        .login-hero {
          flex: 1;
          display: flex; flex-direction: column;
          justify-content: center;
          padding: 3rem 0;
        }

        .login-status-pill {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border: 1px solid rgba(201,168,76,0.25);
          background: rgba(201,168,76,0.08);
          padding: 0.3rem 0.75rem;
          font-family: 'DM Mono', monospace;
          font-size: 0.6rem; letter-spacing: 0.15em;
          text-transform: uppercase; color: #C9A84C;
          margin-bottom: 2rem;
          width: fit-content;
        }
        .login-status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #34D399;
          box-shadow: 0 0 6px rgba(52,211,153,0.8);
          animation: login-pulse 2s ease-in-out infinite;
        }
        @keyframes login-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        .login-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.75rem, 4vw, 3.75rem);
          font-weight: 600;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #F0EDE8;
          margin-bottom: 1.25rem;
        }
        .login-headline em {
          font-style: italic;
          color: #C9A84C;
        }

        .login-subline {
          font-size: 0.9rem; font-weight: 300;
          line-height: 1.7; color: rgba(240,237,232,0.55);
          max-width: 380px;
          margin-bottom: 2.5rem;
          letter-spacing: 0.02em;
        }

        /* Feature list */
        .login-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
        }
        .login-feature-item {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.65rem 0.9rem;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          transition: background 0.2s, border-color 0.2s;
        }
        .login-feature-item:hover {
          background: rgba(201,168,76,0.06);
          border-color: rgba(201,168,76,0.18);
        }
        .login-feature-icon {
          width: 28px; height: 28px; flex-shrink: 0;
          border: 1px solid rgba(201,168,76,0.2);
          background: rgba(201,168,76,0.08);
          display: flex; align-items: center; justify-content: center;
        }
        .login-feature-label {
          font-size: 0.75rem; font-weight: 400;
          color: rgba(240,237,232,0.7);
          letter-spacing: 0.01em;
        }

        /* Footer */
        .login-left-footer {
          font-family: 'DM Mono', monospace;
          font-size: 0.58rem; letter-spacing: 0.1em;
          color: rgba(240,237,232,0.25);
          text-transform: uppercase;
        }

        /* Vertical divider */
        .login-divider {
          display: none;
          width: 1px;
          background: linear-gradient(to bottom, transparent 0%, rgba(181,97,31,0.2) 20%, rgba(181,97,31,0.2) 80%, transparent 100%);
          flex-shrink: 0;
        }
        @media (min-width: 1024px) { .login-divider { display: block; } }

        /* ── RIGHT PANEL ── */
        .login-right {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 3rem 2rem;
        }

        .login-form-wrap {
          width: 100%; max-width: 400px;
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .login-form-wrap.mounted {
          opacity: 1; transform: translateY(0);
        }

        /* Mobile logo */
        .login-mobile-logo {
          display: flex; align-items: center; gap: 0.6rem;
          margin-bottom: 2.5rem;
        }
        @media (min-width: 1024px) { .login-mobile-logo { display: none; } }

        .login-mobile-logo-box {
          width: 30px; height: 30px;
          border: 1px solid rgba(181,97,31,0.3);
          background: rgba(181,97,31,0.06);
          display: flex; align-items: center; justify-content: center;
        }

        /* Form heading */
        .login-form-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 0.58rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: #B5611F;
          margin-bottom: 0.6rem;
        }
        .login-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.75rem; font-weight: 600;
          line-height: 1; letter-spacing: -0.02em;
          color: #1C1917; margin-bottom: 0.5rem;
        }
        .login-form-sub {
          font-size: 0.82rem; color: #A8A29E; font-weight: 300;
          letter-spacing: 0.02em; margin-bottom: 2.25rem;
        }

        /* Field */
        .login-field { margin-bottom: 1.25rem; }
        .login-field-label {
          display: block;
          font-family: 'DM Mono', monospace;
          font-size: 0.58rem; letter-spacing: 0.15em;
          text-transform: uppercase; color: #A8A29E;
          margin-bottom: 0.4rem;
        }
        .login-input-wrap { position: relative; }
        .login-input-icon {
          position: absolute; left: 0.85rem; top: 50%;
          transform: translateY(-50%);
          pointer-events: none; color: #A8A29E;
          transition: color 0.15s;
        }
        .login-input {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid rgba(0,0,0,0.08);
          color: #1C1917;
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
          padding: 0.7rem 0.85rem 0.7rem 2.4rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .login-input:focus {
          border-color: rgba(181,97,31,0.4);
          box-shadow: 0 0 0 3px rgba(181,97,31,0.06);
        }
        .login-input.error {
          border-color: rgba(220,38,38,0.4);
          box-shadow: 0 0 0 3px rgba(220,38,38,0.06);
        }
        .login-input::placeholder { color: #C8C2BC; }
        .login-input-action {
          position: absolute; right: 0.75rem; top: 50%;
          transform: translateY(-50%);
          background: transparent; border: none; cursor: pointer;
          color: #A8A29E; padding: 0.2rem;
          transition: color 0.15s;
          display: flex; align-items: center;
        }
        .login-input-action:hover { color: #78716C; }

        .login-field-error {
          display: flex; align-items: center; gap: 0.35rem;
          font-family: 'DM Mono', monospace;
          font-size: 0.58rem; letter-spacing: 0.05em;
          color: #DC2626; margin-top: 0.35rem;
        }
        .login-field-error-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: #DC2626; flex-shrink: 0;
        }

        /* Submit */
        .login-submit {
          width: 100%; margin-top: 0.5rem;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #1C1917;
          border: 1px solid #1C1917;
          color: #F0EDE8;
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem; letter-spacing: 0.15em;
          text-transform: uppercase; cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s;
          position: relative; overflow: hidden;
        }
        .login-submit::before {
          content: '';
          position: absolute; top: 0; left: -100%; right: 100%; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent);
          transition: left 0.5s, right 0.5s;
        }
        .login-submit:hover { background: #2C2420; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .login-submit:hover::before { left: 0; right: 0; }
        .login-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .login-submit:disabled:hover { background: #1C1917; box-shadow: none; }
        .login-submit-arrow {
          transition: transform 0.2s;
        }
        .login-submit:hover .login-submit-arrow { transform: translateX(3px); }

        @keyframes lux-spin { to { transform: rotate(360deg); } }
        .login-spinner {
          width: 14px; height: 14px;
          border: 1.5px solid rgba(240,237,232,0.4);
          border-top-color: #F0EDE8;
          border-radius: 50%;
          animation: lux-spin 0.7s linear infinite;
        }

        /* Separator */
        .login-sep {
          display: flex; align-items: center; gap: 1rem;
          margin: 2rem 0 1.5rem;
        }
        .login-sep-line {
          flex: 1; height: 1px;
          background: rgba(0,0,0,0.07);
        }
        .login-sep-text {
          font-family: 'DM Mono', monospace;
          font-size: 0.58rem; letter-spacing: 0.12em;
          text-transform: uppercase; color: #C8C2BC;
          white-space: nowrap;
        }

        /* Footer note */
        .login-footer-note {
          text-align: center; font-size: 0.78rem;
          color: #A8A29E; line-height: 1.7; font-weight: 300;
        }
      `}</style>

      <div className="login-root">

        {/* ── Left branding panel ── */}
        <div className="login-left">
          <div className="login-left-bg" />
          <div className="login-left-grid" />
          <div className="login-left-rule" />
          <div className="login-left-orb" />
          <div className="login-left-orb-2" />

          <div className="login-left-content">
            {/* Logo */}
            <div className="login-logo">
              <div className="login-logo-box">
                <Factory size={16} color="#C9A84C" />
              </div>
              <div>
                <div className="login-logo-name">Factory</div>
                <div className="login-logo-tag">Enterprise ERP</div>
              </div>
            </div>

            {/* Hero */}
            <div className="login-hero">
              <div className="login-status-pill">
                <span className="login-status-dot" />
                System Online
              </div>

              <h2 className="login-headline">
                Manage every<br />
                part of your <em>factory</em><br />
                from one place.
              </h2>

              <p className="login-subline">
                Sales, inventory, production, and team management — unified in a single, elegant operating system.
              </p>

              <div className="login-features">
                {FEATURES.map((f) => (
                  <div key={f.label} className="login-feature-item">
                    <div className="login-feature-icon">
                      <f.icon size={13} color="#C9A84C" />
                    </div>
                    <span className="login-feature-label">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="login-left-footer">
              &copy; {new Date().getFullYear()} Factory ERP &mdash; All rights reserved
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="login-divider" />

        {/* ── Right form panel ── */}
        <div className="login-right">
          <div className={`login-form-wrap${mounted ? " mounted" : ""}`}>

            {/* Mobile logo */}
            <div className="login-mobile-logo">
              <div className="login-mobile-logo-box">
                <Factory size={14} color="#B5611F" />
              </div>
              <div>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 600, color: "#1C1917" }}>Factory</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#B5611F", display: "block", marginTop: "0.1rem" }}>Enterprise ERP</span>
              </div>
            </div>

            {/* Heading */}
            <p className="login-form-eyebrow">Secure Access</p>
            <h1 className="login-form-title">Welcome<br />back.</h1>
            <p className="login-form-sub">Sign in to your account to continue</p>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>

              {/* Email */}
              <div className="login-field">
                <label className="login-field-label" htmlFor="email">Email Address</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon"><Mail size={14} /></span>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    autoComplete="email"
                    className={`login-input${errors.email ? " error" : ""}`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="login-field-error">
                    <span className="login-field-error-dot" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="login-field">
                <label className="login-field-label" htmlFor="password">Password</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon"><Lock size={14} /></span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`login-input${errors.password ? " error" : ""}`}
                    style={{ paddingRight: "2.5rem" }}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="login-input-action"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="login-field-error">
                    <span className="login-field-error-dot" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="login-submit"
              >
                {isLoading ? (
                  <span className="login-spinner" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={13} className="login-submit-arrow" />
                  </>
                )}
              </button>
            </form>

            {/* Separator */}
            <div className="login-sep">
              <div className="login-sep-line" />
              <span className="login-sep-text">Need help?</span>
              <div className="login-sep-line" />
            </div>

            <p className="login-footer-note">
              Contact your system administrator<br />
              if you need access or forgot your credentials.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}