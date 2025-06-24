import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import { supabase } from '../lib/supabaseClient';

// A single editable text row with a delete button
const EditableTextRow = ({ value, onChange, onVisibilityChange, placeholder, className, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center group">
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => onChange(e.currentTarget.textContent)}
        className={`w-full outline-none focus:bg-gray-100 p-1 rounded ${className}`}
        dangerouslySetInnerHTML={{ __html: value || '' }}
      />
      <button 
        onClick={onVisibilityChange}
        className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        &times;
      </button>
    </div>
  );
};

// Template-specific content components
const TextContent = ({ item, onUpdate }) => {
  const handleUpdate = useCallback((field, value) => {
    onUpdate({ [field]: value });
  }, [onUpdate]);

  return (
    <div className="p-4 h-full flex flex-col justify-center">
      <EditableTextRow
        value={item.title_text}
        onChange={text => handleUpdate('title_text', text)}
        onVisibilityChange={() => handleUpdate('is_title_visible', false)}
        placeholder="Big Title"
        className="text-2xl font-bold"
        isVisible={item.is_title_visible}
      />
      <EditableTextRow
        value={item.subtitle_text}
        onChange={text => handleUpdate('subtitle_text', text)}
        onVisibilityChange={() => handleUpdate('is_subtitle_visible', false)}
        placeholder="Small Description"
        className="text-md text-gray-600"
        isVisible={item.is_subtitle_visible}
      />
      <EditableTextRow
        value={item.body_text}
        onChange={text => handleUpdate('body_text', text)}
        onVisibilityChange={() => handleUpdate('is_body_visible', false)}
        placeholder="Word processing added..."
        className="text-base mt-4"
        isVisible={item.is_body_visible}
      />
    </div>
  );
};

