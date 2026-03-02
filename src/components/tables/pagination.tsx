"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-slate-500">
        {totalItems !== undefined && pageSize !== undefined && (
          <>
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{" "}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
          </>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={() => onPageChange(1)} disabled={!canGoPrev}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={!canGoPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-slate-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage + 1)} disabled={!canGoNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onPageChange(totalPages)} disabled={!canGoNext}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
