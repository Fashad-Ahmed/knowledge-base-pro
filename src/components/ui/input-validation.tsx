import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

interface ValidatedInputProps {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean) => void;
  rules?: ValidationRule[];
  required?: boolean;
  className?: string;
}

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value) => value.trim().length > 0,
    message
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => value.length >= min,
    message: message || `Must be at least ${min} characters`
  }),
  
  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),
  
  password: (message = 'Password must contain at least 8 characters, one uppercase letter, one number'): ValidationRule => ({
    test: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(value),
    message
  }),
  
  noSpecialChars: (message = 'Only letters, numbers, and spaces allowed'): ValidationRule => ({
    test: (value) => /^[a-zA-Z0-9\s]*$/.test(value),
    message
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => value.length <= max,
    message: message || `Must be no more than ${max} characters`
  })
};

export function ValidatedInput({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  onValidation,
  rules = [],
  required = false,
  className
}: ValidatedInputProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  const validate = useCallback((inputValue: string) => {
    const allRules = required ? [validationRules.required(), ...rules] : rules;
    const newErrors = allRules
      .filter(rule => !rule.test(inputValue))
      .map(rule => rule.message);
    
    setErrors(newErrors);
    const isValid = newErrors.length === 0;
    onValidation?.(isValid);
    
    return isValid;
  }, [rules, required, onValidation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (touched) {
      validate(newValue);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    validate(value);
  };

  const isValid = errors.length === 0 && touched && value.length > 0;
  const hasErrors = errors.length > 0 && touched;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={label.toLowerCase().replace(/\s+/g, '-')}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'transition-colors',
            hasErrors && 'border-destructive focus:border-destructive',
            isValid && 'border-success focus:border-success'
          )}
        />
        
        {isValid && (
          <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-success" />
        )}
        
        {hasErrors && (
          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-destructive" />
        )}
      </div>
      
      {hasErrors && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <Alert key={index} variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}

// Sanitization utilities
export const sanitizers = {
  removeScripts: (input: string): string => {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  },
  
  removeHTML: (input: string): string => {
    return input.replace(/<[^>]*>/g, '');
  },
  
  escapeHTML: (input: string): string => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },
  
  alphanumeric: (input: string): string => {
    return input.replace(/[^a-zA-Z0-9]/g, '');
  },
  
  filename: (input: string): string => {
    return input.replace(/[^a-zA-Z0-9.-]/g, '_');
  },
  
  trim: (input: string): string => {
    return input.trim();
  }
};