const ImageContent = ({ item, onUpdate, onImageSelect, isUploading }) => (
  <div 
    className="w-full h-full flex justify-center items-center bg-gray-100 cursor-pointer"
    onClick={!item.image_url && !isUploading ? onImageSelect : undefined}
  >
    {item.image_url ? (
      <img src={item.image_url} alt="Project asset" className="w-full h-full object-cover" />
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
);

const TextAndImageContent = ({ item, onUpdate, onImageSelect, isUploading }) => (
  <div className="relative w-full h-full">
    <ImageContent item={item} onUpdate={onUpdate} onImageSelect={onImageSelect} isUploading={isUploading} />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent pointer-events-none">
      <div className="p-4 h-full flex flex-col justify-end text-white">
        <EditableTextRow
          value={item.title_text}
          onChange={text => onUpdate({ title_text: text })}
          onVisibilityChange={() => onUpdate({ is_title_visible: false })}
          placeholder="Big Title"
          className="text-2xl font-bold !text-white pointer-events-auto"
          isVisible={item.is_title_visible}
        />
        <EditableTextRow
          value={item.subtitle_text}
          onChange={text => onUpdate({ subtitle_text: text })}
          onVisibilityChange={() => onUpdate({ is_subtitle_visible: false })}
          placeholder="Small Description"
          className="text-md !text-white pointer-events-auto"
          isVisible={item.is_subtitle_visible}
        />
        <EditableTextRow
          value={item.body_text}
          onChange={text => onUpdate({ body_text: text })}
          onVisibilityChange={() => onUpdate({ is_body_visible: false })}
          placeholder="Word processing added..."
          className="text-base mt-4 !text-white pointer-events-auto"
          isVisible={item.is_body_visible}
        />
      </div>
    </div>
  </div>
);

// A single grid item component
const GridItem = ({ item, selected, onSelect, onShowMenu, onUpdate, projectId }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${projectId}/${item.grid_item_id}-${Date.now()}.${fileExt}`;

      // Upload the file
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

      // Get the public URL - this is a synchronous call
      const { data: urlData } = supabase.storage
        .from('project_images')
        .getPublicUrl(filePath);
        
      if (!urlData?.publicUrl) {
        console.error('Error getting public URL for uploaded image');
        return;
      }

      // Update the grid item with the new image URL
      onUpdate(item.grid_item_id, { image_url: urlData.publicUrl });
    } catch (error) {
      console.error('Error in image upload process:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const renderContent = () => {
    const onUpdateItem = (update) => onUpdate(item.grid_item_id, update);
    const onImageSelect = () => document.getElementById(`file-input-${item.grid_item_id}`).click();

    switch (item.template_type) {
      case 'text':
        return <TextContent item={item} onUpdate={onUpdateItem} />;
      case 'image':
        return <ImageContent item={item} onUpdate={onUpdateItem} onImageSelect={onImageSelect} isUploading={isUploading} />;
      case 'textAndImage':
        return <TextAndImageContent item={item} onUpdate={onUpdateItem} onImageSelect={onImageSelect} isUploading={isUploading} />;
      default:
        return (
          <div className="w-full h-full flex justify-center items-center">
            <span className="text-sm text-gray-400">Right-click to select a template</span>
          </div>
        );
    }
  };

  return (
    <div
      className={`bg-base-200 relative cursor-pointer
                  transition-all duration-300 overflow-hidden
                  ${selected ? 'border-2 border-blue-500 shadow-lg' : 'border border-transparent'}`}
      style={{
        gridColumn: `span ${item.colSpan}`,
        gridRow: `span ${item.rowSpan}`,
        minHeight: '200px',
      }}
      onClick={() => onSelect(item.grid_item_id)}
      onContextMenu={(e) => { e.preventDefault(); onShowMenu(e, item.grid_item_id); }}
    >
      {renderContent()}
      <input type="file" id={`file-input-${item.grid_item_id}`} className="hidden" onChange={handleImageUpload} accept="image/*" />
    </div>
  );
};

// Generate initial grid state
const generateInitialItems = (rows, cols) => {
  return Array.from({ length: rows * cols }, (_, i) => ({
    grid_item_id: i + 1,
    row_num: Math.floor(i / cols) + 1,
    col_num: (i % cols) + 1,
    row_span: 1,
    col_span: 1,
    is_hidden: false,
    title_text: '',
    subtitle_text: '',
    body_text: '',
    is_title_visible: true,
    is_subtitle_visible: true,
    is_body_visible: true,
    template_type: null,
    image_url: null,
    text_pos_x: 0,
    text_pos_y: 0,
    text_size_w: '100%',
    text_size_h: '200px',
    image_pos_x: 0,
    image_pos_y: 0,
    image_size_w: '100%',
    image_size_h: '200px',
    project_id: null,
    section_id_text: null
  }));
};

// The main template selection component
const StepTemplate = () => {
  const { projectId, sectionId } = useParams();
  const [rows, setRows] = useState(2);
  const [gridItems, setGridItems] = useState(() => generateInitialItems(2, 4));
  const [selectedGrids, setSelectedGrids] = useState(new Set());
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0, gridId: null });
  const [projectName, setProjectName] = useState('');

  // Handle grid selection
  const handleSelect = (id) => {
    setSelectedGrids(prev => {
      const newSelection = new Set(prev);
      newSelection.has(id) ? newSelection.delete(id) : newSelection.add(id);
      return newSelection;
    });
    setMenu({ visible: false });
  };

  const handleShowMenu = (e, id) => {
    if (!selectedGrids.has(id)) {
      setSelectedGrids(new Set([id]));
    }
    setMenu({ visible: true, x: e.clientX, y: e.clientY, gridId: id });
  };
  
  const handleCloseMenu = () => setMenu({ visible: false });

  const handleMerge = async () => {
    if (selectedGrids.size < 2) return;

    const selectedItems = gridItems.filter(item => selectedGrids.has(item.grid_item_id));
    
    const minRow = Math.min(...selectedItems.map(item => item.row));
    const maxRow = Math.max(...selectedItems.map(item => item.row + item.rowSpan - 1));
    const minCol = Math.min(...selectedItems.map(item => item.col));
    const maxCol = Math.max(...selectedItems.map(item => item.col + item.colSpan - 1));

    const newRowSpan = maxRow - minRow + 1;
    const newColSpan = maxCol - minCol + 1;

    const topLeftItem = selectedItems.find(item => item.row === minRow && item.col === minCol);
    if (!topLeftItem) return;

    const itemsToUpdate = [];
    const itemsToHideIds = [];
    
    // Prepare updates
    itemsToUpdate.push({ 
      ...topLeftItem, 
      row_span: newRowSpan, 
      col_span: newColSpan,
      body_text: 'Merged Cell' // Default text
    });

    selectedItems.forEach(item => {
      if (item.grid_item_id !== topLeftItem.grid_item_id) {
        itemsToHideIds.push(item.grid_item_id);
      }
    });

    // Perform DB operations
    try {
      const { error: updateError } = await supabase
        .from('grid_items')
        .update({ row_span: newRowSpan, col_span: newColSpan, body_text: 'Merged Cell' })
        .eq('grid_item_id', topLeftItem.grid_item_id);

      if (updateError) throw updateError;

      if (itemsToHideIds.length > 0) {
        const { error: hideError } = await supabase
          .from('grid_items')
          .update({ is_hidden: true })
          .in('grid_item_id', itemsToHideIds);

        if (hideError) throw hideError;
      }
      
      // Update local state on success
      setGridItems(prevItems => {
        return prevItems.map(item => {
          if (item.grid_item_id === topLeftItem.grid_item_id) {
            return { ...item, rowSpan: newRowSpan, colSpan: newColSpan, body_text: 'Merged Cell' };
          }
          if (itemsToHideIds.includes(item.grid_item_id)) {
            return { ...item, hidden: true };
          }
          return item;
        });
      });

      setSelectedGrids(new Set());

    } catch (error) {
      console.error("Error merging items:", error);
    }
  };

  const handleResetGrids = () => {
    const updates = [];
    selectedGrids.forEach(gridId => {
      updates.push({
        id: gridId,
        updates: {
          template_type: null,
          title_text: '',
          subtitle_text: '',
          body_text: '',
          is_title_visible: true,
          is_subtitle_visible: true,
          is_body_visible: true,
          image_url: null,
        }
      });
    });
    batchUpdateAndSave(updates);
    setMenu({ visible: false });
    setSelectedGrids(new Set());
  };

  const handleTemplateSelect = (template_type) => {
    const updates = [];
    selectedGrids.forEach(gridId => {
      updates.push({
        id: gridId,
        updates: {
          template_type,
          content: template_type === 'text' ? '' : null,
          image_url: null, // Reset image url on template change
        }
      });
    });
    batchUpdateAndSave(updates);
    setMenu({ visible: false });
    setSelectedGrids(new Set()); // Deselect after action
  };

  const handleAddRow = async () => {
    const newRowsCount = rows + 1;
    const maxId = gridItems.reduce((max, item) => Math.max(max, item.grid_item_id), 0);

    const newItems = Array.from({ length: 4 }, (_, i) => ({
      grid_item_id: maxId + i + 1,
      row_num: newRowsCount,
      col_num: i + 1,
      row_span: 1,
      col_span: 1,
      is_hidden: false,
      title_text: '',
      subtitle_text: '',
      body_text: '',
      is_title_visible: true,
      is_subtitle_visible: true,
      is_body_visible: true,
      template_type: null,
      image_url: null,
      text_pos_x: 0,
      text_pos_y: 0,
      text_size_w: '100%',
      text_size_h: '200px',
      image_pos_x: 0,
      image_pos_y: 0,
      image_size_w: '100%',
      image_size_h: '200px',
      project_id: projectId,
      section_id_text: sectionId,
    }));

    const { error } = await supabase.from('grid_items').insert(newItems);

    if (error) {
      console.error("Error adding new row:", error);
      return;
    }

    setGridItems(prevItems => [...prevItems, ...newItems.map(item => ({...item, row: item.row_num, col: item.col_num, rowSpan: item.row_span, colSpan: item.col_span, hidden: item.is_hidden}))]);
    setRows(newRowsCount);
  };

  const handleRemoveRow = async () => {
    if (rows <= 1) return;

    const itemIdsToDelete = gridItems
      .filter(item => item.row === rows)
      .map(item => item.grid_item_id);

    if (itemIdsToDelete.length > 0) {
      const { error } = await supabase
        .from('grid_items')
        .delete()
        .in('grid_item_id', itemIdsToDelete);

      if (error) {
        console.error("Error removing row:", error);
        return;
      }
    }

    setGridItems(prevItems => prevItems.filter(item => item.row < rows));
    setRows(rows - 1);
  };

  // --- Data Fetching and Saving ---
  useEffect(() => {
    const fetchProjectName = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();
      
      if (error) {
        console.error("Error fetching project name:", error);
      } else if (data) {
        setProjectName(data.name);
      }
    };

    fetchProjectName();

    const fetchGridItems = async () => {
      const { data, error } = await supabase
        .from('grid_items')
        .select('*')
        .eq('project_id', projectId)
        .eq('section_id_text', sectionId)
        .order('grid_item_id', { ascending: true });
      
      if (error) {
        console.error("Error fetching grid items:", error);
        return;
      }

      if (data && data.length > 0) {
        // Map database column names to component props
        const mappedData = data.map(item => ({
          ...item,
          id: item.grid_item_id,
          row: item.row_num,
          col: item.col_num,
          rowSpan: item.row_span,
          colSpan: item.col_span,
          hidden: item.is_hidden,
          title_text: item.title_text,
          subtitle_text: item.subtitle_text,
          body_text: item.body_text,
          is_title_visible: item.is_title_visible,
          is_subtitle_visible: item.is_subtitle_visible,
          is_body_visible: item.is_body_visible
        }));
        setGridItems(mappedData);
        const maxRows = Math.max(...mappedData.map(i => i.row));
        setRows(maxRows);
      } else {
        const initialItems = generateInitialItems(2, 4).map(item => ({
          ...item,
          project_id: projectId,
          section_id_text: sectionId,
        }));
        
        const { error: upsertError } = await supabase
          .from('grid_items')
          .upsert(initialItems.map(item => ({
            grid_item_id: item.grid_item_id,
            row_num: item.row_num,
            col_num: item.col_num,
            row_span: item.row_span,
            col_span: item.col_span,
            is_hidden: item.is_hidden,
            title_text: item.title_text,
            subtitle_text: item.subtitle_text,
            body_text: item.body_text,
            is_title_visible: item.is_title_visible,
            is_subtitle_visible: item.is_subtitle_visible,
            is_body_visible: item.is_body_visible,
            template_type: item.template_type,
            image_url: item.image_url,
            text_pos_x: item.text_pos_x,
            text_pos_y: item.text_pos_y,
            text_size_w: item.text_size_w,
            text_size_h: item.text_size_h,
            image_pos_x: item.image_pos_x,
            image_pos_y: item.image_pos_y,
            image_size_w: item.image_size_w,
            image_size_h: item.image_size_h,
            project_id: item.project_id,
            section_id_text: item.section_id_text
          })), {
            onConflict: 'project_id,section_id_text,grid_item_id'
          });
          
        if (upsertError) {
          console.error("Error upserting initial items:", upsertError);
          return;
        }
        
        setGridItems(initialItems);
      }
    };
    fetchGridItems();
  }, [projectId, sectionId]);

  const updateAndSaveItem = async (itemId, updates) => {
    // Map component props to database column names
    const dbUpdates = {};
    if ('template_type' in updates) dbUpdates.template_type = updates.template_type;
    if ('image_url' in updates) dbUpdates.image_url = updates.image_url;
    // text fields
    if ('title_text' in updates) dbUpdates.title_text = updates.title_text;
    if ('subtitle_text' in updates) dbUpdates.subtitle_text = updates.subtitle_text;
    if ('body_text' in updates) dbUpdates.body_text = updates.body_text;
    if ('is_title_visible' in updates) dbUpdates.is_title_visible = updates.is_title_visible;
    if ('is_subtitle_visible' in updates) dbUpdates.is_subtitle_visible = updates.is_subtitle_visible;
    if ('is_body_visible' in updates) dbUpdates.is_body_visible = updates.is_body_visible;
    // positioning
    if ('text_pos_x' in updates) dbUpdates.text_pos_x = updates.text_pos_x;
    if ('text_pos_y' in updates) dbUpdates.text_pos_y = updates.text_pos_y;
    if ('text_size_w' in updates) dbUpdates.text_size_w = updates.text_size_w;
    if ('text_size_h' in updates) dbUpdates.text_size_h = updates.text_size_h;
    if ('image_pos_x' in updates) dbUpdates.image_pos_x = updates.image_pos_x;
    if ('image_pos_y' in updates) dbUpdates.image_pos_y = updates.image_pos_y;
    if ('image_size_w' in updates) dbUpdates.image_size_w = updates.image_size_w;
    if ('image_size_h' in updates) dbUpdates.image_size_h = updates.image_size_h;

    const { error } = await supabase
      .from('grid_items')
      .update(dbUpdates)
      .eq('grid_item_id', itemId);

    if (error) {
      console.error("Error updating item:", error);
      return;
    }

    setGridItems(prev => prev.map(item => 
      item.grid_item_id === itemId ? { ...item, ...updates } : item
    ));
  };
  
  const batchUpdateAndSave = async (updates) => {
    for (const { id, updates: itemUpdates } of updates) {
      // Map component props to database column names
      const dbUpdates = {};
      if ('template_type' in itemUpdates) dbUpdates.template_type = itemUpdates.template_type;
      if ('image_url' in itemUpdates) dbUpdates.image_url = itemUpdates.image_url;
      if ('title_text' in itemUpdates) dbUpdates.title_text = itemUpdates.title_text;

      const { error } = await supabase
        .from('grid_items')
        .update(dbUpdates)
        .eq('grid_item_id', id);

      if (error) {
        console.error(`Error updating item ${id}:`, error);
        continue;
      }

      setGridItems(prev => prev.map(item => 
        item.grid_item_id === id ? { ...item, ...itemUpdates } : item
      ));
    }
  };

  return (
    <div className="p-4 h-full" onClick={handleCloseMenu}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {projectName && <span className="text-gray-500">{projectName} / </span>}
          Step: {sectionId} - Select Template
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              className="btn btn-sm btn-outline" 
              onClick={handleRemoveRow}
              disabled={rows <= 1}
            >
              - Row
            </button>
            <span className="px-2">{rows} rows</span>
            <button 
              className="btn btn-sm btn-outline" 
              onClick={handleAddRow}
            >
              + Row
            </button>
          </div>
          {selectedGrids.size > 1 && (
            <button className="btn btn-primary" onClick={handleMerge}>
              Merge {selectedGrids.size} Items
            </button>
          )}
        </div>
      </div>

      <div
        className="grid grid-cols-4"
        style={{ gap: '10px 5px' }}
      >
        {gridItems.map(item =>
          !item.hidden ? (
            <GridItem
              key={item.grid_item_id}
              item={item}
              selected={selectedGrids.has(item.grid_item_id)}
              onSelect={handleSelect}
              onShowMenu={handleShowMenu}
              onUpdate={updateAndSaveItem}
              projectId={projectId}
            />
          ) : null
        )}
      </div>

      {menu.visible && (
        <ul className="menu bg-base-100 w-56 rounded-box absolute shadow-lg z-50" style={{ top: menu.y, left: menu.x }}>
          <li className="menu-title"><span>Template for Grid {menu.gridId}</span></li>
          <li><a onClick={() => handleTemplateSelect('text')}>1. Text</a></li>
          <li><a onClick={() => handleTemplateSelect('textAndImage')}>2. Text and Image</a></li>
          <li><a onClick={() => handleTemplateSelect('image')}>3. Image only</a></li>
          <div className="divider my-0"></div>
          <li><a onClick={handleResetGrids} className="text-error">Reset Item(s)</a></li>
        </ul>
      )}
    </div>
  );
};

export default StepTemplate; 