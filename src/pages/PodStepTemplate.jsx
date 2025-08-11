import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ProjectSidebar from '../components/projects/ProjectSidebar';
import { HiOutlineChevronRight } from 'react-icons/hi';
import useProjectStore from '../store/useProjectStore';

// P.O.D specific content components
const PodImageSection = ({ title, onImageUpload, isUploading, imageUrl, onCommentChange, comment, showSeeMore = false, fileInputId, onSeeMoreClick, onRemove, isFinalDesign = false }) => {
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
    <div className="flex flex-col h-full">
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
              objectPosition: 'center',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
            draggable={false}
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
              {!showSeeMore ? (
          <div className="mt-2 border border-black bg-white">
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
            <button
              onClick={onRemove}
              className="w-full px-4 py-3 text-black bg-white border-t border-black font-crimson font-semibold text-sm"
              style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
            >
              Remove
            </button>
          </div>
        ) : isFinalDesign ? (
          <div className="mt-2 border border-black bg-white">
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
            <button
              onClick={onRemove}
              className="w-full px-4 py-3 text-black bg-white border-t border-black font-crimson font-semibold text-sm"
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
  const [uploadingSection, setUploadingSection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [driveLink, setDriveLink] = useState('');
  const [showDriveLinkModal, setShowDriveLinkModal] = useState(false);

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
          break;
        case 'design':
          setDesignImage(imageUrl);
          break;
        case 'final-0':
          if (finalImages.length === 0) {
            setFinalImages([imageUrl]);
            setFinalComments(['']);
          } else {
            const newImages = [...finalImages];
            newImages[0] = imageUrl;
            setFinalImages(newImages);
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
                  break;
                case 'design':
                  newRows[rowIndex].designImage = imageUrl;
                  break;
                case 'final':
                  newRows[rowIndex].finalImage = imageUrl;
                  break;
              }
              setAdditionalDesignRows(newRows);
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error in image upload process:', error);
    } finally {
      setIsUploading(false);
      setUploadingSection(null);
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

      console.log('Saving POD data:', {
        project_id: projectId,
        scale_list: scaleList,
        reference_image_url: referenceImage,
        reference_comment: referenceComment,
        design_image_url: designImage,
        design_comment: designComment,
        final_images: finalImages,
        final_comments: finalComments,
        additional_design_rows: additionalDesignRows
      });

      const podData = {
        project_id: projectId,
        scale_list: scaleList,
        reference_image_url: referenceImage,
        reference_comment: referenceComment,
        design_image_url: designImage,
        design_comment: designComment,
        final_images: finalImages,
        final_comments: finalComments,
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
        console.error('Error saving POD data:', error);
        // If table doesn't exist, create it
        if (error.code === '42P01') { // Table doesn't exist
          console.log('POD data table not found. Please run the SQL script to create it.');
        }
      } else {
        console.log('POD data saved successfully:', data);
      }
    } catch (error) {
      console.error('Error saving POD data:', error);
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
      
      const newRows = [...additionalDesignRows];
      newRows[rowIndex] = { ...newRows[rowIndex] }; // Create a new object reference
      newRows[rowIndex].scaleList = [...(newRows[rowIndex].scaleList || [])]; // Create a new array reference
      newRows[rowIndex].scaleList[scaleIndex] = editingScaleValue;
      setAdditionalDesignRows(newRows);
      console.log('Additional row scale saved:', { rowIndex, scaleIndex, value: editingScaleValue, newRows });
    } else {
      // Main scale list
      const newScaleList = [...scaleList];
      newScaleList[index] = editingScaleValue;
      setScaleList(newScaleList);
      console.log('Main scale saved:', { index, value: editingScaleValue, newScaleList });
    }
    setEditingScaleIndex(null);
    setEditingScaleValue('');
    console.log('Scale saved, triggering auto-save...');
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
      console.log('Additional row scale added:', { rowIndex, newScaleItem, newRows });
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
      console.log('Main scale added:', { newScaleItem });
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
      
      const newRows = [...additionalDesignRows];
      newRows[rowIndex] = { ...newRows[rowIndex] }; // Create a new object reference
      newRows[rowIndex].scaleList = (newRows[rowIndex].scaleList || []).filter((_, i) => i !== scaleIndex);
      setAdditionalDesignRows(newRows);
      console.log('Additional row scale deleted:', { rowIndex, scaleIndex, newRows });
    } else {
      // Main scale list
      const newScaleList = scaleList.filter((_, i) => i !== index);
      setScaleList(newScaleList);
      console.log('Main scale deleted:', { index, newScaleList });
    }
    console.log('Scale deleted, triggering auto-save...');
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
      }
    } catch (error) {
      console.error('Error updating drive link:', error);
      alert('Failed to update drive link: ' + error.message);
    }
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

  // Load data on component mount
  useEffect(() => {
    loadPodData();
    loadDriveLink();
  }, [projectId]);

  // Auto-save when data changes
  useEffect(() => {
    if (!isLoading && projectId) {
      const timeoutId = setTimeout(() => {
        console.log('Auto-saving POD data...');
        savePodData();
      }, 1000); // Debounce save by 1 second
      
      return () => clearTimeout(timeoutId);
    }
  }, [scaleList, referenceImage, designImage, finalImages, finalComments, additionalDesignRows, referenceComment, designComment, isLoading, projectId]);

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
        >
          ← Back to Dashboard
        </button>
      </div>
      <div className="flex w-full h-full">
        {/* Left vertical divider */}
        <div className="h-full w-5 border-r border-t border-l border-b bir border-black flex flex-col items-end mr-0" style={{backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #222 39px, #222 40px)'}}></div>
        
        {/* Main content */}
        <div className="flex-1 h-full border-t border-b border-black transition-all duration-300 p-2 md:p-4 overflow-auto">
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
                      src="/src/assets/Group 99.png" 
                      alt="View Project Files" 
                      className="h-8 w-auto hover:opacity-80 transition-opacity"
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
                onCommentChange={setReferenceComment}
                comment={referenceComment}
                fileInputId="file-input-paste-image-link-ref"
                onSeeMoreClick={() => navigate(`/project/${projectId}/pod/expanded`)}
                onRemove={() => {
                  setReferenceImage(null);
                  setReferenceComment('');
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
                onCommentChange={setDesignComment}
                comment={designComment}
                fileInputId="file-input-design-upload"
                onSeeMoreClick={() => navigate(`/project/${projectId}/pod/expanded`)}
                onRemove={() => {
                  setDesignImage(null);
                  setDesignComment('');
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
                onCommentChange={(comment) => {
                  const newComments = [...finalComments];
                  newComments[0] = comment;
                  setFinalComments(newComments);
                }}
                comment={finalComments[0] || ''}
                showSeeMore={true}
                fileInputId="file-input-final-design-0"
                onSeeMoreClick={() => navigate(`/project/${projectId}/pod/expanded`)}
                onRemove={() => {
                  const newImages = finalImages.filter((_, i) => i !== 0);
                  const newComments = finalComments.filter((_, i) => i !== 0);
                  setFinalImages(newImages);
                  setFinalComments(newComments);
                }}
                isFinalDesign={true}
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
                    onCommentChange={(comment) => {
                      const newRows = [...additionalDesignRows];
                      newRows[rowIndex].referenceComment = comment;
                      setAdditionalDesignRows(newRows);
                    }}
                    comment={row.referenceComment || ''}
                    fileInputId={`file-input-row-${rowIndex}-reference`}
                    onSeeMoreClick={() => navigate(`/project/${projectId}/pod/expanded/${rowIndex + 1}`)}
                    onRemove={() => {
                      const newRows = [...additionalDesignRows];
                      newRows[rowIndex].referenceImage = null;
                      newRows[rowIndex].referenceComment = '';
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
                    onCommentChange={(comment) => {
                      const newRows = [...additionalDesignRows];
                      newRows[rowIndex].designComment = comment;
                      setAdditionalDesignRows(newRows);
                    }}
                    comment={row.designComment || ''}
                    fileInputId={`file-input-row-${rowIndex}-design`}
                    onSeeMoreClick={() => navigate(`/project/${projectId}/pod/expanded/${rowIndex + 1}`)}
                    onRemove={() => {
                      const newRows = [...additionalDesignRows];
                      newRows[rowIndex].designImage = null;
                      newRows[rowIndex].designComment = '';
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
                    onCommentChange={(comment) => {
                      const newRows = [...additionalDesignRows];
                      newRows[rowIndex].finalComment = comment;
                      setAdditionalDesignRows(newRows);
                    }}
                    comment={row.finalComment || ''}
                    showSeeMore={true}
                    fileInputId={`file-input-row-${rowIndex}-final`}
                                          onSeeMoreClick={() => navigate(`/project/${projectId}/pod/expanded/${rowIndex + 1}`)}
                      onRemove={() => {
                        const newRows = [...additionalDesignRows];
                        newRows[rowIndex].finalImage = null;
                        newRows[rowIndex].finalComment = '';
                        setAdditionalDesignRows(newRows);
                      }}
                    isFinalDesign={true}
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
              
              {/* Remove Row Button */}
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
                  finalComment: ''
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

        {/* Right vertical divider */}
        <div className="h-full w-5 border-r border-t border-l border-b bir border-black flex flex-col items-end mr-0" style={{backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #222 39px, #222 40px)'}}></div>

        {/* ProjectSidebar - Hidden */}
        <div className="hidden">
          <ProjectSidebar projectId={projectId} onToggleSidebar={() => setIsSidebarVisible(false)} role={role} />
        </div>
      </div>
      
      {/* Drive Link Modal */}
      {showDriveLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 min-w-[320px] max-w-[90vw] flex flex-col gap-4 border border-black" style={{ borderRadius: '0' }}>
            <h2 className="text-lg font-bold mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>Upload Drive Link</h2>
            <p style={{ fontFamily: 'Crimson Pro, serif' }}>Enter the Google Drive link for this project:</p>
            <input
              type="url"
              className="w-full px-2 py-1 border border-black text-black bg-white font-crimson font-semibold"
              style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              placeholder="https://drive.google.com/..."
              value={driveLink}
              onChange={e => setDriveLink(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end mt-2">
              <button
                className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                onClick={() => setShowDriveLinkModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                onClick={handleDriveLinkUpdate}
              >
                Update Drive Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 min-w-[320px] max-w-[90vw] flex flex-col gap-4 border border-black" style={{ borderRadius: '0' }}>
            <h2 className="text-lg font-bold mb-2 text-red-600" style={{ fontFamily: 'Crimson Pro, serif' }}>Confirm Project Deletion</h2>
            <p style={{ fontFamily: 'Crimson Pro, serif' }}>To confirm deletion, type the project name below:</p>
            <div className="mb-2">
              <span className="font-semibold" style={{ fontFamily: 'Crimson Pro, serif' }}>Project Name:</span> <span className="italic">{project?.name}</span>
            </div>
            <input
              type="text"
              className="w-full px-2 py-1 border border-black text-black bg-white font-crimson font-semibold"
              style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              placeholder="Type project name to confirm"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              disabled={isDeleting}
              autoFocus
            />
            <div className="flex gap-2 justify-end mt-2">
              <button
                className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                onClick={() => { setShowDeleteModal(false); setDeleteInput(''); }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-red-500 bg-white border border-red-500 font-crimson font-semibold"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                onClick={confirmDeleteProject}
                disabled={deleteInput !== project?.name || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PodStepTemplate; 