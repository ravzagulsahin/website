 "use client";
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className = "", ...rest }: InputProps) {
  return (
    <label className="block text-sm text-zinc-700">
      {label && <span className="block mb-1 font-medium">{label}</span>}
      <input
        className={`w-full px-3 py-2 border rounded-md bg-white text-sm text-zinc-900 focus:ring-2 focus:ring-accent/40 outline-none ${className}`}
        {...rest}
      />
    </label>
  );
}

