import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 min-w-[320px] max-w-[90vw] max-h-[90vh] overflow-auto border border-black" style={{ borderRadius: '0' }}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-black hover:text-gray-600 font-bold text-lg"
          style={{ fontFamily: 'Crimson Pro, serif' }}
        >
          ✕
        </button>
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 