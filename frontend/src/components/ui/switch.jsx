import * as React from "react";

export const Switch = ({ checked, onCheckedChange }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 relative">
        <div className={`absolute left-1 top-1 bg-white w-3.5 h-3.5 rounded-full transition-all ${checked ? "translate-x-5" : ""}`} />
      </div>
    </label>
  );
};
