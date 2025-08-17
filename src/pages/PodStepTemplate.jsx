import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ProjectSidebar from '../components/projects/ProjectSidebar';
import { HiOutlineChevronRight } from 'react-icons/hi';
import useProjectStore from '../store/useProjectStore';
import group99Icon from '../assets/Group 99.png';

// P.O.D specific content components
const PodImageSection = ({ title, onImageUpload, isUploading, imageUrl, onCommentChange, comment, showSeeMore = false, fileInputId, onSeeMoreClick, onRemove, isFinalDesign = false, sectionType, onImageMove, isUnread, onMarkAsRead, commentAuthor }) => {
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    // Handle paste events for this specific section
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            onImageUpload(file);
            break;
          }
        }
      }
    };

    // Add paste event listener to the container
    if (containerRef.current) {
      containerRef.current.addEventListener('paste', handlePaste);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('paste', handlePaste);
      }
    };
  }, [onImageUpload]);



  const handleImageClick = (e) => {
    e.stopPropagation();
    if (!imageUrl && !isUploading) {
      setShowUrlInput(true);
    }
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    setImageAspectRatio(aspectRatio);
  };

  const handleUrlSubmit = () => {
    if (imageUrlInput.trim()) {
      onImageUpload(imageUrlInput.trim());
      setImageUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleFileUpload = () => {
    const fileInput = document.getElementById(fileInputId);
    if (fileInput) {
      fileInput.click();
    } else {
      console.error(`File input with id "${fileInputId}" not found`);
    }
  };

  return (
    <div className="flex flex-col h-full"
      tabIndex={0}
      onDragOver={e => {
        if (onImageMove) e.preventDefault();
      }}
      onDrop={e => {
        if (onImageMove) {
          e.preventDefault();
          const data = e.dataTransfer.getData('application/json');
          if (data) {
            const { imageUrl: draggedUrl, fromSection } = JSON.parse(data);
            if (draggedUrl && fromSection !== sectionType) {
              onImageMove(draggedUrl, fromSection, sectionType);
            }
          }
        }
      }}
    >
      <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
        {title}
      </h3>
      
      {/* Upload/URL Input Section */}
      {!imageUrl && !isUploading && (
        <div className="mb-2 space-y-2">
          {showUrlInput ? (
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                placeholder="Paste image URL here..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="w-full px-2 py-1 border border-black text-black bg-white font-crimson font-semibold text-xs md:text-sm"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <div className="flex space-x-1 md:space-x-2">
                <button 
                  onClick={handleUrlSubmit}
                  className="px-2 py-1 text-black bg-white border border-black font-crimson font-semibold text-xs flex-1"
                  style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                >
                  Load URL
                </button>
                <button 
                  onClick={() => setShowUrlInput(false)}
                  className="px-2 py-1 text-black bg-white border border-black font-crimson font-semibold text-xs flex-1"
                  style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 md:space-x-2">
              <button 
                onClick={handleFileUpload}
                className="px-2 py-1 text-black bg-white border border-black font-crimson font-semibold text-xs flex-1"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              >
                Upload File
              </button>
              <button 
                onClick={() => setShowUrlInput(true)}
                className="px-2 py-1 text-black bg-white border border-black font-crimson font-semibold text-xs flex-1"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              >
                Paste URL
              </button>
            </div>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className={`flex-1 bg-white cursor-pointer ${isFocused ? 'border border-gray-300' : ''}`}
        tabIndex={0}
        onClick={handleImageClick}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{ 
          cursor: 'pointer', 
          overflow: 'hidden', 
          position: 'relative',
          outline: 'none',
          minHeight: '150px'
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            onLoad={handleImageLoad}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center'
              // Removed userSelect and pointerEvents to allow right-click copy
            }}
            draggable={!!onImageMove}
            onDragStart={e => {
              if (onImageMove) {
                e.dataTransfer.setData('application/json', JSON.stringify({ imageUrl, fromSection: sectionType }));
              }
            }}
          />
        ) : (
            <div className="text-center text-gray-500 h-[95%] flex items-center justify-center">
              {isUploading ? (
                <>
                  <span className="loading loading-spinner loading-md"></span>
                  <p>Uploading...</p>
                </>
              ) : (
                <div>
                  <p>Click to upload image or paste URL</p>
                  <p className="text-xs mt-1">Ctrl+V to paste image from clipboard</p>
                </div>
              )}
            </div>
          )}
      </div>
      {/* Comment Section with unread logic */}
      {!showSeeMore ? (
        <div className={`mt-2 border bg-white ${isUnread ? 'border-red-500' : 'border-black'}`}>
          <textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="w-full px-2 py-1 border-0 text-black bg-white font-crimson font-semibold text-xs md:text-sm resize-none"
            style={{ 
              fontFamily: 'Crimson Pro, serif', 
              borderRadius: '0',
              minHeight: '165px',
              lineHeight: '1.5',
              wordWrap: 'break-word'
            }}
            rows={4}
          />
          {commentAuthor && (
            <div className="text-xs text-gray-500 px-2 pb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {`By: ${commentAuthor}`}
            </div>
          )}
          <div className="flex flex-col">
            {isUnread && (
              <button
                onClick={onMarkAsRead}
                className="w-full px-4 py-3 font-crimson font-bold text-lg text-red-600 bg-white border-t border-red-500 hover:bg-red-50 focus:bg-red-100 transition-colors"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              >
                MARK AS READ
              </button>
            )}
            <button
              onClick={onRemove}
              className={`w-full px-4 py-3 text-black bg-white border-t font-crimson font-semibold text-sm ${isUnread ? 'border-red-500' : 'border-black'}`}
              style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            >
              Remove
            </button>
          </div>
        </div>
      ) : isFinalDesign ? (
        <div className={`mt-2 border bg-white ${isUnread ? 'border-red-500' : 'border-black'}`}>
          <textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="w-full px-2 py-1 border-0 text-black bg-white font-crimson font-semibold text-xs md:text-sm resize-none"
            style={{ 
              fontFamily: 'Crimson Pro, serif', 
              borderRadius: '0',
              minHeight: '120px',
              lineHeight: '1.5',
              wordWrap: 'break-word'
            }}
            rows={2}
          />
          {commentAuthor && (
            <div className="text-xs text-gray-500 px-2 pb-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {`By: ${commentAuthor}`}
            </div>
          )}
          <div className="flex flex-col">
            {isUnread && (
              <button
                onClick={onMarkAsRead}
                className="w-full px-4 py-3 font-crimson font-bold text-sm text-red-600 bg-white border-t border-red-500 hover:bg-red-50 focus:bg-red-100 transition-colors"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              >
                Mark as Read
              </button>
            )}
            <button
              onClick={onRemove}
              className={`w-full px-4 py-3 text-black bg-white border-t font-crimson font-semibold text-sm ${isUnread ? 'border-red-500' : 'border-black'}`}
              style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            >
              Remove
            </button>
            <button 
              onClick={onSeeMoreClick}
              className="w-full px-4 py-3 text-black bg-white border-t border-black font-crimson font-semibold text-sm"
              style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            >
              See More
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={onSeeMoreClick}
          className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold w-full mt-2 text-xs"
          style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
        >
          See More
        </button>
      )}
    </div>
  );
};

const PodStepTemplate = () => {
  const { projectId } = useParams();
  const { role, project } = useProjectStore();
  const navigate = useNavigate();

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [scaleList, setScaleList] = useState(['01/', '02/', '03/']);
  const [editingScaleIndex, setEditingScaleIndex] = useState(null);
  const [editingScaleValue, setEditingScaleValue] = useState('');
  const [referenceImage, setReferenceImage] = useState(null);
  const [designImage, setDesignImage] = useState(null);
  const [finalImages, setFinalImages] = useState([]);
  const [finalComments, setFinalComments] = useState([]);
  const [additionalDesignRows, setAdditionalDesignRows] = useState([]);
  const [referenceComment, setReferenceComment] = useState('');
  const [designComment, setDesignComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // NEW: Track saving state
  const [uploadingSection, setUploadingSection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [driveLink, setDriveLink] = useState('');
  const [showDriveLinkModal, setShowDriveLinkModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState({ show: false, type: '', itemId: null });
  const [workHistory, setWorkHistory] = useState([]);
  const [showWorkHistory, setShowWorkHistory] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [userMap, setUserMap] = useState({});
  const [referenceCommentAuthor, setReferenceCommentAuthor] = useState('');
  const [designCommentAuthor, setDesignCommentAuthor] = useState('');
  const [finalCommentAuthor, setFinalCommentAuthor] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');

  // Add to state:
  const [referenceCommentUnread, setReferenceCommentUnread] = useState(false);
  const [designCommentUnread, setDesignCommentUnread] = useState(false);
  const [finalCommentUnread, setFinalCommentUnread] = useState(false);

  const handleImageUpload = async (section, input) => {
    setIsUploading(true);
    setUploadingSection(section);
    
    try {
      let imageUrl;
      
      // Check if input is a file or URL string
      if (input instanceof File) {
        const file = input;
        const fileExt = file.name.split('.').pop();
        const filePath = `${projectId}/pod/${section}-${Date.now()}.${fileExt}`;

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
          console.error('Error getting public URL for uploaded image');
          return;
        }
        
        imageUrl = urlData.publicUrl;
      } else {
        // Input is a URL string
        imageUrl = input;
      }

      // Update the appropriate state based on section
      switch (section) {
        case 'reference':
          setReferenceImage(imageUrl);
          logWorkHistory('image_upload', `Uploaded reference image`, 'reference_image', section, null, imageUrl);
          break;
        case 'design':
          setDesignImage(imageUrl);
          logWorkHistory('image_upload', `Uploaded design image`, 'design_image', section, null, imageUrl);
          break;
        case 'final-0':
          if (finalImages.length === 0) {
            setFinalImages([imageUrl]);
            setFinalComments(['']);
            logWorkHistory('image_upload', `Uploaded final design image`, 'final_image', section, null, imageUrl);
          } else {
            const newImages = [...finalImages];
            newImages[0] = imageUrl;
            setFinalImages(newImages);
            logWorkHistory('image_upload', `Updated final design image`, 'final_image', section, finalImages[0], imageUrl);
          }
          break;
        default:
          if (section.startsWith('row-')) {
            const parts = section.split('-');
            const rowIndex = parseInt(parts[1]);
            const imageType = parts[2];
            const newRows = [...additionalDesignRows];
            
            if (newRows[rowIndex]) {
              switch (imageType) {
                case 'reference':
                  newRows[rowIndex].referenceImage = imageUrl;
                  logWorkHistory('image_upload', `Uploaded reference image for row ${rowIndex + 1}`, 'reference_image', section, null, imageUrl);
                  break;
                case 'design':
                  newRows[rowIndex].designImage = imageUrl;
                  logWorkHistory('image_upload', `Uploaded design image for row ${rowIndex + 1}`, 'design_image', section, null, imageUrl);
                  break;
                case 'final':
                  newRows[rowIndex].finalImage = imageUrl;
                  logWorkHistory('image_upload', `Uploaded final design image for row ${rowIndex + 1}`, 'final_image', section, null, imageUrl);
                  break;
              }
              setAdditionalDesignRows(newRows);
            }
          }
          break;
      }
      // IMMEDIATE SAVE after upload
      setIsSaving(true);
      await savePodData();
    } catch (error) {
      console.error('Error in image upload process:', error);
    } finally {
      setIsUploading(false);
      setUploadingSection(null);
      setIsSaving(false);
    }
  };

  const handleFileUpload = (section, e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(section, file);
    }
  };

  // Load POD data from database
  const loadPodData = async () => {
    try {
      // First check if the project exists
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Project not found:', projectError);
        // Navigate back to dashboard if project doesn't exist
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('pod_data')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error loading POD data:', error);
        if (error.code === '42P01') { // Table doesn't exist
          console.log('POD data table not found. Please run the SQL script to create it.');
        }
        // Continue with default values
        setIsLoading(false);
        return;
      }

      if (data) {
        setScaleList(data.scale_list || ['01/', '02/', '03/']);
        setReferenceImage(data.reference_image_url || null);
        setDesignImage(data.design_image_url || null);
        setFinalImages(data.final_images || []);
        setFinalComments(data.final_comments || []);
        setAdditionalDesignRows(data.additional_design_rows || []);
        setReferenceComment(data.reference_comment || '');
        setDesignComment(data.design_comment || '');
        setReferenceCommentAuthor(data.reference_comment_author || '');
        setDesignCommentAuthor(data.design_comment_author || '');
        setFinalCommentAuthor(data.final_comment_author || '');
        setReferenceCommentUnread(!!data.reference_comment_unread);
        setDesignCommentUnread(!!data.design_comment_unread);
        setFinalCommentUnread(!!data.final_comment_unread);
      }
    } catch (error) {
      console.error('Error loading POD data:', error);
      // Continue with default values if there's an error
    } finally {
      setIsLoading(false);
    }
  };

  // Save POD data to database
  const savePodData = async () => {
    try {
      // First check if the project exists
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Project not found, cannot save POD data:', projectError);
        return;
      }

      const podData = {
        project_id: projectId,
        scale_list: scaleList,
        reference_image_url: referenceImage,
        reference_comment: referenceComment,
        reference_comment_author: referenceCommentAuthor,
        reference_comment_unread: referenceCommentUnread,
        design_image_url: designImage,
        design_comment: designComment,
        design_comment_author: designCommentAuthor,
        design_comment_unread: designCommentUnread,
        final_images: finalImages,
        final_comments: finalComments,
        final_comment_author: finalCommentAuthor,
        final_comment_unread: finalCommentUnread,
        additional_design_rows: additionalDesignRows
      };

      // First try to get existing data
      const { data: existingData, error: selectError } = await supabase
        .from('pod_data')
        .select('*')
        .eq('project_id', projectId)
        .single();

      let result;
      if (selectError && selectError.code === 'PGRST116') {
        // No existing data, insert new
        result = await supabase
          .from('pod_data')
          .insert(podData);
      } else if (selectError) {
        // Other error
        console.error('[savePodData] Select error:', selectError);
        throw selectError;
      } else {
        // Existing data found, update
        result = await supabase
          .from('pod_data')
          .update(podData)
          .eq('project_id', projectId);
      }

      const { data, error } = result;

      if (error) {
        console.error('[savePodData] Error saving POD data:', error);
        // If table doesn't exist, create it
        if (error.code === '42P01') { // Table doesn't exist
          console.log('POD data table not found. Please run the SQL script to create it.');
        }
      } else {
        console.log('[savePodData] POD data saved successfully:', data);
      }
    } catch (error) {
      console.error('[savePodData] Error saving POD data:', error);
    }
  };

  // Scale list editing functions
  const handleScaleEdit = (index, value) => {
    setEditingScaleIndex(index);
    setEditingScaleValue(value);
  };

  const handleScaleSave = (index) => {
    if (typeof index === 'string' && index.includes('-')) {
      // Additional design row scale list
      const [rowIndex, scaleIndex] = index.split('-').map(Number);
      
      if (!additionalDesignRows[rowIndex]) {
        console.error('Row not found for save:', rowIndex, 'Available rows:', additionalDesignRows.length);
        return;
      }
      
      const oldValue = additionalDesignRows[rowIndex]?.scaleList?.[scaleIndex] || '';
      const newRows = [...additionalDesignRows];
      newRows[rowIndex] = { ...newRows[rowIndex] }; // Create a new object reference
      newRows[rowIndex].scaleList = [...(newRows[rowIndex].scaleList || [])]; // Create a new array reference
      newRows[rowIndex].scaleList[scaleIndex] = editingScaleValue;
      setAdditionalDesignRows(newRows);
      logWorkHistory('scale_update', `Updated scale for row ${rowIndex + 1}`, 'scale', `row-${rowIndex}-${scaleIndex}`, oldValue, editingScaleValue);
    } else {
      // Main scale list
      const oldValue = scaleList[index] || '';
      const newScaleList = [...scaleList];
      newScaleList[index] = editingScaleValue;
      setScaleList(newScaleList);
      logWorkHistory('scale_update', `Updated main scale`, 'scale', `main-${index}`, oldValue, editingScaleValue);
    }
    setEditingScaleIndex(null);
    setEditingScaleValue('');
  };

  const handleScaleCancel = () => {
    setEditingScaleIndex(null);
    setEditingScaleValue('');
  };

  const handleScaleAdd = (rowIndex = null) => {
    if (rowIndex !== null) {
      // Additional design row scale list
      if (!additionalDesignRows[rowIndex]) {
        console.error('Row not found:', rowIndex, 'Available rows:', additionalDesignRows.length);
        return;
      }
      
      const targetScaleList = additionalDesignRows[rowIndex].scaleList || [];
      const existingNumbers = targetScaleList
        .map(item => {
          const match = item.match(/^(\d+)\//);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0);
      
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      const newScaleItem = `${nextNumber.toString().padStart(2, '0')}/`;
      
      const newRows = [...additionalDesignRows];
      newRows[rowIndex] = { ...newRows[rowIndex] }; // Create a new object reference
      newRows[rowIndex].scaleList = [...(newRows[rowIndex].scaleList || []), newScaleItem]; // Create a new array with the new item
      setAdditionalDesignRows(newRows);
      setEditingScaleIndex(`${rowIndex}-${newRows[rowIndex].scaleList.length - 1}`);
      setEditingScaleValue(newScaleItem);
      logWorkHistory('scale_add', `Added scale for row ${rowIndex + 1}`, 'scale', `row-${rowIndex}`, null, newScaleItem);
    } else {
      // Main scale list
      const existingNumbers = scaleList
        .map(item => {
          const match = item.match(/^(\d+)\//);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0);
      
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      const newScaleItem = `${nextNumber.toString().padStart(2, '0')}/`;
      
      setScaleList([...scaleList, newScaleItem]);
      setEditingScaleIndex(scaleList.length);
      setEditingScaleValue(newScaleItem);
      logWorkHistory('scale_add', `Added main scale`, 'scale', 'main', null, newScaleItem);
    }
  };

  const handleScaleDelete = (index) => {
    if (typeof index === 'string' && index.includes('-')) {
      // Additional design row scale list
      const [rowIndex, scaleIndex] = index.split('-').map(Number);
      
      if (!additionalDesignRows[rowIndex]) {
        console.error('Row not found for delete:', rowIndex, 'Available rows:', additionalDesignRows.length);
        return;
      }
      
      const deletedValue = additionalDesignRows[rowIndex]?.scaleList?.[scaleIndex] || '';
      const newRows = [...additionalDesignRows];
      newRows[rowIndex] = { ...newRows[rowIndex] }; // Create a new object reference
      newRows[rowIndex].scaleList = (newRows[rowIndex].scaleList || []).filter((_, i) => i !== scaleIndex);
      setAdditionalDesignRows(newRows);
      logWorkHistory('scale_delete', `Deleted scale for row ${rowIndex + 1}`, 'scale', `row-${rowIndex}-${scaleIndex}`, deletedValue, null);
    } else {
      // Main scale list
      const deletedValue = scaleList[index] || '';
      const newScaleList = scaleList.filter((_, i) => i !== index);
      setScaleList(newScaleList);
      logWorkHistory('scale_delete', `Deleted main scale`, 'scale', `main-${index}`, deletedValue, null);
    }
  };

  const handleDeleteProject = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project: ' + error.message);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project: ' + error.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteInput('');
    }
  };

  const handleDriveLinkUpdate = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ drive_link: driveLink })
        .eq('id', projectId);
      
      if (error) {
        console.error('Error updating drive link:', error);
        alert('Failed to update drive link: ' + error.message);
      } else {
        setShowDriveLinkModal(false);
        alert('Drive link updated successfully!');
        logWorkHistory('drive_link_update', `Updated drive link`, 'drive_link', 'project', null, driveLink);
      }
    } catch (error) {
      console.error('Error updating drive link:', error);
      alert('Failed to update drive link: ' + error.message);
    }
  };

  const handleRemoveConfirm = () => {
    const { type, itemId } = showRemoveConfirm;
    
    if (type === 'design_row') {
      const rowIndex = itemId;
      const removedRow = additionalDesignRows[rowIndex];
      const newRows = additionalDesignRows.filter((_, i) => i !== rowIndex);
      setAdditionalDesignRows(newRows);
      
      // Log the removal
      logWorkHistory('design_row_remove', `Removed design row ${rowIndex + 1}`, 'design_row', `row-${rowIndex}`, 'Design row with content', null);
    }
    
    setShowRemoveConfirm({ show: false, type: '', itemId: null });
  };

  const loadDriveLink = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('drive_link')
        .eq('id', projectId)
        .single();
      
      if (error) {
        console.error('Error loading drive link:', error);
      } else if (data) {
        setDriveLink(data.drive_link || '');
      }
    } catch (error) {
      console.error('Error loading drive link:', error);
    }
  };

  const loadWorkHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('work_history')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error loading work history:', error);
      } else if (data) {
        setWorkHistory(data || []);
        
        // Extract user IDs and load user information
        if (data && data.length > 0) {
          const userIds = data.map(entry => entry.user_id).filter(id => id);
          await loadUserInfo(userIds);
        }
      }
    } catch (error) {
      console.error('Error loading work history:', error);
    }
  };

  const loadCurrentUserEmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserEmail(user.email || '');
        setCurrentUserName(
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          (user.email ? user.email.split('@')[0] : 'Unknown')
        );
      }
    } catch (error) {
      console.error('Error loading current user email:', error);
    }
  };

  const loadUserInfo = async (userIds) => {
    try {
      if (userIds.length === 0) return;
      
      // Get unique user IDs
      const uniqueUserIds = [...new Set(userIds)];
      
      // Try to fetch user profiles from auth.users using a custom function
      const { data, error } = await supabase.rpc('get_user_profiles', {
        user_ids: uniqueUserIds
      });
      
      if (error) {
        console.error('Error loading user profiles via RPC:', error);
        
        // Fallback: try to get current user info and create a simple mapping
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const userInfoMap = {};
            userInfoMap[user.id] = {
              email: user.email,
              name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'You'
            };
            
            // For other users, show a friendly message
            uniqueUserIds.forEach(id => {
              if (id !== user.id) {
                userInfoMap[id] = {
                  email: 'user@example.com',
                  name: 'Team Member'
                };
              }
            });
            
            setUserMap(userInfoMap);
            return;
          }
        } catch (fallbackError) {
          console.error('Fallback user info loading failed:', fallbackError);
        }
        
        return;
      }
      
      // Create a map of user_id to user info
      const userInfoMap = {};
      if (data) {
        data.forEach(user => {
          userInfoMap[user.id] = {
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown User'
          };
        });
      }
      
      setUserMap(userInfoMap);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const logWorkHistory = async (actionType, actionDescription, entityType = null, entityId = null, oldValue = null, newValue = null, metadata = null) => {
    try {
      const { error } = await supabase.rpc('log_work_history', {
        p_project_id: projectId,
        p_action_type: actionType,
        p_action_description: actionDescription,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_old_value: oldValue,
        p_new_value: newValue,
        p_metadata: metadata
      });
      
      if (error) {
        console.error('Error logging work history:', error);
      }
    } catch (error) {
      console.error('Error logging work history:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadPodData();
    loadDriveLink();
    loadWorkHistory();
    loadCurrentUserEmail();
  }, [projectId]);

  // Auto-save when data changes
  useEffect(() => {
    if (!isLoading && projectId) {
      const timeoutId = setTimeout(() => {
        savePodData();
      }, 1000); // Debounce save by 1 second
      
      return () => clearTimeout(timeoutId);
    }
  }, [scaleList, referenceImage, designImage, finalImages, finalComments, additionalDesignRows, referenceComment, designComment, isLoading, projectId]);

  useEffect(() => {
    if (!isLoading) {
      savePodData();
    }
  }, [referenceCommentUnread, designCommentUnread, finalCommentUnread]);

  // Add useEffect to save when additionalDesignRows changes
  useEffect(() => {
    if (!isLoading) {
      savePodData();
    }
  }, [additionalDesignRows]);

  useEffect(() => {
    // Hide main window scrollbar when this page is mounted
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      // Restore scrolling when leaving this page
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2">Loading POD data...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-2 md:p-4">
        <button
          className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold text-xs md:text-sm"
          style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
          onClick={() => navigate('/')}
          disabled={isUploading || isSaving} // Disable navigation while uploading or saving
        >
          {isUploading || isSaving ? (
            <span className="flex items-center"><span className="loading loading-spinner loading-xs mr-2"></span>Saving...</span>
          ) : (
            '← Back to Dashboard'
          )}
        </button>
      </div>
      <div className="flex w-full h-full">
        {/* Left vertical divider */}
        <div className="h-full w-5 border-r border-t border-l border-b bir border-black flex flex-col items-end mr-0" style={{backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #222 39px, #222 40px)'}}></div>
        
        {/* Main content */}
        <div className="flex-1 h-full border-t border-b border-black transition-all duration-300 p-2 md:p-4 overflow-y-scroll scrollbar-visible">
          {/* P.O.D Header */}
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 200, fontSize: '100px' }}>
                P.O.D
              </h1>
              <p className="text-sm md:text-lg text-gray-600 mt-1">
                {new Date().toLocaleDateString('en-GB')}
              </p>
              {driveLink && (
                <div className="mt-2">
                  <a 
                    href={driveLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <img 
                      src={group99Icon} 
                      alt="View Project Files" 
                      className="h-10 w-auto"
                    />
                  </a>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowDriveLinkModal(true)}
                className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              >
                Upload Drive Link
              </button>
              <button
                onClick={() => setShowWorkHistory(true)}
                className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              >
                Work History
              </button>
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              >
                Delete Project
              </button>
            </div>
          </div>

          {/* P.O.D Layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 h-full overflow-x-auto" style={{ minHeight: '600px' }}>
            {/* Scale List Column */}
            <div className="col-span-1 border border-black p-2 md:p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
                  Scale List:
                </h3>
                <div className="text-lg font-semibold" style={{ fontFamily: 'Crimson Pro, serif', color: '#646464' }}>
                  Mẫu 01
                </div>
              </div>
              <div className="space-y-2">
                {scaleList.map((item, index) => (
                  <div key={index} className="flex items-start space-x-1 md:space-x-2 min-h-[24px]">
                    {editingScaleIndex === index ? (
                      <>
                        <textarea
                          value={editingScaleValue}
                          onChange={(e) => setEditingScaleValue(e.target.value)}
                          className="flex-1 px-2 py-1 border border-black text-black bg-white font-mono text-sm md:text-lg resize-none"
                          style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0', minHeight: '60px', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleScaleSave(index)}
                          autoFocus
                          rows={2}
                        />
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleScaleSave(index)}
                            className="px-1 py-1 text-black bg-white border border-black font-crimson font-semibold text-xs min-w-0 md:px-2"
                            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleScaleCancel}
                            className="px-1 py-1 text-black bg-white border border-black font-crimson font-semibold text-xs min-w-0 md:px-2"
                            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div 
                          className="text-sm md:text-lg font-mono flex-1 cursor-pointer break-words" 
                          style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', minHeight: '24px' }}
                          onDoubleClick={() => handleScaleEdit(index)}
                          title="Double-click to edit"
                        >
                          {item}
                        </div>
                        <button
                          onClick={() => handleScaleDelete(index)}
                          className="text-black text-2xl font-light mt-1"
                          style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => handleScaleAdd(null)}
                  className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold w-full mt-2 text-xs md:text-sm"
                  style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                >
                  + Add Scale
                </button>
              </div>
            </div>

            {/* Reference Image Column */}
            <div className="col-span-1 border border-black p-2 md:p-4">
              <PodImageSection
                title="Paste Image/ Link Ref"
                onImageUpload={(url) => handleImageUpload('reference', url)}
                isUploading={isUploading && uploadingSection === 'reference'}
                imageUrl={referenceImage}
                onCommentChange={async (comment) => {
                  const oldComment = referenceComment;
                  setReferenceComment(comment);
                  setReferenceCommentAuthor(currentUserName);
                  setReferenceCommentUnread(true);
                  if (oldComment !== comment) {
                    logWorkHistory('comment_update', `Updated reference comment`, 'comment', 'reference', oldComment, comment);
                  }
                  await savePodData();
                }}
                comment={referenceComment}
                commentAuthor={referenceCommentAuthor}
                fileInputId="file-input-paste-image-link-ref"
                onSeeMoreClick={() => navigate(`/project/${projectId}/pod/expanded`)}
                onRemove={async () => {
                  const oldImage = referenceImage;
                  setReferenceImage(null);
                  logWorkHistory('image_remove', `Removed reference image`, 'reference_image', 'reference', oldImage, null);
                  await savePodData();
                }}
                sectionType="reference"
                onImageMove={(draggedUrl, fromSection, toSection) => {
                  if ((fromSection === 'design' || fromSection === 'final-0') && toSection === 'reference') {
                    setReferenceImage(draggedUrl);
                    if (fromSection === 'design') setDesignImage(null);
                    if (fromSection === 'final-0') setFinalImages([null]);
                  }
                }}
                isUnread={referenceCommentUnread}
                onMarkAsRead={() => {
                  setReferenceCommentUnread(false);
                }}
              />
              <input 
                type="file" 
                id="file-input-paste-image-link-ref" 
                className="hidden" 
                onChange={(e) => handleFileUpload('reference', e)} 
                accept="image/*" 
              />
            </div>

            {/* Design Upload Column */}
            <div className="col-span-1 border border-black p-2 md:p-4">
              <PodImageSection
                title="Design Upload"
                onImageUpload={(url) => handleImageUpload('design', url)}
                isUploading={isUploading && uploadingSection === 'design'}
                imageUrl={designImage}
                onCommentChange={async (comment) => {
                  const oldComment = designComment;
                  setDesignComment(comment);
                  setDesignCommentAuthor(currentUserName);
                  setDesignCommentUnread(true);
                  if (oldComment !== comment) {
                    logWorkHistory('comment_update', `Updated design comment`, 'comment', 'design', oldComment, comment);
                  }
                  await savePodData();
                }}
                comment={designComment}
                commentAuthor={designCommentAuthor}
                fileInputId="file-input-design-upload"
                onSeeMoreClick={() => navigate(`/project/${projectId}/pod/expanded`)}
                onRemove={async () => {
                  const oldImage = designImage;
                  setDesignImage(null);
                  logWorkHistory('image_remove', `Removed design image`, 'design_image', 'design', oldImage, null);
                  await savePodData();
                }}
                sectionType="design"
                onImageMove={(draggedUrl, fromSection, toSection) => {
                  if (toSection === 'design') {
                    setDesignImage(draggedUrl);
                    if (fromSection === 'reference') setReferenceImage(null);
                    if (fromSection === 'final-0') setFinalImages([null]);
                  }
                }}
                isUnread={designCommentUnread}
                onMarkAsRead={() => {
                  setDesignCommentUnread(false);
                }}
              />
              <input 
                type="file" 
                id="file-input-design-upload" 
                className="hidden" 
                onChange={(e) => handleFileUpload('design', e)} 
                accept="image/*" 
              />
            </div>

            {/* Final Design Upload Column */}
            <div className="col-span-1 border border-black p-2 md:p-4">
              <PodImageSection
                title="Final Design Upload"
                onImageUpload={(url) => handleImageUpload('final-0', url)}
                isUploading={isUploading && uploadingSection === 'final-0'}
                imageUrl={finalImages[0] || null}
                onCommentChange={async (comment) => {
                  const oldComment = finalComments[0] || '';
                  const newComments = [...finalComments];
                  newComments[0] = comment;
                  setFinalComments(newComments);
                  setFinalCommentAuthor(currentUserName);
                  setFinalCommentUnread(true);
                  if (oldComment !== comment) {
                    logWorkHistory('comment_update', `Updated final design comment`, 'comment', 'final-0', oldComment, comment);
                  }
                  await savePodData();
                }}
                comment={finalComments[0] || ''}
                commentAuthor={finalCommentAuthor}
                showSeeMore={true}
                fileInputId="file-input-final-design-0"
                onSeeMoreClick={() => navigate(`/project/${projectId}/pod/expanded`)}
                onRemove={async () => {
                  const oldImage = finalImages[0];
                  const newImages = [...finalImages];
                  newImages[0] = null;
                  setFinalImages(newImages);
                  logWorkHistory('image_remove', `Removed final design image`, 'final_image', 'final-0', oldImage, null);
                  await savePodData();
                }}
                sectionType="final-0"
                onImageMove={(draggedUrl, fromSection, toSection) => {
                  if (toSection === 'final-0') {
                    setFinalImages([draggedUrl]);
                    if (fromSection === 'reference') setReferenceImage(null);
                    if (fromSection === 'design') setDesignImage(null);
                  }
                }}
                isFinalDesign={true}
                isUnread={finalCommentUnread}
                onMarkAsRead={() => {
                  setFinalCommentUnread(false);
                }}
              />
              <input 
                type="file" 
                id="file-input-final-design-0" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleImageUpload('final-0', file);
                  }
                }} 
                accept="image/*" 
              />
            </div>
          </div>

          {/* Additional Design Rows */}
          {additionalDesignRows.map((row, rowIndex) => (
            <div key={rowIndex} className="mt-8">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
                Design Row {rowIndex + 1}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4" style={{ minHeight: '600px' }}>
                {/* Scale List Column */}
                <div className="col-span-1 border border-black p-2 md:p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
                      Scale List:
                    </h3>
                    <div className="text-lg font-semibold" style={{ fontFamily: 'Crimson Pro, serif', color: '#646464' }}>
                      Mẫu {(rowIndex + 2).toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {row.scaleList.map((item, index) => (
                      <div key={index} className="flex items-start space-x-1 md:space-x-2 min-h-[24px]">
                        {editingScaleIndex === `${rowIndex}-${index}` ? (
                          <>
                            <textarea
                              value={editingScaleValue}
                              onChange={(e) => setEditingScaleValue(e.target.value)}
                              className="flex-1 px-2 py-1 border border-black text-black bg-white font-mono text-sm md:text-lg resize-none"
                              style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0', minHeight: '60px', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
                              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleScaleSave(`${rowIndex}-${index}`)}
                              autoFocus
                              rows={2}
                            />
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => handleScaleSave(`${rowIndex}-${index}`)}
                                className="px-1 py-1 text-black bg-white border border-black font-crimson font-semibold text-xs min-w-0 md:px-2"
                                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                              >
                                ✓
                              </button>
                              <button
                                onClick={handleScaleCancel}
                                className="px-1 py-1 text-black bg-white border border-black font-crimson font-semibold text-xs min-w-0 md:px-2"
                                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                              >
                                ✕
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div 
                              className="text-sm md:text-lg font-mono flex-1 cursor-pointer break-words" 
                              style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', minHeight: '24px' }}
                              onDoubleClick={() => handleScaleEdit(`${rowIndex}-${index}`, item)}
                              title="Double-click to edit"
                            >
                              {item}
                            </div>
                            <button
                              onClick={() => handleScaleDelete(`${rowIndex}-${index}`)}
                              className="text-black text-2xl font-light mt-1"
                              style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => handleScaleAdd(rowIndex)}
                      className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold w-full mt-2 text-xs md:text-sm"
                      style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                    >
                      + Add Scale
                    </button>
                  </div>
                </div>

                {/* Reference Image Column */}
                <div className="col-span-1 border border-black p-2 md:p-4">
                  <PodImageSection
                    title="Paste Image/ Link Ref"
                    onImageUpload={(url) => handleImageUpload(`row-${rowIndex}-reference`, url)}
                    isUploading={isUploading && uploadingSection === `row-${rowIndex}-reference`}
                    imageUrl={row.referenceImage}
                    onCommentChange={async (comment) => {
                      const oldComment = additionalDesignRows[rowIndex]?.referenceComment || '';
                      const newRows = [...additionalDesignRows];
                      newRows[rowIndex].referenceComment = comment;
                      newRows[rowIndex].referenceCommentAuthor = currentUserName;
                      newRows[rowIndex].referenceCommentUnread = true;
                      setAdditionalDesignRows(newRows);
                      if (oldComment !== comment) {
                        logWorkHistory('comment_update', `Updated reference comment for row ${rowIndex + 1}`, 'comment', `row-${rowIndex}-reference`, oldComment, comment);
                      }
                      await savePodData();
                    }}
                    comment={row.referenceComment || ''}
                    commentAuthor={row.referenceCommentAuthor || ''}
                    fileInputId={`file-input-row-${rowIndex}-reference`}
                    onSeeMoreClick={() => navigate(`/project/${projectId}/pod/expanded/${rowIndex + 1}`)}
                    onRemove={async () => {
                      const oldImage = additionalDesignRows[rowIndex]?.referenceImage;
                      const newRows = [...additionalDesignRows];
                      newRows[rowIndex].referenceImage = null;
                      setAdditionalDesignRows(newRows);
                      if (oldImage) {
                        logWorkHistory('image_remove', `Removed reference image for row ${rowIndex + 1}`, 'reference_image', `row-${rowIndex}-reference`, oldImage, null);
                      }
                      await savePodData();
                    }}
                    sectionType={`row-${rowIndex}-reference`}
                    onImageMove={(draggedUrl, fromSection, toSection) => {
                      if (toSection === `row-${rowIndex}-reference`) {
                        const newRows = [...additionalDesignRows];
                        newRows[rowIndex].referenceImage = draggedUrl;
                        if (fromSection === `row-${rowIndex}-design`) newRows[rowIndex].designImage = null;
                        if (fromSection === `row-${rowIndex}-final`) newRows[rowIndex].finalImage = null;
                        setAdditionalDesignRows(newRows);
                      }
                    }}
                    isUnread={!!row.referenceCommentUnread}
                    onMarkAsRead={() => {
                      const newRows = [...additionalDesignRows];
                      newRows[rowIndex].referenceCommentUnread = false;
                      setAdditionalDesignRows(newRows);
                    }}
                  />
                  <input 
                    type="file" 
                    id={`file-input-row-${rowIndex}-reference`} 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(`row-${rowIndex}-reference`, e)} 
                    accept="image/*" 
                  />
                </div>

                {/* Design Upload Column */}
                <div className="col-span-1 border border-black p-2 md:p-4">
                  <PodImageSection
                    title="Design Upload"
                    onImageUpload={(url) => handleImageUpload(`row-${rowIndex}-design`, url)}
                    isUploading={isUploading && uploadingSection === `row-${rowIndex}-design`}
                    imageUrl={row.designImage}
                    onCommentChange={async (comment) => {
                      const oldComment = additionalDesignRows[rowIndex]?.designComment || '';
                      const newRows = [...additionalDesignRows];
                      newRows[rowIndex].designComment = comment;
                      newRows[rowIndex].designCommentAuthor = currentUserName;
                      newRows[rowIndex].designCommentUnread = true;
                      setAdditionalDesignRows(newRows);
                      if (oldComment !== comment) {
                        logWorkHistory('comment_update', `Updated design comment for row ${rowIndex + 1}`, 'comment', `row-${rowIndex}-design`, oldComment, comment);
                      }
                      await savePodData();
                    }}
                    comment={row.designComment || ''}
                    commentAuthor={row.designCommentAuthor || ''}
                    fileInputId={`file-input-row-${rowIndex}-design`}
                    onSeeMoreClick={() => navigate(`/project/${projectId}/pod/expanded/${rowIndex + 1}`)}
                    onRemove={async () => {
                      const oldImage = additionalDesignRows[rowIndex]?.designImage;
                      const newRows = [...additionalDesignRows];
                      newRows[rowIndex].designImage = null;
                      setAdditionalDesignRows(newRows);
                      if (oldImage) {
                        logWorkHistory('image_remove', `Removed design image for row ${rowIndex + 1}`, 'design_image', `row-${rowIndex}-design`, oldImage, null);
                      }
                      await savePodData();
                    }}
                    sectionType={`row-${rowIndex}-design`}
                    onImageMove={(draggedUrl, fromSection, toSection) => {
                      if (toSection === `row-${rowIndex}-design`) {
                        const newRows = [...additionalDesignRows];
                        newRows[rowIndex].designImage = draggedUrl;
                        if (fromSection === `row-${rowIndex}-reference`) newRows[rowIndex].referenceImage = null;
                        if (fromSection === `row-${rowIndex}-final`) newRows[rowIndex].finalImage = null;
                        setAdditionalDesignRows(newRows);
                      }
                    }}
                    isUnread={!!row.designCommentUnread}
                    onMarkAsRead={() => {
                      const newRows = [...additionalDesignRows];
                      newRows[rowIndex].designCommentUnread = false;
                      setAdditionalDesignRows(newRows);
                    }}
                  />
                  <input 
                    type="file" 
                    id={`file-input-row-${rowIndex}-design`} 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(`row-${rowIndex}-design`, e)} 
                    accept="image/*" 
                  />
                </div>

                {/* Final Design Upload Column */}
                <div className="col-span-1 border border-black p-2 md:p-4">
                  <PodImageSection
                    title="Final Design Upload"
                    onImageUpload={(url) => handleImageUpload(`row-${rowIndex}-final`, url)}
                    isUploading={isUploading && uploadingSection === `row-${rowIndex}-final`}
                    imageUrl={row.finalImage}
                    onCommentChange={async (comment) => {
                      const oldComment = additionalDesignRows[rowIndex]?.finalComment || '';
                      const newRows = [...additionalDesignRows];
                      newRows[rowIndex].finalComment = comment;
                      newRows[rowIndex].finalCommentAuthor = currentUserName;
                      newRows[rowIndex].finalCommentUnread = true;
                      setAdditionalDesignRows(newRows);
                      if (oldComment !== comment) {
                        logWorkHistory('comment_update', `Updated final design comment for row ${rowIndex + 1}`, 'comment', `row-${rowIndex}-final`, oldComment, comment);
                      }
                      await savePodData();
                    }}
                    comment={row.finalComment || ''}
                    commentAuthor={row.finalCommentAuthor || ''}
                    fileInputId={`file-input-row-${rowIndex}-final`}
                    onSeeMoreClick={() => navigate(`/project/${projectId}/pod/expanded/${rowIndex + 1}`)}
                    onRemove={async () => {
                      const oldImage = additionalDesignRows[rowIndex]?.finalImage;
                      const newRows = [...additionalDesignRows];
                      newRows[rowIndex].finalImage = null;
                      setAdditionalDesignRows(newRows);
                      if (oldImage) {
                        logWorkHistory('image_remove', `Removed final design image for row ${rowIndex + 1}`, 'final_image', `row-${rowIndex}-final`, oldImage, null);
                      }
                      await savePodData();
                    }}
                    sectionType={`row-${rowIndex}-final`}
                    onImageMove={(draggedUrl, fromSection, toSection) => {
                      if (toSection === `row-${rowIndex}-final`) {
                        const newRows = [...additionalDesignRows];
                        newRows[rowIndex].finalImage = draggedUrl;
                        if (fromSection === `row-${rowIndex}-reference`) newRows[rowIndex].referenceImage = null;
                        if (fromSection === `row-${rowIndex}-design`) newRows[rowIndex].designImage = null;
                        setAdditionalDesignRows(newRows);
                      }
                    }}
                    isUnread={!!row.finalCommentUnread}
                    onMarkAsRead={() => {
                      const newRows = [...additionalDesignRows];
                      newRows[rowIndex].finalCommentUnread = false;
                      setAdditionalDesignRows(newRows);
                    }}
                  />
                  <input 
                    type="file" 
                    id={`file-input-row-${rowIndex}-final`} 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleImageUpload(`row-${rowIndex}-final`, file);
                      }
                    }} 
                    accept="image/*" 
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    const newRows = additionalDesignRows.filter((_, i) => i !== rowIndex);
                    setAdditionalDesignRows(newRows);
                  }}
                  className="px-4 py-2 text-red-500 bg-white border border-red-500 font-crimson font-semibold"
                  style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                >
                  Remove Design Row
                </button>
              </div>
            </div>
          ))}

          {/* Add Design Button */}
          <div className="mt-8">
            <button
              onClick={() => {
                const newRow = {
                  scaleList: ['01/', '02/', '03/'],
                  referenceImage: null,
                  designImage: null,
                  finalImage: null,
                  referenceComment: '',
                  designComment: '',
                  finalComment: '',
                  referenceCommentAuthor: '',
                  designCommentAuthor: '',
                  finalCommentAuthor: '',
                  referenceCommentUnread: false,
                  designCommentUnread: false,
                  finalCommentUnread: false,
                };
                setAdditionalDesignRows([...additionalDesignRows, newRow]);
              }}
              className="w-full px-8 py-4 bg-white border border-black font-crimson font-semibold text-lg"
              style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0', color: '#646464' }}
            >
              + Add Design
            </button>
          </div>
        </div>
      </div>

      {/* Delete Project Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
              Delete Project
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-black bg-gray-200 border border-gray-300 font-crimson font-semibold text-xs md:text-sm"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProject}
                className="px-4 py-2 text-white bg-red-600 border border-red-700 font-crimson font-semibold text-xs md:text-sm"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              >
                {isDeleting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  'Delete Project'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drive Link Modal */}
      {showDriveLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
              Update Drive Link
            </h3>
            <input
              type="text"
              placeholder="Enter new drive link"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              className="w-full px-2 py-1 border border-black text-black bg-white font-crimson font-semibold text-xs md:text-sm"
              style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowDriveLinkModal(false)}
                className="px-4 py-2 text-black bg-gray-200 border border-gray-300 font-crimson font-semibold text-xs md:text-sm"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDriveLinkUpdate}
                className="px-4 py-2 text-white bg-blue-600 border border-blue-700 font-crimson font-semibold text-xs md:text-sm"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              >
                {isDeleting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  'Update Drive Link'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work History Modal */}
      {showWorkHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl h-full">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
              Work History
            </h3>
            <div className="overflow-y-auto h-[calc(100%-100px)]">
              {workHistory.map((entry, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="text-sm font-crimson font-semibold" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      {userMap[entry.user_id]?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      {new Date(entry.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div className="text-sm text-gray-700" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    {entry.action_description}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowWorkHistory(false)}
                className="px-4 py-2 text-black bg-gray-200 border border-gray-300 font-crimson font-semibold text-xs md:text-sm"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PodStepTemplate;