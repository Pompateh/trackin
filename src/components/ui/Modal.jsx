import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box relative w-full h-full max-w-none max-h-none m-0 p-0">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 z-50"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal; 