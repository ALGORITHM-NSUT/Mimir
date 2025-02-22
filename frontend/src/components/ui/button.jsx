import * as React from "react";
import { cn } from "../../lib/utils";

export const Button = ({ children, variant = "default", onClick }) => {
  const baseStyles = "px-4 py-2 rounded-lg transition-all";
  const variants = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button onClick={onClick} className={cn(baseStyles, variants[variant])}>
      {children}
    </button>
  );
};
