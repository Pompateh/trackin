import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import { supabase } from '../lib/supabaseClient';
import ProjectSidebar from '../components/projects/ProjectSidebar';

// A single editable text row with a delete button
const EditableTextRow = ({ value, onChange, onVisibilityChange, placeholder, className, isVisible, fontSize, onFontSizeChange }) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center group">
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => onChange(e.currentTarget.textContent)}
        className={`w-full outline-none focus:bg-gray-100 p-1 rounded ${className}`}
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: value || '' }}
      />
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
        <button onClick={() => onFontSizeChange(fontSize - 1)} className="btn btn-xs btn-ghost">-</button>
        <span className="text-xs w-6 text-center tabular-nums">{fontSize}px</span>
        <button onClick={() => onFontSizeChange(fontSize + 1)} className="btn btn-xs btn-ghost">+</button>
      </div>
      <button 
        onClick={onVisibilityChange}
        className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
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
        fontSize={item.title_font_size}
        onFontSizeChange={size => handleUpdate('title_font_size', size)}
      />
      <EditableTextRow
        value={item.subtitle_text}
        onChange={text => handleUpdate('subtitle_text', text)}
        onVisibilityChange={() => handleUpdate('is_subtitle_visible', false)}
        placeholder="Small Description"
        className="text-md text-gray-600"
        isVisible={item.is_subtitle_visible}
        fontSize={item.subtitle_font_size}
        onFontSizeChange={size => handleUpdate('subtitle_font_size', size)}
      />
      <EditableTextRow
        value={item.body_text}
        onChange={text => handleUpdate('body_text', text)}
        onVisibilityChange={() => handleUpdate('is_body_visible', false)}
        placeholder="Word processing added..."
        className="text-base mt-4"
        isVisible={item.is_body_visible}
        fontSize={item.body_font_size}
        onFontSizeChange={size => handleUpdate('body_font_size', size)}
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
          fontSize={item.title_font_size}
          onFontSizeChange={size => onUpdate({ title_font_size: size })}
        />
        <EditableTextRow
          value={item.subtitle_text}
          onChange={text => onUpdate({ subtitle_text: text })}
          onVisibilityChange={() => onUpdate({ is_subtitle_visible: false })}
          placeholder="Small Description"
          className="text-md !text-white pointer-events-auto"
          isVisible={item.is_subtitle_visible}
          fontSize={item.subtitle_font_size}
          onFontSizeChange={size => onUpdate({ subtitle_font_size: size })}
        />
        <EditableTextRow
          value={item.body_text}
          onChange={text => onUpdate({ body_text: text })}
          onVisibilityChange={() => onUpdate({ is_body_visible: false })}
          placeholder="Word processing added..."
          className="text-base mt-4 !text-white pointer-events-auto"
          isVisible={item.is_body_visible}
          fontSize={item.body_font_size}
          onFontSizeChange={size => onUpdate({ body_font_size: size })}
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

// Generate initial grid state. This is the canonical structure for local state.
const generateInitialItems = (rows, cols) => {
  return Array.from({ length: rows * cols }, (_, i) => ({
    grid_item_id: i + 1,
    row: Math.floor(i / cols) + 1,
    col: (i % cols) + 1,
    rowSpan: 1,
    colSpan: 1,
    hidden: false,
    template_type: null,
    image_url: null,
    title_text: '',
    subtitle_text: '',
    body_text: '',
    is_title_visible: true,
    is_subtitle_visible: true,
    is_body_visible: true,
    title_font_size: 24,
    subtitle_font_size: 16,
    body_font_size: 14,
  }));
};

// Maps a local state grid item to the structure the database expects.
const mapStateToDb = (item, projectId, sectionId) => ({
  project_id: projectId,
  section_id_text: sectionId,
  grid_item_id: item.grid_item_id,
  row_num: item.row,
  col_num: item.col,
  row_span: item.rowSpan,
  col_span: item.colSpan,
  is_hidden: item.hidden,
  template_type: item.template_type,
  image_url: item.image_url,
  title_text: item.title_text,
  subtitle_text: item.subtitle_text,
  body_text: item.body_text,
  is_title_visible: item.is_title_visible,
  is_subtitle_visible: item.is_subtitle_visible,
  is_body_visible: item.is_body_visible,
  title_font_size: item.title_font_size,
  subtitle_font_size: item.subtitle_font_size,
  body_font_size: item.body_font_size,
});

