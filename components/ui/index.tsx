"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

// ============================================
// BUTTON
// ============================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";
    const variants = {
      primary: "bg-accent hover:bg-accent-hover text-white",
      secondary: "bg-bg-elevated border border-bg-border text-text-primary hover:border-accent/50 hover:text-accent",
      ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
      danger: "bg-red-600/20 border border-red-600/40 text-red-400 hover:bg-red-600/30",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// ============================================
// INPUT
// ============================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-3 py-2 rounded-lg bg-bg-elevated border text-text-primary placeholder:text-text-muted text-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50",
          error ? "border-red-500/50" : "border-bg-border",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

// ============================================
// TEXTAREA
// ============================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "w-full px-3 py-2 rounded-lg bg-bg-elevated border text-text-primary placeholder:text-text-muted text-sm transition-colors resize-none",
          "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50",
          error ? "border-red-500/50" : "border-bg-border",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ============================================
// SELECT
// ============================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          "w-full px-3 py-2 rounded-lg bg-bg-elevated border text-text-primary text-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50",
          error ? "border-red-500/50" : "border-bg-border",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ============================================
// BADGE
// ============================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "ongoing" | "completed" | "hiatus";
  className?: string;
  onClick?: () => void;
}

export function Badge({ children, variant = "default", className, onClick }: BadgeProps) {
  const variants = {
    default: "bg-bg-elevated text-text-secondary border-bg-border",
    ongoing: "bg-status-ongoing/15 text-status-ongoing border-status-ongoing/30",
    completed: "bg-status-completed/15 text-status-completed border-status-completed/30",
    hiatus: "bg-status-hiatus/15 text-status-hiatus border-status-hiatus/30",
  };
  return (
    <span onClick={onClick} className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", variants[variant], className)}>
      {children}
    </span>
  );
}

// ============================================
// SPINNER
// ============================================

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin h-5 w-5 text-accent", className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ============================================
// EMPTY STATE
// ============================================

export function EmptyState({ title, description, action }: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-base font-medium text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-secondary mb-4">{description}</p>}
      {action}
    </div>
  );
}
