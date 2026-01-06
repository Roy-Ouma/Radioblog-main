import React from "react";
import { BiLoaderAlt } from "react-icons/bi";

const FormButton = ({
  label,
  type = "submit",
  onClick,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon = null,
  className = "",
  ...rest
}) => {
  const baseClasses =
    "flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-lg active:scale-95 dark:from-orange-600 dark:to-orange-700",
    secondary:
      "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95",
    outline:
      "border-2 border-orange-500 text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 active:scale-95",
    danger:
      "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg active:scale-95 dark:bg-red-600 dark:hover:bg-red-700",
  };

  const disabledClass =
    "opacity-60 cursor-not-allowed hover:shadow-none active:scale-100";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled || loading ? disabledClass : ""}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      aria-busy={loading}
      {...rest}
    >
      {loading && <BiLoaderAlt size={18} className="animate-spin" />}
      {icon && !loading && <span>{icon}</span>}
      {label}
    </button>
  );
};

export default FormButton;
