import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ProjectSidebar from '../components/projects/ProjectSidebar';
import { HiOutlineChevronRight } from 'react-icons/hi';
import useProjectStore from '../store/useProjectStore';

// P.O.D specific content components
const PodImageSection = ({ title, onImageUpload, isUploading, imageUrl, onCommentChange, comment, showSeeMore = false }) => {
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
  }, [containerRef.current, imageUrl]);

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
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (!imageUrl && !isUploading) {
      onImageUpload();
    }
  };

  const handleScaleChange = (e) => {
    const newScale = parseFloat(e.target.value);
    setScale(newScale);
    const clamped = clampOffset(offset.x, offset.y, newScale);
    setOffset(clamped);
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
        {title}
      </h3>
      <div
        ref={containerRef}
        className="flex-1 bg-gray-100 cursor-pointer border border-gray-300"
        onClick={handleImageClick}
        onMouseDown={imageUrl ? handleMouseDown : undefined}
        onMouseMove={dragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: imageUrl ? (dragging ? 'grabbing' : 'grab') : 'pointer', overflow: 'hidden', position: 'relative' }}
      >
        {imageUrl ? (
          <>
            <img
              ref={imgRef}
              src={imageUrl}
              alt={title}
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
          </>
        ) : (
          <div className="text-center text-gray-500 h-full flex items-center justify-center">
            {isUploading ? (
              <>
                <span className="loading loading-spinner loading-md"></span>
                <p>Uploading...</p>
              </>
            ) : (
              <div>
                <p>Click to upload image</p>
                <p className="text-xs">Size: 592 x 736</p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-2 text-sm text-gray-600">Size Image: 592 x 736</div>
      {!showSeeMore ? (
        <input
          type="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          className="input input-bordered input-sm w-full mt-2"
        />
      ) : (
        <button className="btn btn-outline btn-sm w-full mt-2">See More</button>
      )}
    </div>
  );
};

const PodStepTemplate = () => {
  const { projectId } = useParams();
  const { role, project } = useProjectStore();
  

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [scaleList, setScaleList] = useState(['01/', '02/', '03/']);
  const [referenceImage, setReferenceImage] = useState(null);
  const [designImage, setDesignImage] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [referenceComment, setReferenceComment] = useState('');
  const [designComment, setDesignComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingSection, setUploadingSection] = useState(null);

  const handleImageUpload = async (section, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadingSection(section);
    try {
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

      // Update the appropriate state based on section
      switch (section) {
        case 'reference':
          setReferenceImage(urlData.publicUrl);
          break;
        case 'design':
          setDesignImage(urlData.publicUrl);
          break;
        case 'final':
          setFinalImage(urlData.publicUrl);
          break;
      }
    } catch (error) {
      console.error('Error in image upload process:', error);
    } finally {
      setIsUploading(false);
      setUploadingSection(null);
    }
  };

  const triggerFileUpload = (section) => {
    document.getElementById(`file-input-${section}`).click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="p-4">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => window.location.href = '/'}
        >
          ← Back to Dashboard
        </button>
      </div>
      <div className="flex w-full h-full">
        {/* Left vertical divider */}
        <div className="h-full w-5 border-r border-t border-l border-b bir border-black flex flex-col items-end mr-0" style={{backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #222 39px, #222 40px)'}}></div>
        
        {/* Main content */}
        <div className={`${isSidebarVisible ? 'w-2/3' : 'flex-1'} h-full border-t border-b border-black transition-all duration-300 p-4 overflow-auto`}>
          {/* P.O.D Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
              P.O.D
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              {new Date().toLocaleDateString('en-GB')}
            </p>
          </div>

          {/* P.O.D Layout Grid */}
          <div className="grid grid-cols-4 gap-4 h-full" style={{ minHeight: '600px' }}>
            {/* Scale List Column */}
            <div className="col-span-1 border border-black p-4">
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
                Scale List:
              </h3>
              <div className="space-y-2">
                {scaleList.map((item, index) => (
                  <div key={index} className="text-lg font-mono">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Reference Image Column */}
            <div className="col-span-1 border border-black p-4">
              <PodImageSection
                title="Paste Image/ Link Ref"
                onImageUpload={() => triggerFileUpload('reference')}
                isUploading={isUploading && uploadingSection === 'reference'}
                imageUrl={referenceImage}
                onCommentChange={setReferenceComment}
                comment={referenceComment}
              />
              <input 
                type="file" 
                id="file-input-reference" 
                className="hidden" 
                onChange={(e) => handleImageUpload('reference', e)} 
                accept="image/*" 
              />
            </div>

            {/* Design Upload Column */}
            <div className="col-span-1 border border-black p-4">
              <PodImageSection
                title="Design Upload"
                onImageUpload={() => triggerFileUpload('design')}
                isUploading={isUploading && uploadingSection === 'design'}
                imageUrl={designImage}
                onCommentChange={setDesignComment}
                comment={designComment}
              />
              <input 
                type="file" 
                id="file-input-design" 
                className="hidden" 
                onChange={(e) => handleImageUpload('design', e)} 
                accept="image/*" 
              />
            </div>

            {/* Final Design Upload Column */}
            <div className="col-span-1 border border-black p-4">
              <PodImageSection
                title="Final Design Upload"
                onImageUpload={() => triggerFileUpload('final')}
                isUploading={isUploading && uploadingSection === 'final'}
                imageUrl={finalImage}
                onCommentChange={() => {}}
                comment=""
                showSeeMore={true}
              />
              <input 
                type="file" 
                id="file-input-final" 
                className="hidden" 
                onChange={(e) => handleImageUpload('final', e)} 
                accept="image/*" 
              />
            </div>
          </div>
        </div>

        {/* Right vertical divider */}
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

export default PodStepTemplate; 