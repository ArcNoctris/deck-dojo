import React from 'react';
import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = ({ className = '', containerClassName = '', icon, ...props }: InputProps) => {
  return (
    <div className={`relative group ${containerClassName}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon ? icon : <Search className="h-4 w-4 text-gray-500 group-focus-within:text-cyan-500 transition-colors" />}
      </div>
      <input
        className={`block w-full pl-10 pr-3 py-2.5 bg-navy-800/50 border border-navy-800 text-cyan-50 placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all duration-200 font-mono text-sm chamfered ${className}`}
        {...props}
      />
      {/* Subtle corner accents on focus could be added here if desired */}
    </div>
  );
};
