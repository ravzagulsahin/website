 "use client";
import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-lg max-w-xl w-full p-6 z-10">
        {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
        <div>{children}</div>
      </div>
    </div>
  );
}

