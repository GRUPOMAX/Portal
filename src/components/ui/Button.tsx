import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'icon'; // Add 'icon' to allowed sizes
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  className?: string;
};

export default function Button({
  loading,
  size = 'md',
  variant = 'primary',
  className = '',
  children,
  ...rest
}: Props) {
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
    icon: 'h-10 w-10 p-0 flex items-center justify-center', // Adjust for icon button
  };

  const variantClasses = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-500 text-white',
    outline: 'bg-transparent border border-emerald-600 hover:bg-emerald-50 text-emerald-600',
    ghost: 'bg-transparent hover:bg-emerald-50 text-emerald-600',
    destructive: 'bg-red-600 hover:bg-red-500 text-white',
  };

  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={`
        rounded-xl transition-colors disabled:opacity-50
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading ? 'Salvando…' : children}
    </button>
  );
}