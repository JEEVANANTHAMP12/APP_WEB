import React, { useEffect } from 'react';
import { ReactNode, CSSProperties } from 'react';
import toast from 'react-hot-toast';

interface ErrorToastProps {
  message: string;
  duration?: number;
}

interface SuccessToastProps {
  message: string;
  duration?: number;
}

interface SkeletonLoaderProps {
  count?: number;
  height?: string;
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

interface StatusBadgeProps {
  status: string;
  variant?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

interface PriceTagProps {
  price: number;
  label?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Error Modal/Toast Handler
 * Shows styled error messages to user
 */
export const ErrorToast = ({ message, duration = 4000 }: ErrorToastProps) => {
  useEffect(() => {
    toast.error(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#fee2e2',
        color: '#7f1d1d',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '16px',
        fontWeight: '500',
      },
      icon: '❌',
    });
  }, [message, duration]);

  return null;
};

/**
 * Success Toast Handler
 * Shows styled success messages
 */
export const SuccessToast = ({ message, duration = 3000 }: SuccessToastProps) => {
  useEffect(() => {
    toast.success(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#dcfce7',
        color: '#166534',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        padding: '16px',
        fontWeight: '500',
      },
      icon: '✅',
    });
  }, [message, duration]);

  return null;
};

/**
 * Loading Skeleton Component
 * Shows placeholder while content loads
 */
export const SkeletonLoader = ({ count = 3, height = 'h-12' }: SkeletonLoaderProps) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`${height} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse`}
        />
      ))}
    </div>
  );
};

/**
 * Loading Spinner
 */
export const LoadingSpinner = ({ size = 'md', fullPage = false }: LoadingSpinnerProps) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  const spinner = (
    <div className={`${sizeClass} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Status Badge Component
 * Shows order/canteen status with colors
 */
export const StatusBadge = ({ status, variant = 'default' }: StatusBadgeProps) => {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    // Order statuses
    placed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Placed' },
    confirmed: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Confirmed' },
    preparing: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Preparing' },
    ready: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ready' },
    picked_up: { bg: 'bg-green-100', text: 'text-green-800', label: 'Picked Up' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    // Payment statuses
    paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    refunded: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Refunded' },
    // Canteen statuses
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
  };

  const config = statusConfig[status] || statusConfig['pending'];

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

/**
 * Modal Dialog Component
 */
export const Modal = ({ isOpen, onClose, title, children, actions = null, size = 'md' }: ModalProps) => {
  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div className={`${sizeClass} w-full mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-gray-700 dark:text-gray-300">{children}</div>

        {/* Footer */}
        {actions && <div className="flex gap-3 p-6 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700">{actions}</div>}
      </div>
    </div>
  );
};

/**
 * Button Component with variants
 */
export const Button = ({ children, variant = 'primary', size = 'md', loading = false, disabled = false, ...props }: ButtonProps) => {
  const variantClass = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
  };

  const sizeClass = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }[size];

  return (
    <button
      className={`${variantClass[variant]} ${sizeClass} rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
};

/**
 * Card Component
 */
export const Card = ({ children, className = '', hover = false, ...props }: CardProps) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${hover ? 'hover:shadow-lg transition-shadow' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Input Component
 */
export const Input = ({ label, error, required = false, ...props }: InputProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        }`}
        {...props}
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

/**
 * Price Display Component
 */
export const PriceTag = ({ price, label = null, size = 'md' }: PriceTagProps) => {
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size];

  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-600 dark:text-gray-400">₹</span>
      <span className={`${sizeClass} font-bold text-gray-900 dark:text-white`}>
        {Math.round(price).toLocaleString('en-IN')}
      </span>
      {label && <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{label}</span>}
    </div>
  );
};
