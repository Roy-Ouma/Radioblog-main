import React from "react";

const FormInputField = ({
  label,
  type = "text",
  name = "",
  value,
  onChange,
  placeholder = "",
  error = "",
  isRequired = false,
  disabled = false,
  autoComplete = "off",
  className = "",
  ...rest
}) => {
  const id = name || `input-${Math.random().toString(36).slice(2, 9)}`;

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
      <input
        id={id}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        required={isRequired}
        className={`
          w-full px-4 py-2.5 rounded-lg
          border-2 transition-all duration-200
          focus:outline-none
          dark:bg-gray-800 dark:text-white
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
              : "border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900"
          }
          ${disabled ? "bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60" : "hover:border-gray-300 dark:hover:border-gray-600"}
        `}
        {...rest}
      />
      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInputField;
