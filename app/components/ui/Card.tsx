import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-zinc-100 p-4 ${className}`}>{children}</div>;
}

