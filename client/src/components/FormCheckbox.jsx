import React from "react";
import { MdCheck } from "react-icons/md";

const FormCheckbox = ({
  label,
  name = "",
  value,
  onChange,
  error = "",
  disabled = false,
  className = "",
  ...rest
}) => {
  const id = name || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            id={id}
            name={name}
            type="checkbox"
            checked={value ?? false}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
            aria-label={label}
            {...rest}
          />
          <label
            htmlFor={id}
            className={`
              flex items-center justify-center
              w-5 h-5 rounded-md
              border-2 transition-all duration-200 cursor-pointer
              ${
                value
                  ? "bg-orange-500 border-orange-500 dark:bg-orange-600 dark:border-orange-600"
                  : "border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {value && <MdCheck size={16} className="text-white" />}
          </label>
        </div>
        {label && (
          <label
            htmlFor={id}
            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormCheckbox;
