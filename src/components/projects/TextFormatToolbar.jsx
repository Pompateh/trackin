import React from 'react';

const TextFormatToolbar = ({ selectedItems, onUpdate, activeTextType }) => {
  const textItems = selectedItems.filter(item => item.template_type === 'text');
  if (textItems.length === 0) return null;
  const firstItem = textItems[0];
  
  const handleUpdate = (updates) => {
    textItems.forEach(item => {
      onUpdate(item.grid_item_id, updates);
    });
  };

  const fonts = [
    { value: 'gothic a1', label: 'Gothic A1' },
    { value: 'crimson pro', label: 'Crimson Pro' },
  ];

  const positions = [
    { v: 'top', h: 'left', label: 'TL' },
    { v: 'top', h: 'right', label: 'TR' },
    { v: 'bottom', h: 'left', label: 'BL' },
    { v: 'bottom', h: 'right', label: 'BR' },
  ];

  const getCurrentFontSize = () => {
    switch (activeTextType) {
      case 'title': return firstItem.title_font_size;
      case 'subtitle': return firstItem.subtitle_font_size;
      case 'body': return firstItem.body_font_size;
      default: return firstItem.title_font_size;
    }
  };

  const getCurrentFontFamily = () => {
    switch (activeTextType) {
      case 'title': return firstItem.title_font_family;
      case 'subtitle': return firstItem.subtitle_font_family;
      case 'body': return firstItem.body_font_family;
      default: return firstItem.title_font_family;
    }
  };

  const updateFontSize = (newSize) => {
    const update = {};
    switch (activeTextType) {
      case 'title': update.title_font_size = newSize; break;
      case 'subtitle': update.subtitle_font_size = newSize; break;
      case 'body': update.body_font_size = newSize; break;
    }
    handleUpdate(update);
  };

  const updateFontFamily = (newFamily) => {
    const update = {};
    switch (activeTextType) {
      case 'title': update.title_font_family = newFamily; break;
      case 'subtitle': update.subtitle_font_family = newFamily; break;
      case 'body': update.body_font_family = newFamily; break;
    }
    handleUpdate(update);
  };

  const getCurrentBold = () => {
    switch (activeTextType) {
      case 'title': return firstItem.title_bold;
      case 'subtitle': return firstItem.subtitle_bold;
      case 'body': return firstItem.body_bold;
      default: return false;
    }
  };
  
  const getCurrentItalic = () => {
    switch (activeTextType) {
      case 'title': return firstItem.title_italic;
      case 'subtitle': return firstItem.subtitle_italic;
      case 'body': return firstItem.body_italic;
      default: return false;
    }
  };
  
  const getCurrentUnderline = () => {
    switch (activeTextType) {
      case 'title': return firstItem.title_underline;
      case 'subtitle': return firstItem.subtitle_underline;
      case 'body': return firstItem.body_underline;
      default: return false;
    }
  };
  
  const updateBold = (isBold) => {
    const update = {};
    switch (activeTextType) {
      case 'title': update.title_bold = isBold; break;
      case 'subtitle': update.subtitle_bold = isBold; break;
      case 'body': update.body_bold = isBold; break;
    }
    handleUpdate(update);
  };
  
  const updateItalic = (isItalic) => {
    const update = {};
    switch (activeTextType) {
      case 'title': update.title_italic = isItalic; break;
      case 'subtitle': update.subtitle_italic = isItalic; break;
      case 'body': update.body_italic = isItalic; break;
    }
    handleUpdate(update);
  };
  
  const updateUnderline = (isUnderline) => {
    const update = {};
    switch (activeTextType) {
      case 'title': update.title_underline = isUnderline; break;
      case 'subtitle': update.subtitle_underline = isUnderline; break;
      case 'body': update.body_underline = isUnderline; break;
    }
    handleUpdate(update);
  };
  
  const currentFontSize = getCurrentFontSize();
  const currentFontFamily = getCurrentFontFamily();
  const currentBold = getCurrentBold();
  const currentItalic = getCurrentItalic();
  const currentUnderline = getCurrentUnderline();

  const controlStyle = {
    border: '1px solid #000',
    fontFamily: 'Crimson Pro, serif',
    fontWeight: 700,
    borderRadius: 0,
    height: '32px',
    minWidth: '32px',
    background: '#fff',
    fontSize: '15px',
    padding: '0 8px',
    margin: '0 2px',
    boxSizing: 'border-box',
    lineHeight: 1.2
  };

  return (
    <div className="flex items-center gap-2" style={{ minHeight: 0 }}>
      {/* Position controls */}
      <span className="font-semibold" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700, fontSize: '15px' }}>Pos:</span>
      <div className="flex items-center gap-1">
        {positions.map(({ v, h, label }) => (
          <button
            key={`${v}-${h}`}
            title={`Position ${v} ${h}`}
            className={firstItem.text_vertical_align === v && firstItem.text_horizontal_align === h ? 'bg-gray-300' : ''}
            onClick={() => handleUpdate({ text_vertical_align: v, text_horizontal_align: h })}
            style={{ ...controlStyle, background: firstItem.text_vertical_align === v && firstItem.text_horizontal_align === h ? '#e5e7eb' : '#fff' }}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Text type */}
      {activeTextType && (
        <span className="capitalize font-semibold" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700, fontSize: '15px', marginLeft: 8, color: '#000' }}>{activeTextType}:</span>
      )}
      {/* Font size controls */}
      {activeTextType && (
        <div className="flex items-center gap-1">
          <span className="font-semibold" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700, fontSize: '15px' }}>Size:</span>
          <button onClick={() => updateFontSize(Math.max(8, currentFontSize - 2))} style={controlStyle}>-</button>
          <span style={{ ...controlStyle, background: 'transparent', border: 'none', minWidth: '40px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px' }}>{currentFontSize}px</span>
          <button onClick={() => updateFontSize(currentFontSize + 2)} style={controlStyle}>+</button>
        </div>
      )}
      {/* Font family controls */}
      {activeTextType && (
        <div className="flex items-center gap-1">
          <span className="font-semibold" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700, fontSize: '15px' }}>Font:</span>
          <select 
            className="select select-xs select-bordered"
            value={currentFontFamily || 'gothic a1'}
            onChange={(e) => updateFontFamily(e.target.value)}
            style={{ ...controlStyle, minWidth: '110px', fontSize: '15px', height: '32px' }}
          >
            {fonts.map(font => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {/* Text style controls */}
      {activeTextType && (
        <div className="flex items-center gap-1">
          <span className="font-semibold" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700, fontSize: '15px' }}>Style:</span>
          <button 
            onClick={() => updateBold(!currentBold)}
            className={`${currentBold ? 'bg-gray-300' : ''}`}
            style={{ ...controlStyle, minWidth: '32px' }}
          >
            B
          </button>
          <button 
            onClick={() => updateItalic(!currentItalic)}
            className={`${currentItalic ? 'bg-gray-300' : ''}`}
            style={{ ...controlStyle, minWidth: '32px' }}
          >
            I
          </button>
          <button 
            onClick={() => updateUnderline(!currentUnderline)}
            className={`${currentUnderline ? 'bg-gray-300' : ''}`}
            style={{ ...controlStyle, minWidth: '32px' }}
          >
            U
          </button>
        </div>
      )}
      {/* Click to edit message */}
      {!activeTextType && (
        <span className="text-gray-500 italic" style={{ fontFamily: 'Crimson Pro, serif', fontSize: '15px' }}>Click text to edit</span>
      )}
    </div>
  );
};

export default TextFormatToolbar; 