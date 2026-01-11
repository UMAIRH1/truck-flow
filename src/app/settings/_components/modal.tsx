"use client";

import * as React from "react";
import { CreditCard, X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  const paymentContent = (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-red-500 text-white rounded-xl">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5" />
          <div>
            <p className="font-medium">Bank Account</p>
            <p className="text-xs opacity-80">Link your bank</p>
          </div>
        </div>
        <button className="px-4 py-1.5 bg-yellow-400 text-black text-sm rounded-full font-medium">Add Account</button>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-100 rounded-xl">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5" />
          <div>
            <p className="font-medium">Credit/ Debit Card</p>
            <p className="text-xs text-gray-500">Add your card details</p>
          </div>
        </div>
        <button className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-full font-medium">Add Card</button>
      </div>

      <p className="text-center text-sm text-gray-400 mt-4">Your transactions are secure</p>

      <div className="mt-4 md:hidden">
        <button onClick={onClose} className="w-full py-2 rounded-md border text-gray-700">
          Close
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white rounded-t-2xl p-4 shadow-lg transform transition-transform duration-300">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3" />
          {title && <h2 className="text-lg font-semibold mb-4 text-center">{title}</h2>}
          <div>{title === "Payment Methods" ? paymentContent : children}</div>
        </div>
      </div>

      <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
        <div className="relative bg-white rounded-2xl p-6 shadow-lg w-3/5 max-w-2xl">
          <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-600" />
          </button>
          {title && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}
          <div>{title === "Payment Methods" ? paymentContent : children}</div>
        </div>
      </div>
    </>
  );
}

export default Modal;
