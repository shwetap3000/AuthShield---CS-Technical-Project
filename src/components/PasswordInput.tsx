import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  helperText,
  id = 'password',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
          <Lock className="w-4 h-4" />
        </div>

        <input
          {...props}
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={`w-full pl-10 pr-10 py-2.5 bg-gray-950/80 border rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
            error
              ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
              : 'border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
          }`}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};
