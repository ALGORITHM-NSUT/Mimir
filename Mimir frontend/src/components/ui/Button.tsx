import React from "react";

interface ButtonProps {
  handleButtonClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ handleButtonClick, disabled, children }) => {
  return (
    <button
      type="submit"
      onClick={handleButtonClick}
      disabled={disabled}
      className={`p-2 h-4/5 mt-auto mb-auto bg-blue-500 text-white rounded-lg ${disabled ? 'bg-gray-500 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};
