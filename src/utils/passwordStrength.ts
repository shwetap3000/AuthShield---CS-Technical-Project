import { PasswordRule } from '../types/index.ts';

export interface PasswordAnalysis {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Moderate' | 'Strong' | 'Very Strong';
  color: string;
  rules: PasswordRule[];
  isValid: boolean;
}

export function analyzePassword(password: string): PasswordAnalysis {
  const rules: PasswordRule[] = [
    {
      id: 'length',
      label: 'At least 8 characters long',
      valid: password.length >= 8,
    },
    {
      id: 'lowercase',
      label: 'Contains lowercase letter (a-z)',
      valid: /[a-z]/.test(password),
    },
    {
      id: 'uppercase',
      label: 'Contains uppercase letter (A-Z)',
      valid: /[A-Z]/.test(password),
    },
    {
      id: 'number',
      label: 'Contains at least one number (0-9)',
      valid: /[0-9]/.test(password),
    },
    {
      id: 'special',
      label: 'Contains special character (!@#$%^&*)',
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const metCount = rules.filter((r) => r.valid).length;

  if (password.length === 0) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'bg-gray-700',
      rules,
      isValid: false,
    };
  }

  if (metCount <= 1) {
    return {
      score: 1,
      label: 'Weak',
      color: 'bg-red-500',
      rules,
      isValid: false,
    };
  } else if (metCount === 2 || metCount === 3) {
    return {
      score: 2,
      label: 'Moderate',
      color: 'bg-amber-500',
      rules,
      isValid: false,
    };
  } else if (metCount === 4) {
    return {
      score: 3,
      label: 'Strong',
      color: 'bg-blue-500',
      rules,
      isValid: true,
    };
  } else {
    return {
      score: 4,
      label: 'Very Strong',
      color: 'bg-emerald-500',
      rules,
      isValid: true,
    };
  }
}
