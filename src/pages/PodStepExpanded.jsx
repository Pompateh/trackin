import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ProjectSidebar from '../components/projects/ProjectSidebar';
import { HiOutlineChevronRight } from 'react-icons/hi';
import useProjectStore from '../store/useProjectStore';

// P.O.D specific content components
const PodImageSection = ({ title, onImageUpload, isUploading, imageUrl, onCommentChange, comment, showSeeMore = false, fileInputId, onRemove }) => {
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
                 className="w-full px-2 py-1 border border-black text-black bg-white font-crimson font-semibold text-sm"
                 style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
                 onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
               />
              <div className="flex space-x-2">
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
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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
        className={`flex-1 bg-gray-100 cursor-pointer border ${isFocused ? 'border-blue-400' : 'border-gray-300'}`}
        tabIndex={0}
        onClick={handleImageClick}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{ 
          cursor: 'pointer', 
          overflow: 'hidden', 
          position: 'relative',
          outline: 'none',
          aspectRatio: '628/762'
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
              objectFit: 'cover',
              objectPosition: 'center',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
            draggable={false}
          />
        ) : (
          <div className="text-center text-gray-500 h-full flex items-center justify-center">
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
          <input
            type="text"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="w-full mt-2 px-2 py-1 border border-black text-black bg-white font-crimson font-semibold text-sm"
            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
          />
        ) : (
          <button 
            className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold w-full mt-2"
            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
          >
            See More
          </button>
        )}
        {imageUrl && onRemove && (
          <button
            onClick={onRemove}
            className="px-4 py-2 text-red-500 bg-white border border-red-500 font-crimson font-semibold w-full mt-2"
            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
          >
            Remove
          </button>
        )}
    </div>
  );
};

const PodStepExpanded = () => {
  const { projectId } = useParams();
  const { role, project } = useProjectStore();
  const navigate = useNavigate();

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [finalImages, setFinalImages] = useState([]);
  const [finalComments, setFinalComments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingSection, setUploadingSection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Load POD data from database
  const loadPodData = async () => {
    try {
      const { data, error } = await supabase
        .from('pod_data')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading POD data:', error);
        return;
      }

      if (data) {
        setFinalImages(data.final_images || []);
        setFinalComments(data.final_comments || []);
      }
    } catch (error) {
      console.error('Error loading POD data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save POD data to database
  const savePodData = async () => {
    try {
      console.log('Saving expanded POD data:', {
        project_id: projectId,
        final_images: finalImages,
        final_comments: finalComments
      });

      // First try to get existing data
      const { data: existingData, error: selectError } = await supabase
        .from('pod_data')
        .select('*')
        .eq('project_id', projectId)
        .single();

      let result;
      if (selectError && selectError.code === 'PGRST116') {
        // No existing data, insert new
        const podData = {
          project_id: projectId,
          final_images: finalImages,
          final_comments: finalComments
        };
        result = await supabase
          .from('pod_data')
          .insert(podData);
      } else if (selectError) {
        // Other error
        throw selectError;
      } else {
        // Existing data found, update
        const podData = {
          project_id: projectId,
          final_images: finalImages,
          final_comments: finalComments,
          scale_list: existingData.scale_list,
          reference_image_url: existingData.reference_image_url,
          reference_comment: existingData.reference_comment,
          design_image_url: existingData.design_image_url,
          design_comment: existingData.design_comment,
        };
        result = await supabase
          .from('pod_data')
          .update(podData)
          .eq('project_id', projectId);
      }

      const { data, error } = result;

      if (error) {
        console.error('Error saving POD data:', error);
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
      if (section.startsWith('final-')) {
        const index = parseInt(section.split('-')[1]);
        const newImages = [...finalImages];
        newImages[index] = imageUrl;
        setFinalImages(newImages);
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
    if (!isLoading) {
      savePodData();
    }
  }, [finalImages, finalComments]);

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
      <div className="p-4">
        <button
          className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold text-sm"
          style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
          onClick={() => navigate(`/project/${projectId}/pod`)}
        >
          ← Back to POD
        </button>
      </div>
      <div className="flex w-full h-full">
        {/* Left vertical divider */}
        <div className="h-full w-5 border-r border-t border-l border-b bir border-black flex flex-col items-end mr-0" style={{backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #222 39px, #222 40px)'}}></div>
        
        {/* Main content */}
        <div className="flex-1 h-full border-t border-b border-black transition-all duration-300 p-4 overflow-auto">
          {/* P.O.D Header */}
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
                Final Design Uploads
              </h1>
              <p className="text-lg text-gray-600 mt-1">
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

                     {/* Final Design Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full" style={{ minHeight: '600px' }}>
             {finalImages.map((imageUrl, index) => (
               <div key={index} className="border border-black p-4 h-full">
                 <PodImageSection
                   title="Final Design Upload"
                   onImageUpload={(input) => handleImageUpload(`final-${index}`, input)}
                   isUploading={isUploading && uploadingSection === `final-${index}`}
                   imageUrl={imageUrl}
                   onCommentChange={(comment) => {
                     const newComments = [...finalComments];
                     newComments[index] = comment;
                     setFinalComments(newComments);
                   }}
                   comment={finalComments[index] || ''}
                   fileInputId={`file-input-final-design-${index}`}
                   onRemove={() => {
                     const newImages = finalImages.filter((_, i) => i !== index);
                     const newComments = finalComments.filter((_, i) => i !== index);
                     setFinalImages(newImages);
                     setFinalComments(newComments);
                   }}
                 />
                 <input 
                   type="file" 
                   id={`file-input-final-design-${index}`} 
                   className="hidden" 
                   onChange={(e) => {
                     const file = e.target.files[0];
                     if (file) {
                       handleImageUpload(`final-${index}`, file);
                     }
                   }} 
                   accept="image/*" 
                 />
               </div>
             ))}
            {/* Add new final design button */}
            <div className="border border-black p-4 flex items-center justify-center">
              <button
                onClick={() => {
                  setFinalImages([...finalImages, null]);
                  setFinalComments([...finalComments, '']);
                }}
                className="px-6 py-3 text-black bg-white border border-black font-crimson font-semibold text-lg"
                style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
              >
                + Add Final Design
              </button>
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

export default PodStepExpanded;