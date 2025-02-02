import React from "react";

interface InputProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ placeholder, value, onChange, handleKeyDown }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      value={value}
      className={`w-3/5 h-4/5 mt-auto mb-auto p-2 rounded-lg mr-4 bg-gray-300`}
    />
  );
};
