import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
  children: React.ReactNode;
}

export const Button = ({ variant = 'primary', className = '', children, ...props }: ButtonProps) => {
  const baseStyles = "chamfered font-heading font-bold uppercase tracking-wider transition-all duration-200 px-6 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-cyan-500 text-navy-900 hover:glow-cyan focus:ring-cyan-500",
    danger: "bg-red-500 text-white hover:shadow-[0_0_15px_var(--color-red-500)] focus:ring-red-500",
    ghost: "bg-transparent text-cyan-500 scifi-border hover:bg-cyan-500/10 focus:ring-cyan-500"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
