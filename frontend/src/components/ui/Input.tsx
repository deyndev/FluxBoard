import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export function Input({ label, icon, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-medium text-secondary ml-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative group/input">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary group-focus-within/input:text-primary transition-colors">
            {icon}
          </div>
        )}
        <input
          className={clsx(
            "input-base",
            icon && "pl-10",
            error && "!border-red-500/50 !focus:ring-red-500/20",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
    </div>
  );
}
