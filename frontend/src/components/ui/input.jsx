import React from "react";

export const Input = ({ name, placeholder, value, onChange }) => {
  return (
    <input
      name={name}
      placeholder={placeholder}
      value={value} // Controlled component
      onChange={onChange} // Ensure `onChange` is provided
      className="border p-2 rounded"
      style={{ color: "black" }} 
    />
  );
};
