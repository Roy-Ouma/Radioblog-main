import React from "react";

const Inputbox = ({
  type = "text",
  name = "",
  label,
  value,
  onChange,
  placeholder = "",
  isRequired = false,
  className = "",
  ...rest
}) => {
  const id = name || `input-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={isRequired}
        className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        {...rest}
      />
    </div>
  );
};

export default Inputbox;
