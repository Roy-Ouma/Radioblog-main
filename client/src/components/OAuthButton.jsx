import React from "react";
import { FcGoogle } from "react-icons/fc";
import { BiLoaderAlt } from "react-icons/bi";

const OAuthButton = ({
  provider = "google",
  onClick,
  loading = false,
  disabled = false,
  label = "Sign in with Google",
  fullWidth = false,
  className = "",
  ...rest
}) => {
  const providerConfig = {
    google: {
      icon: FcGoogle,
      label: label || "Sign in with Google",
      bgColor: "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700",
      textColor: "text-gray-900 dark:text-white",
      borderColor: "border-2 border-gray-200 dark:border-gray-700",
    },
  };

  const config = providerConfig[provider] || providerConfig.google;
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center gap-2
        px-4 py-2.5 rounded-lg font-medium
        transition-all duration-200
        ${config.borderColor}
        ${config.bgColor}
        ${config.textColor}
        active:scale-95
        ${disabled || loading ? "opacity-60 cursor-not-allowed active:scale-100" : ""}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <BiLoaderAlt size={18} className="animate-spin" />
      ) : (
        <Icon size={20} />
      )}
      <span>{label}</span>
    </button>
  );
};

export default OAuthButton;