// The main template selection component
const StepTemplate = () => {
  const { projectId, sectionId } = useParams();
  const [rows, setRows] = useState(2);
  const [gridItems, setGridItems] = useState(() => generateInitialItems(2, 4));
  const [selectedGrids, setSelectedGrids] = useState(new Set());
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0, gridId: null });
  const [projectName, setProjectName] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

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

    const itemsToHideIds = selectedItems
      .filter(item => item.grid_item_id !== topLeftItem.grid_item_id)
      .map(item => item.grid_item_id);

    const { error } = await supabase.rpc('merge_grid_items', {
      p_project_id: projectId,
      p_section_id_text: sectionId,
      p_top_left_item_id: topLeftItem.grid_item_id,
      p_new_row_span: newRowSpan,
      p_new_col_span: newColSpan,
      p_item_ids_to_hide: itemsToHideIds,
    });

    if (error) {
      console.error('Error merging items:', JSON.stringify(error, null, 2));
      return;
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
  };

  const handleUnmerge = async () => {
    if (!menu.gridId) return;

    const itemToUnmerge = gridItems.find(item => item.grid_item_id === menu.gridId);
    if (!itemToUnmerge) return;

    const { error } = await supabase.rpc('unmerge_grid_items', {
      p_project_id: projectId,
      p_section_id_text: sectionId,
      p_item_id_to_unmerge: menu.gridId,
    });

    if (error) {
      console.error('Error unmerging items:', JSON.stringify(error, null, 2));
      return;
    }
      
    // Update local state on success
    setGridItems(prevItems => {
      return prevItems.map(item => {
        // Reset the main item
        if (item.grid_item_id === itemToUnmerge.grid_item_id) {
          return { ...item, rowSpan: 1, colSpan: 1, body_text: '' };
        }
        // Unhide items that were part of the merge
        const wasCovered = 
          item.row >= itemToUnmerge.row &&
          item.row < itemToUnmerge.row + itemToUnmerge.rowSpan &&
          item.col >= itemToUnmerge.col &&
          item.col < itemToUnmerge.col + itemToUnmerge.colSpan;
        
        if (wasCovered) {
          return { ...item, hidden: false };
        }
        
        return item;
      });
    });

    setMenu({ visible: false });
    setSelectedGrids(new Set());
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
          title_font_size: 24,
          subtitle_font_size: 16,
          body_font_size: 14,
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
      ...generateInitialItems(1, 1)[0],
      grid_item_id: maxId + i + 1,
      row: newRowsCount,
      col: i + 1,
    }));

    const dbItems = newItems.map(item => mapStateToDb(item, projectId, sectionId));
    const { error } = await supabase.from('grid_items').insert(dbItems);

    if (error) {
      console.error("Error adding new row:", JSON.stringify(error, null, 2));
      return;
    }

    setGridItems(prevItems => [...prevItems, ...newItems]);
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
        console.error("Error removing row:", JSON.stringify(error, null, 2));
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
        console.error("Error fetching project name:", JSON.stringify(error, null, 2));
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
        console.error("Error fetching grid items:", JSON.stringify(error, null, 2));
        return;
      }

      if (data && data.length > 0) {
        const mappedData = data.map(item => ({
          grid_item_id: item.grid_item_id,
          row: item.row_num,
          col: item.col_num,
          rowSpan: item.row_span,
          colSpan: item.col_span,
          hidden: item.is_hidden,
          template_type: item.template_type,
          image_url: item.image_url,
          title_text: item.title_text,
          subtitle_text: item.subtitle_text,
          body_text: item.body_text,
          is_title_visible: item.is_title_visible,
          is_subtitle_visible: item.is_subtitle_visible,
          is_body_visible: item.is_body_visible,
          title_font_size: item.title_font_size || 24,
          subtitle_font_size: item.subtitle_font_size || 16,
          body_font_size: item.body_font_size || 14
        }));
        setGridItems(mappedData);
        const maxRows = Math.max(...mappedData.map(i => i.row));
        setRows(maxRows);
      } else {
        const initialItems = generateInitialItems(2, 4);
        const dbItems = initialItems.map(item => mapStateToDb(item, projectId, sectionId));
        
        const { error: upsertError } = await supabase
          .from('grid_items')
          .upsert(dbItems, {
            onConflict: 'project_id,section_id_text,grid_item_id'
          });
          
        if (upsertError) {
          console.error("Error upserting initial items:", JSON.stringify(upsertError, null, 2));
          return;
        }
        
        setGridItems(initialItems);
      }
    };
    fetchGridItems();
  }, [projectId, sectionId]);

  const updateAndSaveItem = async (itemId, updates) => {
    const dbUpdates = {};
    // This is a bit of a manual mapping for updates, but it's clear.
    if ('template_type' in updates) dbUpdates.template_type = updates.template_type;
    if ('image_url' in updates) dbUpdates.image_url = updates.image_url;
    if ('title_text' in updates) dbUpdates.title_text = updates.title_text;
    if ('subtitle_text' in updates) dbUpdates.subtitle_text = updates.subtitle_text;
    if ('body_text' in updates) dbUpdates.body_text = updates.body_text;
    if ('is_title_visible' in updates) dbUpdates.is_title_visible = updates.is_title_visible;
    if ('is_subtitle_visible' in updates) dbUpdates.is_subtitle_visible = updates.is_subtitle_visible;
    if ('is_body_visible' in updates) dbUpdates.is_body_visible = updates.is_body_visible;
    if ('title_font_size' in updates) dbUpdates.title_font_size = updates.title_font_size;
    if ('subtitle_font_size' in updates) dbUpdates.subtitle_font_size = updates.subtitle_font_size;
    if ('body_font_size' in updates) dbUpdates.body_font_size = updates.body_font_size;
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
      console.error("Error updating item:", JSON.stringify(error, null, 2));
      return;
    }

    setGridItems(prev => prev.map(item => 
      item.grid_item_id === itemId ? { ...item, ...updates } : item
    ));
  };
  
  const batchUpdateAndSave = async (updates) => {
    for (const { id, updates: itemUpdates } of updates) {
      const dbUpdates = {};
      if ('template_type' in itemUpdates) dbUpdates.template_type = itemUpdates.template_type;
      if ('image_url' in itemUpdates) dbUpdates.image_url = itemUpdates.image_url;
      if ('title_text' in itemUpdates) dbUpdates.title_text = itemUpdates.title_text;
      if ('subtitle_text' in itemUpdates) dbUpdates.subtitle_text = itemUpdates.subtitle_text;
      if ('body_text' in itemUpdates) dbUpdates.body_text = itemUpdates.body_text;
      if ('is_title_visible' in itemUpdates) dbUpdates.is_title_visible = itemUpdates.is_title_visible;
      if ('is_subtitle_visible' in itemUpdates) dbUpdates.is_subtitle_visible = itemUpdates.is_subtitle_visible;
      if ('is_body_visible' in itemUpdates) dbUpdates.is_body_visible = itemUpdates.is_body_visible;
      if ('title_font_size' in itemUpdates) dbUpdates.title_font_size = itemUpdates.title_font_size;
      if ('subtitle_font_size' in itemUpdates) dbUpdates.subtitle_font_size = itemUpdates.subtitle_font_size;
      if ('body_font_size' in itemUpdates) dbUpdates.body_font_size = itemUpdates.body_font_size;
      if ('text_pos_x' in itemUpdates) dbUpdates.text_pos_x = itemUpdates.text_pos_x;
      if ('text_pos_y' in itemUpdates) dbUpdates.text_pos_y = itemUpdates.text_pos_y;
      if ('text_size_w' in itemUpdates) dbUpdates.text_size_w = itemUpdates.text_size_w;
      if ('text_size_h' in itemUpdates) dbUpdates.text_size_h = itemUpdates.text_size_h;
      if ('image_pos_x' in itemUpdates) dbUpdates.image_pos_x = itemUpdates.image_pos_x;
      if ('image_pos_y' in itemUpdates) dbUpdates.image_pos_y = itemUpdates.image_pos_y;
      if ('image_size_w' in itemUpdates) dbUpdates.image_size_w = itemUpdates.image_size_w;
      if ('image_size_h' in itemUpdates) dbUpdates.image_size_h = itemUpdates.image_size_h;

      const { error } = await supabase
        .from('grid_items')
        .update(dbUpdates)
        .eq('grid_item_id', id);

      if (error) {
        console.error(`Error updating item ${id}:`, JSON.stringify(error, null, 2));
        continue;
      }

      setGridItems(prev => prev.map(item => 
        item.grid_item_id === id ? { ...item, ...itemUpdates } : item
      ));
    }
  };

  return (
    <div className="flex h-screen">
      <div className={`flex-grow p-4 h-full transition-all duration-300 ${isSidebarVisible ? 'w-3/4' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            {projectName && (
              <>
                <Link to={`/project/${projectId}`} className="text-gray-500 hover:underline">
                  {projectName}
                </Link>
                <span className="text-gray-500"> / </span>
              </>
            )}
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
            <button 
              className="btn btn-secondary"
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            >
              {isSidebarVisible ? 'Hide Panel' : 'Show Panel'}
            </button>
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

        {menu.visible && (() => {
          const item = gridItems.find(i => i.grid_item_id === menu.gridId);
          const isMerged = item && (item.rowSpan > 1 || item.colSpan > 1);

          return (
            <ul className="menu bg-base-100 w-56 rounded-box absolute shadow-lg z-50" style={{ top: menu.y, left: menu.x }}>
              <li className="menu-title"><span>Template for Grid {menu.gridId}</span></li>
              <li><a onClick={() => handleTemplateSelect('text')}>1. Text</a></li>
              <li><a onClick={() => handleTemplateSelect('textAndImage')}>2. Text and Image</a></li>
              <li><a onClick={() => handleTemplateSelect('image')}>3. Image only</a></li>
              <div className="divider my-0"></div>
              {isMerged && (
                <li><a onClick={handleUnmerge}>Unmerge</a></li>
              )}
              <li><a onClick={handleResetGrids} className="text-error">Reset Item(s)</a></li>
            </ul>
          );
        })()}
      </div>
      
      {isSidebarVisible && (
        <div className="w-1/4 h-full border-l border-base-300">
          <ProjectSidebar projectId={projectId} />
        </div>
      )}
    </div>
  );
};

export default StepTemplate; 