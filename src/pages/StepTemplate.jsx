import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import { supabase } from '../lib/supabaseClient';
import ProjectSidebar from '../components/projects/ProjectSidebar';
import { HiOutlineChevronRight } from 'react-icons/hi';
import useProjectStore from '../store/useProjectStore';

// A single editable text row with a delete button
const EditableTextRow = ({ value, onChange, onVisibilityChange, placeholder, className, isVisible, fontSize, onFontSizeChange }) => {
  if (!isVisible) return null;

  const isEmpty = !value || value.trim() === '';
  const displayValue = isEmpty ? placeholder : value;

  const handleTextClick = (e) => {
    // Stop propagation to prevent grid selection when clicking on text
    e.stopPropagation();
  };

  const handleDeleteClick = (e) => {
    // Stop propagation to prevent grid selection when clicking delete button
    e.stopPropagation();
    onVisibilityChange();
  };

  return (
    <div className="relative group">
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => onChange(e.currentTarget.textContent)}
        onClick={handleTextClick}
        onMouseDown={handleTextClick}
        className={`w-full outline-none focus:bg-gray-100 p-1 rounded ${className} ${isEmpty ? 'text-gray-400 italic' : ''}`}
        style={{ 
          fontSize: `${fontSize}px`,
          filter: isEmpty ? 'blur(0.5px)' : 'none',
          opacity: isEmpty ? 0.7 : 1
        }}
        dangerouslySetInnerHTML={{ __html: displayValue || '' }}
        data-placeholder={placeholder}
      />
      <div className="absolute top-0 right-0 h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto bg-gradient-to-l from-base-200 via-base-200 to-transparent pl-4">
        <button 
          onClick={handleDeleteClick}
          className="text-red-500"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

// New toolbar for text formatting - moved outside of grid items
const TextFormatToolbar = ({ selectedItems, onUpdate }) => {
  // Only show if we have selected text items
  const textItems = selectedItems.filter(item => item.template_type === 'text');
  if (textItems.length === 0) return null;

  // Use the first selected item's values as reference
  const firstItem = textItems[0];
  
  const handleUpdate = (updates) => {
    // Update all selected text items
    textItems.forEach(item => {
      onUpdate(item.grid_item_id, updates);
    });
  };

  const positions = [
    { v: 'top', h: 'left', label: 'TL' },
    { v: 'top', h: 'right', label: 'TR' },
    { v: 'bottom', h: 'left', label: 'BL' },
    { v: 'bottom', h: 'right', label: 'BR' },
  ];

  return (
    <div className="bg-base-200 p-3 rounded-lg shadow-lg border border-gray-300">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Text Position:</span>
          <div className="btn-group">
            {positions.map(({ v, h, label }) => (
              <button
                key={`${v}-${h}`}
                title={`Position ${v} ${h}`}
                className={`btn btn-xs ${firstItem.text_vertical_align === v && firstItem.text_horizontal_align === h ? 'btn-active' : ''}`}
                onClick={() => handleUpdate({ text_vertical_align: v, text_horizontal_align: h })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Title Size:</span>
          <button 
            className="btn btn-xs btn-outline" 
            onClick={() => handleUpdate({ title_font_size: Math.max(12, firstItem.title_font_size - 2) })}
          >
            -
          </button>
          <span className="text-xs w-8 text-center">{firstItem.title_font_size}px</span>
          <button 
            className="btn btn-xs btn-outline" 
            onClick={() => handleUpdate({ title_font_size: firstItem.title_font_size + 2 })}
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Subtitle Size:</span>
          <button 
            className="btn btn-xs btn-outline" 
            onClick={() => handleUpdate({ subtitle_font_size: Math.max(10, firstItem.subtitle_font_size - 2) })}
          >
            -
          </button>
          <span className="text-xs w-8 text-center">{firstItem.subtitle_font_size}px</span>
          <button 
            className="btn btn-xs btn-outline" 
            onClick={() => handleUpdate({ subtitle_font_size: firstItem.subtitle_font_size + 2 })}
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Body Size:</span>
          <button 
            className="btn btn-xs btn-outline" 
            onClick={() => handleUpdate({ body_font_size: Math.max(8, firstItem.body_font_size - 2) })}
          >
            -
          </button>
          <span className="text-xs w-8 text-center">{firstItem.body_font_size}px</span>
          <button 
            className="btn btn-xs btn-outline" 
            onClick={() => handleUpdate({ body_font_size: firstItem.body_font_size + 2 })}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

// Template-specific content components
const TextContent = ({ item, onUpdate }) => {
  const handleUpdate = useCallback((field, value) => {
    onUpdate({ [field]: value });
  }, [onUpdate]);

  const justifyMap = { // Vertical alignment for flex-col
    top: 'justify-start',
    center: 'justify-center',
    bottom: 'justify-end',
  };

  const alignMap = { // Horizontal alignment for flex-col
    left: 'items-start',
    center: 'items-center',
    right: 'items-end',
  };

  // Text align is now always left for left corners, right for right corners
  let effectiveTextAlign = 'left';
  if (item.text_horizontal_align === 'right') effectiveTextAlign = 'right';

  return (
    <div className={`p-2 h-full w-full flex flex-col relative bg-transparent ${justifyMap[item.text_vertical_align] || 'justify-start'} ${alignMap[item.text_horizontal_align] || 'items-start'}`}>
      <div style={{ textAlign: effectiveTextAlign, width: '100%' }}>
        <EditableTextRow
          value={item.title_text}
          onChange={text => handleUpdate('title_text', text)}
          onVisibilityChange={() => handleUpdate('is_title_visible', false)}
          placeholder="Big Title"
          className="text-2xl font-bold"
          isVisible={item.is_title_visible}
          fontSize={item.title_font_size}
        />
        <EditableTextRow
          value={item.subtitle_text}
          onChange={text => handleUpdate('subtitle_text', text)}
          onVisibilityChange={() => handleUpdate('is_subtitle_visible', false)}
          placeholder="Small Description"
          className="text-md text-gray-600"
          isVisible={item.is_subtitle_visible}
          fontSize={item.subtitle_font_size}
        />
        <EditableTextRow
          value={item.body_text}
          onChange={text => handleUpdate('body_text', text)}
          onVisibilityChange={() => handleUpdate('is_body_visible', false)}
          placeholder="Word processing added..."
          className="text-base mt-4"
          isVisible={item.is_body_visible}
          fontSize={item.body_font_size}
        />
      </div>
    </div>
  );
};

const ImageContent = ({ item, onUpdate, onImageSelect, isUploading }) => {
  const handleImageClick = (e) => {
    // Stop propagation to prevent grid selection when clicking on image upload area
    e.stopPropagation();
    if (!item.image_url && !isUploading) {
      onImageSelect();
    }
  };

  return (
    <div 
      className="w-full h-full flex justify-center items-center bg-gray-100 cursor-pointer"
      onClick={handleImageClick}
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
};

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
                  hover:border-blue-300 hover:shadow-md
                  ${selected ? 'border-2 border-blue-500 shadow-lg bg-blue-50' : 'border border-gray-300'}`}
      style={{
        gridColumn: `span ${item.colSpan}`,
        gridRow: `span ${item.rowSpan}`,
        minHeight: '200px',
      }}
      onClick={(e) => onSelect(item.grid_item_id, e)}
      onContextMenu={(e) => { e.preventDefault(); onShowMenu(e, item.grid_item_id); }}
    >
      {renderContent()}
      <input type="file" id={`file-input-${item.grid_item_id}`} className="hidden" onChange={handleImageUpload} accept="image/*" />
    </div>
  );
};

// --- Grid Constants and Helpers ---
const NUM_COLS = 4;
const MIN_ROWS = 2;

// Generates a default, empty grid item for a specific cell.
const createDefaultGridItem = (row, col) => {
  return {
    grid_item_id: (row - 1) * NUM_COLS + col,
    row: row,
    col: col,
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
    text_align: 'left',
    text_vertical_align: 'top',
    text_horizontal_align: 'left',
  };
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
  text_align: item.text_align,
  text_vertical_align: item.text_vertical_align,
  text_horizontal_align: item.text_horizontal_align,
});

// The main template selection component
const StepTemplate = () => {
  const { projectId, sectionId } = useParams();
  const { role } = useProjectStore();
  const [rows, setRows] = useState(MIN_ROWS);
  const [gridItems, setGridItems] = useState([]);
  const [selectedGrids, setSelectedGrids] = useState(new Set());
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0, gridId: null });
  const [projectName, setProjectName] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Handle grid selection
  const handleSelect = (id, event) => {
    console.log('Grid selection attempt:', { id, isMultiSelectMode, ctrlKey: event?.ctrlKey, metaKey: event?.metaKey });
    
    setSelectedGrids(prev => {
      const newSelection = new Set(prev);
      
      // Check for multi-select mode (either from state or from event)
      const shouldMultiSelect = isMultiSelectMode || (event && (event.ctrlKey || event.metaKey));
      
      if (shouldMultiSelect) {
        console.log('Multi-selection mode - toggling item:', id);
        if (newSelection.has(id)) {
          newSelection.delete(id);
          console.log('Removed from selection');
        } else {
          newSelection.add(id);
          console.log('Added to selection');
        }
      } else {
        // Otherwise, replace the selection with just this item
        console.log('Single selection mode - replacing selection with:', id);
        newSelection.clear();
        newSelection.add(id);
      }
      
      console.log('New selection:', Array.from(newSelection));
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
          text_align: 'left',
          text_vertical_align: 'top',
          text_horizontal_align: 'left',
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
          text_align: 'left',
          text_vertical_align: 'top',
          text_horizontal_align: 'left',
        }
      });
    });
    batchUpdateAndSave(updates);
    setMenu({ visible: false });
    setSelectedGrids(new Set()); // Deselect after action
  };

  const handleAddRow = async () => {
    const newRowsCount = rows + 1;
    
    const newItems = [];
    const dbItemsToUpsert = [];

    for (let c = 1; c <= NUM_COLS; c++) {
      const newItem = createDefaultGridItem(newRowsCount, c);
      newItems.push(newItem);
      dbItemsToUpsert.push(mapStateToDb(newItem, projectId, sectionId));
    }

    const { error } = await supabase.from('grid_items').upsert(dbItemsToUpsert, {
      onConflict: 'project_id,section_id_text,grid_item_id'
    });

    if (error) {
      console.error("Error adding new row:", JSON.stringify(error, null, 2));
      return;
    }

    setGridItems(prevItems => [...prevItems, ...newItems]);
    setRows(newRowsCount);
  };

  const handleRemoveRow = async () => {
    if (rows <= MIN_ROWS) return;

    const lastRow = rows;
    const itemIdsToDelete = gridItems
      .filter(item => item.row === lastRow)
      .map(item => item.grid_item_id);

    if (itemIdsToDelete.length > 0) {
      const { error } = await supabase
        .from('grid_items')
        .delete()
        .eq('project_id', projectId)
        .eq('section_id_text', sectionId)
        .in('grid_item_id', itemIdsToDelete);

      if (error) {
        console.error("Error removing row:", JSON.stringify(error, null, 2));
        return;
      }
    }

    setGridItems(prevItems => prevItems.filter(item => item.row < lastRow));
    setRows(lastRow - 1);
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

    const fetchAndStructureGridItems = async () => {
      const { data: dbItems, error } = await supabase
        .from('grid_items')
        .select('*')
        .eq('project_id', projectId)
        .eq('section_id_text', sectionId);

      if (error) {
        console.error("Error fetching grid items:", JSON.stringify(error, null, 2));
        return;
      }

      const maxRowInDb = dbItems && dbItems.length > 0
        ? Math.max(...dbItems.map(i => i.row_num))
        : 0;
      const totalRows = Math.max(MIN_ROWS, maxRowInDb);
      setRows(totalRows);

      const newGridItems = [];
      const itemsToUpsert = [];

      for (let r = 1; r <= totalRows; r++) {
        for (let c = 1; c <= NUM_COLS; c++) {
          const gridId = (r - 1) * NUM_COLS + c;
          const dbItem = dbItems?.find(item => item.grid_item_id === gridId);

          if (dbItem) {
            newGridItems.push({
              grid_item_id: dbItem.grid_item_id,
              row: dbItem.row_num,
              col: dbItem.col_num,
              rowSpan: dbItem.row_span,
              colSpan: dbItem.col_span,
              hidden: dbItem.is_hidden,
              template_type: dbItem.template_type,
              image_url: dbItem.image_url,
              title_text: dbItem.title_text,
              subtitle_text: dbItem.subtitle_text,
              body_text: dbItem.body_text,
              is_title_visible: dbItem.is_title_visible,
              is_subtitle_visible: dbItem.is_subtitle_visible,
              is_body_visible: dbItem.is_body_visible,
              title_font_size: dbItem.title_font_size || 24,
              subtitle_font_size: dbItem.subtitle_font_size || 16,
              body_font_size: dbItem.body_font_size || 14,
              text_align: dbItem.text_align || 'left',
              text_vertical_align: dbItem.text_vertical_align || 'top',
              text_horizontal_align: dbItem.text_horizontal_align || 'left',
            });
          } else {
            const defaultItem = createDefaultGridItem(r, c);
            newGridItems.push(defaultItem);
            itemsToUpsert.push(mapStateToDb(defaultItem, projectId, sectionId));
          }
        }
      }
      
      if (itemsToUpsert.length > 0) {
        const { error: upsertError } = await supabase.from('grid_items').upsert(itemsToUpsert, {
          onConflict: 'project_id,section_id_text,grid_item_id'
        });
        if (upsertError) {
          console.error("Error backfilling grid items:", JSON.stringify(upsertError, null, 2));
        }
      }

      setGridItems(newGridItems);
    };

    fetchAndStructureGridItems();
  }, [projectId, sectionId]);

  // Add keyboard event listeners for multi-select mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        setIsMultiSelectMode(true);
      }
    };

    const handleKeyUp = (e) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIsMultiSelectMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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
    if ('text_align' in updates) dbUpdates.text_align = updates.text_align;
    if ('text_vertical_align' in updates) dbUpdates.text_vertical_align = updates.text_vertical_align;
    if ('text_horizontal_align' in updates) dbUpdates.text_horizontal_align = updates.text_horizontal_align;

    const { error } = await supabase
      .from('grid_items')
      .update(dbUpdates)
      .eq('project_id', projectId)
      .eq('section_id_text', sectionId)
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
      if ('text_align' in itemUpdates) dbUpdates.text_align = itemUpdates.text_align;
      if ('text_vertical_align' in itemUpdates) dbUpdates.text_vertical_align = itemUpdates.text_vertical_align;
      if ('text_horizontal_align' in itemUpdates) dbUpdates.text_horizontal_align = itemUpdates.text_horizontal_align;

      const { error } = await supabase
        .from('grid_items')
        .update(dbUpdates)
        .eq('project_id', projectId)
        .eq('section_id_text', sectionId)
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
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="p-4">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>
      </div>
      <div className="flex w-full h-full">
        {/* Left vertical divider */}
        <div className="h-full w-5 border-r border-t border-l border-b bir border-black flex flex-col items-end mr-0" style={{backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #222 39px, #222 40px)'}}></div>
        {/* Main content */}
        <div className={`${isSidebarVisible ? 'w-2/3' : 'flex-1'} h-full border-t border-b border-black transition-all duration-300 p-4`}>
          <div className="flex justify-between items-center mb-4">
            <div>
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
              <p className="text-sm text-gray-600 mt-1">
                Click to select single grid • Hold Ctrl/Cmd + Click to select multiple grids • Right-click for menu
                {isMultiSelectMode && (
                  <span className="ml-2 text-blue-600 font-semibold">[Multi-Select Mode Active]</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button 
                  className="btn btn-sm btn-outline" 
                  onClick={handleRemoveRow}
                  disabled={rows <= MIN_ROWS}
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
                className={`btn btn-sm ${isMultiSelectMode ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
              >
                {isMultiSelectMode ? 'Multi-Select ON' : 'Multi-Select OFF'}
              </button>
            </div>
          </div>

          {/* Selection Info and Text Formatting Toolbar */}
          {selectedGrids.size > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-blue-800">
                    {selectedGrids.size} grid{selectedGrids.size > 1 ? 's' : ''} selected
                  </span>
                  {selectedGrids.size > 1 && (
                    <span className="text-xs text-blue-600">
                      (Hold Ctrl/Cmd + Click to select more)
                    </span>
                  )}
                </div>
                <button 
                  className="btn btn-xs btn-outline"
                  onClick={() => setSelectedGrids(new Set())}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
          
          {/* Text Formatting Toolbar - only shows when text items are selected */}
          {(() => {
            const selectedItems = gridItems.filter(item => selectedGrids.has(item.grid_item_id));
            return (
              <TextFormatToolbar 
                selectedItems={selectedItems} 
                onUpdate={updateAndSaveItem} 
              />
            );
          })()}

          <div
            className="grid grid-cols-4"
            style={{ gap: '10px 5px', gridAutoRows: 'auto', maxHeight: '700px', overflow: 'auto' }}
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
                <li><a onClick={() => handleTemplateSelect('image')}>2. Image only</a></li>
                <div className="divider my-0"></div>
                {isMerged && (
                  <li><a onClick={handleUnmerge}>Unmerge</a></li>
                )}
                <li><a onClick={handleResetGrids} className="text-error">Reset Item(s)</a></li>
              </ul>
            );
          })()}
        </div>
        {/* Middle vertical divider */}
        <div className="h-full w-5 border-r border-t border-l border-b bir border-black flex flex-col items-end mr-0" style={{backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #222 39px, #222 40px)'}}></div>
        {/* ProjectSidebar */}
        {isSidebarVisible ? (
          <div className="w-1/3 h-full border-l-0 border-base-300">
            <ProjectSidebar projectId={projectId} onToggleSidebar={() => setIsSidebarVisible(false)} role={role} />
          </div>
        ) : (
          <div className="h-full flex flex-col justify-center items-center border-l border-black bg-white" style={{ width: '40px', cursor: 'pointer' }} onClick={() => setIsSidebarVisible(true)}>
            <HiOutlineChevronRight style={{ transform: 'rotate(180deg)', fontWeight: 200, fontSize: '2.5rem', userSelect: 'none' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StepTemplate; 