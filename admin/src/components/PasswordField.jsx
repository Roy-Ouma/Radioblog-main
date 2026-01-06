import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const PasswordField = ({
  label,
  name = "",
  value,
  onChange,
  placeholder = "",
  error = "",
  isRequired = false,
  disabled = false,
  autoComplete = "off",
  className = "",
  showStrength = false,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const id = name || `password-${Math.random().toString(36).slice(2, 9)}`;

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!value) return null;
    let strength = 0;
    if (value.length >= 8) strength += 1;
    if (value.length >= 12) strength += 1;
    if (/[A-Z]/.test(value)) strength += 1;
    if (/[0-9]/.test(value)) strength += 1;
    if (/[!@#$%^&*]/.test(value)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["text-red-600", "text-orange-600", "text-yellow-600", "text-lime-600", "text-green-600"];
  const strengthBgColors = ["bg-red-200 dark:bg-red-900", "bg-orange-200 dark:bg-orange-900", "bg-yellow-200 dark:bg-yellow-900", "bg-lime-200 dark:bg-lime-900", "bg-green-200 dark:bg-green-900"];

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          required={isRequired}
          className={`
            w-full px-4 py-2.5 pr-12 rounded-lg
            border-2 transition-all duration-200
            focus:outline-none
            dark:bg-gray-800 dark:text-white
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                : "border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900"
            }
            ${disabled ? "bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60" : "hover:border-gray-300 dark:hover:border-gray-600"}
          `}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <AiOutlineEyeInvisible size={20} />
          ) : (
            <AiOutlineEye size={20} />
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {showStrength && value && strength !== null && (
        <div className="space-y-1">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strengthBgColors[strength]}`}
              style={{ width: `${((strength + 1) / 5) * 100}%` }}
            />
          </div>
          <p className={`text-xs font-medium ${strengthColors[strength]}`}>
            {strengthLabels[strength]} password
          </p>
        </div>
      )}
    </div>
  );
};

export default PasswordField;
