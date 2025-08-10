import React, { useState } from 'react';

const EditableTextRow = ({ value, onChange, onVisibilityChange, placeholder, className, isVisible, fontSize, fontFamily, onFontSizeChange, textType, onTextFocus, bold, italic, underline }) => {
  const [isEditing, setIsEditing] = useState(false);
  const isEmpty = !value || value.trim() === '';
  const displayValue = isEmpty && !isEditing ? placeholder : value;

  const handleTextClick = (e) => {
    e.stopPropagation();
    // Allow editing regardless of whether text is empty or not
    setIsEditing(true);
  };

  const handleFocus = () => {
    setIsEditing(true);
    onTextFocus(textType);
  };

  const handleBlur = (e) => {
    setIsEditing(false);
    if (typeof onChange === 'function') {
      const val = e.currentTarget.textContent;
      if (typeof val === 'string') {
        onChange(val);
      }
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (typeof onVisibilityChange === 'function') {
      onVisibilityChange(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="relative group flex items-center">
      <div
        contentEditable
        suppressContentEditableWarning
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleTextClick}
        onMouseDown={handleTextClick}
        className={`flex-1 outline-none focus:bg-gray-100 p-1 rounded ${className} ${isEmpty && !isEditing ? 'text-gray-400 italic' : ''} ${fontFamily === 'crimson pro' ? 'font-crimson-pro' : 'font-gothic-a1'}`}
        style={{ 
          fontSize: `${fontSize}px`,
          filter: isEmpty && !isEditing ? 'blur(0.5px)' : 'none',
          opacity: isEmpty && !isEditing ? 0.7 : 1,
          fontWeight: bold ? 'bold' : 'normal',
          fontStyle: italic ? 'italic' : 'normal',
          textDecoration: underline ? 'underline' : 'none',
        }}
        dangerouslySetInnerHTML={{ __html: displayValue || '' }}
        data-placeholder={placeholder}
      />
      <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-8">
        <button 
          onClick={handleDeleteClick}
          className="text-red-500 text-lg font-bold"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default EditableTextRow; 