"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ title = "Something went wrong", message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertTriangle className="h-12 w-12 text-red-400" />
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      {message && <p className="mt-2 text-sm text-slate-500">{message}</p>}
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-4">
          Try Again
        </Button>
      )}
    </div>
  );
}

export function PermissionDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertTriangle className="h-12 w-12 text-yellow-400" />
      <h3 className="mt-4 text-lg font-semibold text-slate-900">Access Denied</h3>
      <p className="mt-2 text-sm text-slate-500">You don&apos;t have permission to access this page.</p>
    </div>
  );
}
