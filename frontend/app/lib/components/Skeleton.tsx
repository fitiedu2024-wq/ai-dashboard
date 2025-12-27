'use client';

import React from 'react';

// Base Skeleton component
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-white/10 rounded ${className}`}
    />
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// Stats Grid Skeleton (4 cards)
export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-white/10">
      {[...Array(columns)].map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-white/5 border-b border-white/10">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  );
}

// List Item Skeleton
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

// Page Header Skeleton
export function PageHeaderSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-72" />
    </div>
  );
}

// Form Skeleton
export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      {[...Array(fields)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ))}
      <Skeleton className="h-12 w-full rounded-xl mt-4" />
    </div>
  );
}

// Analysis Result Skeleton
export function AnalysisResultSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Issues */}
      <div className="glass rounded-2xl p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass rounded-2xl p-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Sidebar Skeleton
export function SidebarSkeleton() {
  return (
    <div className="w-80 h-screen glass p-6">
      <Skeleton className="h-10 w-40 mb-8" />
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
      <div className="mt-auto pt-8">
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}

// Full Page Loading
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen p-8">
      <PageHeaderSkeleton />
      <StatsGridSkeleton />
      <div className="mt-8">
        <TableSkeleton />
      </div>
    </div>
  );
}
