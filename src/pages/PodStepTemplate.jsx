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
        className={`flex-1 bg-white cursor-pointer border ${isFocused ? 'border-blue-400' : 'border-gray-300'}`}
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
  const [referenceComment, setReferenceComment] = useState('');
  const [designComment, setDesignComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingSection, setUploadingSection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
      console.log('Saving POD data:', {
        project_id: projectId,
        scale_list: scaleList,
        reference_image_url: referenceImage,
        reference_comment: referenceComment,
        design_image_url: designImage,
        design_comment: designComment,
        final_images: finalImages,
        final_comments: finalComments
      });

      const podData = {
        project_id: projectId,
        scale_list: scaleList,
        reference_image_url: referenceImage,
        reference_comment: referenceComment,
        design_image_url: designImage,
        design_comment: designComment,
        final_images: finalImages,
        final_comments: finalComments
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
  const handleScaleEdit = (index) => {
    setEditingScaleIndex(index);
    setEditingScaleValue(scaleList[index]);
  };

  const handleScaleSave = (index) => {
    const newScaleList = [...scaleList];
    newScaleList[index] = editingScaleValue;
    setScaleList(newScaleList);
    setEditingScaleIndex(null);
    setEditingScaleValue('');
    console.log('Scale saved, triggering auto-save...');
  };

  const handleScaleCancel = () => {
    setEditingScaleIndex(null);
    setEditingScaleValue('');
  };

  const handleScaleAdd = () => {
    // Find the highest number in existing scales
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
  };

  const handleScaleDelete = (index) => {
    const newScaleList = scaleList.filter((_, i) => i !== index);
    setScaleList(newScaleList);
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

  // Load data on component mount
  useEffect(() => {
    loadPodData();
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
  }, [scaleList, referenceImage, designImage, finalImages, finalComments, referenceComment, designComment, isLoading, projectId]);

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
              <h1 className="text-2xl md:text-4xl font-bold" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
                P.O.D
              </h1>
              <p className="text-sm md:text-lg text-gray-600 mt-1">
                {new Date().toLocaleDateString('en-GB')}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  console.log('Manual save triggered');
                  savePodData();
                }}
                className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              >
                Save Now
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
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
                Scale List:
              </h3>
              <div className="space-y-2">
                {scaleList.map((item, index) => (
                  <div key={index} className="flex items-center space-x-1 md:space-x-2">
                    {editingScaleIndex === index ? (
                      <>
                        <input
                          type="text"
                          value={editingScaleValue}
                          onChange={(e) => setEditingScaleValue(e.target.value)}
                          className="flex-1 px-2 py-1 border border-black text-black bg-white font-mono text-sm md:text-lg"
                          style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                          onKeyPress={(e) => e.key === 'Enter' && handleScaleSave(index)}
                          autoFocus
                        />
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
                      </>
                    ) : (
                      <>
                        <div 
                          className="text-sm md:text-lg font-mono flex-1 cursor-pointer truncate" 
                          onDoubleClick={() => handleScaleEdit(index)}
                          title="Double-click to edit"
                        >
                          {item}
                        </div>
                        <button
                          onClick={() => handleScaleDelete(index)}
                          className="text-black text-2xl font-light"
                          style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleScaleAdd}
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
        </div>

        {/* Right vertical divider */}
        <div className="h-full w-5 border-r border-t border-l border-b bir border-black flex flex-col items-end mr-0" style={{backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #222 39px, #222 40px)'}}></div>

        {/* ProjectSidebar - Hidden */}
        <div className="hidden">
          <ProjectSidebar projectId={projectId} onToggleSidebar={() => setIsSidebarVisible(false)} role={role} />
        </div>
      </div>
      
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