import * as React from "react";
import { cn } from "../../lib/utils";

export const Dialog = ({ open, onOpenChange, children }) => {
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${open ? "block" : "hidden"}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => onOpenChange(false)} />
      {children}
    </div>
  );
};

export const DialogContent = ({ children, className }) => {
  return (
    <div className={cn("bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl z-50", className)}>
      {children}
    </div>
  );
};

export const DialogHeader = ({ children }) => <div className="mb-4">{children}</div>;

export const DialogTitle = ({ children }) => <h2 className="text-lg font-semibold">{children}</h2>;

export const DialogFooter = ({ children }) => <div className="mt-4 flex justify-end gap-2">{children}</div>;
