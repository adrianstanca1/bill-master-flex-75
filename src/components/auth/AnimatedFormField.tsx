import { useState, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedFormFieldProps {
  id: string;
  type?: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  icon?: ReactNode;
  showPasswordToggle?: boolean;
  error?: string;
  className?: string;
}

export function AnimatedFormField({
  id,
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  icon,
  showPasswordToggle = false,
  error,
  className
}: AnimatedFormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = value.length > 0;
  const actualType = showPasswordToggle && showPassword ? "text" : type;

  return (
    <div className={cn("space-y-2 animate-fade-in", className)}>
      <label 
        htmlFor={id} 
        className={cn(
          "block text-sm font-medium transition-colors duration-200",
          error ? "text-destructive" : "text-foreground"
        )}
      >
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <div className={cn(
              "transition-colors duration-200",
              isFocused || hasValue 
                ? "text-primary" 
                : "text-muted-foreground"
            )}>
              {icon}
            </div>
          </div>
        )}
        
        <input
          id={id}
          type={actualType}
          placeholder={isFocused ? placeholder : ""}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete={autoComplete}
          required={required}
          className={cn(
            "w-full py-3 rounded-lg border transition-all duration-200",
            "bg-background/50 backdrop-blur-sm",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "hover:border-primary/50",
            icon ? "pl-10" : "pl-4",
            showPasswordToggle ? "pr-12" : "pr-4",
            error 
              ? "border-destructive focus:ring-destructive" 
              : "border-border",
            isFocused && "shadow-lg shadow-primary/20"
          )}
        />
        
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={cn(
              "absolute right-3 top-1/2 transform -translate-y-1/2",
              "text-muted-foreground hover:text-foreground",
              "transition-colors duration-200 focus:outline-none",
              "p-1 rounded-md hover:bg-muted/50"
            )}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
        
        {/* Animated border effect */}
        <div className={cn(
          "absolute inset-0 rounded-lg border-2 border-primary opacity-0",
          "transition-opacity duration-200 pointer-events-none",
          isFocused && "opacity-100"
        )} />
      </div>
      
      {error && (
        <p className="text-sm text-destructive animate-slide-up">
          {error}
        </p>
      )}
      
    </div>
  );
}