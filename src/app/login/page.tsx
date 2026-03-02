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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const FEATURES = [
  { icon: BarChart3, label: "Real-time Sales Analytics" },
  { icon: Package, label: "Inventory & Production" },
  { icon: Users, label: "Team & Commission Management" },
  { icon: ShieldCheck, label: "Role-based Access Control" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      toast({ title: "Welcome back!", variant: "success" });
      router.push("/dashboard");
    } catch {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "error",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left panel — immersive branding */}
      <div className="login-brand-panel hidden lg:flex lg:w-[55%] relative flex-col overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950" />

        {/* Animated grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        {/* Floating glow orbs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-[100px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col p-10 xl:p-14 text-white">
          {/* Logo — fixed at top */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <Factory className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Factory ERP</span>
          </div>

          {/* Hero text — centered vertically in remaining space */}
          <div className="flex flex-1 flex-col justify-center items-center">
            <div className="flex flex-1 flex-col justify-center ml-16 px-12 gap-12 max-w-xl py-12">
              <div style={{ padding: '4px 8px'}} className="inline-flex items-center gap-2 rounded-full bg-white/10 p-8 text-sm font-medium backdrop-blur-sm border border-white/10 mb-8 w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <div>System Online</div>
              </div>
              <h2 className="text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight">
                Enterprise Resource
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                  Planning System
                </span>
              </h2>
              <p className="mt-6 text-lg xl:text-xl leading-relaxed text-slate-300/90 max-w-md">
                Streamline your factory operations with an all-in-one solution for sales, inventory, production, and financial management.
              </p>

              {/* Feature pills */}
              <div className="mt-10 grid grid-cols-2 gap-3">
                {FEATURES.map((f, i) => (
                  <div
                    key={f.label}
                    className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-5 py-3.5 backdrop-blur-sm border border-white/[0.08] transition-colors hover:bg-white/[0.1]"
                    style={{ animationDelay: `${i * 100}ms`, padding: '4px 8px'}}
                  >
                    <f.icon className="h-5 w-5 shrink-0 text-blue-300" />
                    <span className="text-[15px] font-medium text-slate-200">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer — fixed at bottom */}
          <p className="text-sm text-slate-400/70">
            &copy; {new Date().getFullYear()} Factory ERP &mdash; All rights reserved
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex w-full items-center justify-center gap-12 px-8 py-12 lg:w-[45%]">
        <div
          className={`w-full flex flex-col gap-8 max-w-[440px] transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
          {/* Mobile logo */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Factory ERP</span>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="mt-3 text-base text-slate-500">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 space-y-6">
            {/* Email field */}
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  style={{ paddingLeft: '45px' }}
                  className={`flex h-[52px] w-full rounded-xl border bg-white pl-24 pr-4 text-[15px] shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                    errors.email
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                      : "border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-blue-200"
                  }`}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1.5">
                  <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{ paddingLeft: '45px'}}
                  className={`flex h-[52px] w-full rounded-xl border bg-white pl-12 pr-14 text-[15px] shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                    errors.password
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                      : "border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-blue-200"
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 flex items-center gap-1.5">
                  <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="login-btn group relative flex h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-slate-900 text-[15px] font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/25 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-50 px-4 text-sm text-slate-400">Need help?</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 leading-relaxed">
            Contact your system administrator
            <br />
            if you need access or forgot your credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
