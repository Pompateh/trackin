import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import EditableTextRow from './EditableTextRow';
import TextFormatToolbar from './TextFormatToolbar';

const BriefEditor = ({ projectId, isVisible, onToggle, onBriefUpdate, initialBriefData }) => {
  const [briefData, setBriefData] = useState({
    title_text: '',
    subtitle_text: '',
    body_text: '',
    is_title_visible: true,
    is_subtitle_visible: true,
    is_body_visible: true,
    title_font_size: 24,
    subtitle_font_size: 16,
    body_font_size: 14,
    title_font_family: 'gothic a1',
    subtitle_font_family: 'gothic a1',
    body_font_family: 'gothic a1',
    title_bold: false,
    title_italic: false,
    title_underline: false,
    subtitle_bold: false,
    subtitle_italic: false,
    subtitle_underline: false,
    body_bold: false,
    body_italic: false,
    body_underline: false,
    text_vertical_align: 'top',
    text_horizontal_align: 'left',
    image_url: '',
    image_position_x: 0,
    image_position_y: 0,
    image_scale: 1.0,
    // Grid layout support
    layout_type: 'grid',
    text_grid_col: 1,
    text_grid_col_span: 4,
    text_grid_row: 1,
    text_grid_row_span: 1,
    image_grid_col: 5,
    image_grid_col_span: 4,
    image_grid_row: 1,
    image_grid_row_span: 1,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTextType, setActiveTextType] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Image handling state (similar to StepTemplate)
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isVisible && initialBriefData) {
      console.log('BriefEditor - Using initial data:', initialBriefData);
      setBriefData(initialBriefData);
      // Update local image state when data is fetched
      setOffset({ x: initialBriefData.image_position_x || 0, y: initialBriefData.image_position_y || 0 });
      setScale(initialBriefData.image_scale || 1);
    }
  }, [isVisible, initialBriefData]);

  // Update local image state when briefData changes (but not on initial load)
  useEffect(() => {
    if (briefData.image_url) {
      setOffset({ x: briefData.image_position_x || 0, y: briefData.image_position_y || 0 });
      setScale(briefData.image_scale || 1);
    }
  }, [briefData.image_position_x, briefData.image_position_y, briefData.image_scale, briefData.image_url]);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
  }, [containerRef.current, briefData.image_url]);

  const fetchBriefData = async () => {
    if (!projectId) return;
    
    const { data, error } = await supabase
      .from('brief_data')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching brief data:', error);
      return;
    }

    if (data) {
      console.log('Fetched brief data:', data);
      setBriefData(data);
      // Update local image state when data is fetched
      setOffset({ x: data.image_position_x || 0, y: data.image_position_y || 0 });
      setScale(data.image_scale || 1);
    }
  };

  const saveBriefData = async (updates = {}) => {
    if (!projectId) return;

    const updatedData = { ...briefData, ...updates };
    console.log('Saving brief data:', updatedData);
    setBriefData(updatedData);

    const { error } = await supabase
      .from('brief_data')
      .upsert({
        project_id: projectId,
        ...updatedData,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving brief data:', error);
    } else {
      console.log('Brief data saved successfully');
      onBriefUpdate?.(updatedData);
    }
  };

  const handleUpdate = (field, value) => {
    saveBriefData({ [field]: value });
  };

  const handleTextFocus = (textType) => {
    setActiveTextType(textType);
  };

  // Image handling functions (similar to StepTemplate ImageContent)
  const handleImgLoad = () => {
    if (imgRef.current) {
      setImgSize({ width: imgRef.current.naturalWidth, height: imgRef.current.naturalHeight });
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
  };

  const clampOffset = (x, y, scaleVal = scale) => {
    const scaledWidth = imgSize.width * scaleVal;
    const scaledHeight = imgSize.height * scaleVal;
    let minX = Math.min(0, containerSize.width - scaledWidth);
    let minY = Math.min(0, containerSize.height - scaledHeight);
    let maxX = 0;
    let maxY = 0;
    if (scaledWidth < containerSize.width) {
      minX = maxX = (containerSize.width - scaledWidth) / 2;
    }
    if (scaledHeight < containerSize.height) {
      minY = maxY = (containerSize.height - scaledHeight) / 2;
    }
    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY)),
    };
  };

  const handleMouseDown = (e) => {
    if (isUploading) return;
    setDragging(true);
    setStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    setOffset(prev => {
      const next = { x: prev.x + dx, y: prev.y + dy };
      return clampOffset(next.x, next.y);
    });
    setStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (!dragging) return;
    setDragging(false);
    const clamped = clampOffset(offset.x, offset.y);
    setOffset(clamped);
    saveBriefData({
      image_position_x: clamped.x,
      image_position_y: clamped.y,
      image_scale: scale
    });
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (!briefData.image_url && !isUploading) {
      document.getElementById('brief-image-input').click();
    }
  };

  const handleScaleChange = (e) => {
    const newScale = parseFloat(e.target.value);
    setScale(newScale);
    const clamped = clampOffset(offset.x, offset.y, newScale);
    setOffset(clamped);
    saveBriefData({
      image_scale: newScale,
      image_position_x: clamped.x,
      image_position_y: clamped.y,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${projectId}/brief-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('project_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('project_images')
        .getPublicUrl(filePath);
        
      if (!urlData?.publicUrl) {
        console.error('Error getting public URL');
        return;
      }

      console.log('Image uploaded successfully, URL:', urlData.publicUrl);
      saveBriefData({ image_url: urlData.publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    saveBriefData({ 
      image_url: '',
      image_position_x: 0,
      image_position_y: 0,
      image_scale: 1.0
    });
    setOffset({ x: 0, y: 0 });
    setScale(1);
  };

  return (
    <div className="bg-white border-t border-b border-black p-6 mb-4 w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
          Brief Editor
        </h2>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700 text-lg p-2"
          style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}
        >
          ×
        </button>
      </div>

      {/* Text Formatting Toolbar */}
      {isEditing && (
        <div className="mb-4 p-3 border border-gray-300 bg-gray-50 text-sm">
          <TextFormatToolbar
            selectedItems={[{ template_type: 'text', ...briefData }]}
            onUpdate={(id, updates) => saveBriefData(updates)}
            activeTextType={activeTextType}
          />
        </div>
      )}

      {/* Grid Layout - 8 columns total */}
      <div className="grid grid-cols-8 gap-4 flex-1">
        {/* Text Content - 4 columns */}
        <div 
          className="col-span-4 border border-gray-200 p-4"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: briefData.text_vertical_align === 'top' ? 'flex-start' :
                           briefData.text_vertical_align === 'center' ? 'center' : 'flex-end',
            alignItems: briefData.text_horizontal_align === 'left' ? 'flex-start' :
                       briefData.text_horizontal_align === 'center' ? 'center' : 'flex-end',
            textAlign: briefData.text_horizontal_align === 'left' ? 'left' :
                      briefData.text_horizontal_align === 'center' ? 'center' : 'right',
          }}
        >
          <h3 className="text-lg font-bold mb-3" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
            Text Content
          </h3>
          
          <EditableTextRow
            value={briefData.title_text}
            onChange={(value) => handleUpdate('title_text', value)}
            onVisibilityChange={(isVisible) => handleUpdate('is_title_visible', isVisible)}
            placeholder="Enter title..."
            className="text-2xl font-bold mb-2"
            isVisible={briefData.is_title_visible}
            fontSize={briefData.title_font_size}
            fontFamily={briefData.title_font_family}
            onFontSizeChange={(size) => handleUpdate('title_font_size', size)}
            textType="title"
            onTextFocus={handleTextFocus}
            bold={briefData.title_bold}
            italic={briefData.title_italic}
            underline={briefData.title_underline}
          />

          <EditableTextRow
            value={briefData.subtitle_text}
            onChange={(value) => handleUpdate('subtitle_text', value)}
            onVisibilityChange={(isVisible) => handleUpdate('is_subtitle_visible', isVisible)}
            placeholder="Enter subtitle..."
            className="text-lg text-gray-600 mb-2"
            isVisible={briefData.is_subtitle_visible}
            fontSize={briefData.subtitle_font_size}
            fontFamily={briefData.subtitle_font_family}
            onFontSizeChange={(size) => handleUpdate('subtitle_font_size', size)}
            textType="subtitle"
            onTextFocus={handleTextFocus}
            bold={briefData.subtitle_bold}
            italic={briefData.subtitle_italic}
            underline={briefData.subtitle_underline}
          />

          <EditableTextRow
            value={briefData.body_text}
            onChange={(value) => handleUpdate('body_text', value)}
            onVisibilityChange={(isVisible) => handleUpdate('is_body_visible', isVisible)}
            placeholder="Enter body text..."
            className="text-base"
            isVisible={briefData.is_body_visible}
            fontSize={briefData.body_font_size}
            fontFamily={briefData.body_font_family}
            onFontSizeChange={(size) => handleUpdate('body_font_size', size)}
            textType="body"
            onTextFocus={handleTextFocus}
            bold={briefData.body_bold}
            italic={briefData.body_italic}
            underline={briefData.body_underline}
          />
        </div>

        {/* Image Content - 4 columns */}
        <div className="col-span-4 border border-gray-200 p-4">
          
          <div
            ref={containerRef}
            className="w-full h-64 flex justify-center items-center bg-gray-100 cursor-pointer border border-gray-300"
            onClick={handleImageClick}
            onMouseDown={briefData.image_url ? handleMouseDown : undefined}
            onMouseMove={dragging ? handleMouseMove : undefined}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ 
              cursor: briefData.image_url ? (dragging ? 'grabbing' : 'grab') : 'pointer', 
              overflow: 'hidden', 
              width: '100%', 
              height: '100%', 
              position: 'relative' 
            }}
          >
            {briefData.image_url ? (
              <>
                <img
                  ref={imgRef}
                  src={briefData.image_url}
                  alt="Brief image"
                  onLoad={handleImgLoad}
                  style={{
                    position: 'absolute',
                    left: offset.x,
                    top: offset.y,
                    userSelect: 'none',
                    pointerEvents: 'none',
                    transition: dragging ? 'none' : 'left 0.2s, top 0.2s, transform 0.2s',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                  draggable={false}
                />
                <input
                  type="range"
                  min="0.2"
                  max="2"
                  step="0.01"
                  value={scale}
                  onChange={handleScaleChange}
                  onMouseDown={e => e.stopPropagation()}
                  style={{ position: 'absolute', bottom: 8, left: 8, width: '60%', zIndex: 10 }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                >
                  ×
                </button>
              </>
            ) : (
              <div className="text-center text-gray-500">
                {isUploading ? (
                  <>
                    <span className="loading loading-spinner loading-md"></span>
                    <p>Uploading...</p>
                  </>
                ) : (
                  <div>
                    <p>Select Image</p>
                    <p className="text-xs">(Click to upload)</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Hidden file input */}
          <input
            id="brief-image-input"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Edit Toggle Button */}
      <div className="mt-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="border border-black text-black font-bold text-base py-2 px-4 bg-white hover:bg-gray-50"
          style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700, borderRadius: 0 }}
        >
          {isEditing ? 'Done Editing' : 'Edit Brief'}
        </button>
      </div>
    </div>
  );
};

export default BriefEditor; 