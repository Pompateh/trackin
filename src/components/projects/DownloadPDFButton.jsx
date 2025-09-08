import React, { useState } from "react";
import domtoimage from "dom-to-image-more";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const DownloadPDFButton = ({ printableRef, className = '', style = {} }) => {
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showStepSelector, setShowStepSelector] = useState(false);
  const [selectedSteps, setSelectedSteps] = useState([]);
  const [showConceptSelector, setShowConceptSelector] = useState(false);
  const [selectedConceptSubsections, setSelectedConceptSubsections] = useState([]);

  // Define which steps to exclude from individual printing (internal work steps)
  const EXCLUDED_STEPS = ['Q & A', 'Contract', 'Delivery'];
  
  // Concept & Direction subsections
  const CONCEPT_SUBSECTIONS = [
    'Logo', 'Typography', 'Colour', 'Illustration', 'Icon', 
    'Pattern', 'Motion', 'Photograph', 'Packaging', 'Guideline Book', 
    'P.0.S.M', 'Social Template', 'Layout'
  ];

  // Build index of printable steps by title using data attributes
  const getPrintableStepIndex = () => {
    const nodes = Array.from(document.querySelectorAll('.printable-step[data-step-title]'));
    const titleToElement = new Map();
    const ordered = [];
    nodes.forEach((el, idx) => {
      const title = el.getAttribute('data-step-title')?.trim() || '';
      if (!title) return;
      // Only keep the first page for a given section title in the index used for listing
      if (!titleToElement.has(title)) {
        titleToElement.set(title, el);
        ordered.push({ title, element: el, index: ordered.length });
      }
    });
    return { titleToElement, ordered };
  };

  // Get all available steps (excluding internal work steps)
  const getAvailableSteps = () => {
    const { ordered } = getPrintableStepIndex();
    const steps = ordered.filter(s => !EXCLUDED_STEPS.includes(s.title));
    return steps;
  };

  // Get Concept & Direction steps (main section + selected subsections) via data attributes
  const getConceptDirectionSteps = () => {
    const nodes = Array.from(document.querySelectorAll('.printable-step[data-step-title]'));
    // Include the main Concept & Direction page + selected subsections (first page of each)
    const wantedTitles = new Set(['Concept & Direction', ...selectedConceptSubsections]);
    const seen = new Set();
    const steps = [];
    for (const el of nodes) {
      const title = el.getAttribute('data-step-title')?.trim();
      if (!title || !wantedTitles.has(title)) continue;
      if (seen.has(title)) continue; // first page only per title
      seen.add(title);
      steps.push(el);
    }
    return steps;
  };

  // Generate PDF for individual selected steps
  const generateIndividualStepsPDF = async (steps) => {
    if (!steps.length) throw new Error('No steps selected');
    
    console.log(`Starting PDF generation for ${steps.length} steps`);
    
    // Validate each step before PDF generation
    const validSteps = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepTitle = getStepTitleByElement(step, i);
      
      console.log(`\n--- Validating Step ${i + 1}: ${stepTitle} ---`);
      
      // Check if step has visible content
      const hasVisibleContent = await validateStepForPDF(step, stepTitle);
      
      if (hasVisibleContent) {
        validSteps.push({ element: step, title: stepTitle, index: i });
        console.log(`✅ Step "${stepTitle}" is ready for PDF generation`);
      } else {
        console.warn(`❌ Step "${stepTitle}" has no visible content - skipping`);
      }
    }
    
    if (validSteps.length === 0) {
      throw new Error('No steps with visible content found for PDF generation');
    }
    
    console.log(`\nGenerating PDF for ${validSteps.length} valid steps`);
    
    // Calculate the exact content dimensions needed for proper sizing
    let maxContentHeight = 0;
    let maxContentWidth = 0;
    
    validSteps.forEach(stepData => {
      const step = stepData.element;
      const stepWidth = step.offsetWidth;
      const stepHeight = step.offsetHeight;
      maxContentHeight = Math.max(maxContentHeight, stepHeight);
      maxContentWidth = Math.max(maxContentWidth, stepWidth);
    });
    
    // Convert pixels to mm (assuming 96 DPI: 1 inch = 25.4mm, 1 inch = 96px)
    const contentWidthMm = (maxContentWidth / 96) * 25.4;
    const contentHeightMm = (maxContentHeight / 96) * 25.4;
    
    // Create PDF with size that fits content exactly (minimal margins)
    const pageWidthMm = contentWidthMm + 2;
    const pageHeightMm = contentHeightMm + 2;
    
    const pdf = new jsPDF({ 
      orientation: 'landscape', 
      unit: 'mm', 
      format: [pageWidthMm, pageHeightMm],
      compress: true, // Enable compression for better file size
      precision: 16 // Higher precision for better scaling
    });
    
    for (let i = 0; i < validSteps.length; i++) {
      const stepData = validSteps[i];
      const step = stepData.element;
      const stepTitle = stepData.title;
      
      console.log(`\n--- Generating PDF Page ${i + 1}: ${stepTitle} ---`);
      
      const stepWidth = step.offsetWidth;
      const stepHeight = step.offsetHeight;
      const pageMmWidth = pdf.internal.pageSize.getWidth();
      const pageMmHeight = pdf.internal.pageSize.getHeight();
      
      // Force a small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Try to capture the step content
      let dataUrl;
      try {
        dataUrl = await domtoimage.toPng(step, { 
          bgcolor: '#fff', 
          style: { background: '#fff' }, 
          width: stepWidth * 2, // Double resolution for better quality
          height: stepHeight * 2,
          quality: 1.0,
          imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          filter: (node) => !node.classList?.contains('no-print'),
          style: {
            transform: 'scale(2)',
            transformOrigin: 'top left',
            width: stepWidth + 'px',
            height: stepHeight + 'px'
          }
        });
        
        console.log(`✅ Successfully captured step "${stepTitle}" (${stepWidth}x${stepHeight})`);
      } catch (captureError) {
        console.error(`❌ Failed to capture step "${stepTitle}":`, captureError);
        
        // Try alternative capture method
        try {
          console.log(`🔄 Trying alternative capture method for "${stepTitle}"`);
          dataUrl = await html2canvas(step, {
            backgroundColor: '#ffffff',
            logging: false,
            width: stepWidth,
            height: stepHeight,
            imageTimeout: 30000,
            removeContainer: true,
            foreignObjectRendering: true,
            ignoreElements: (element) => element.classList?.contains('no-print'),
            imageRendering: 'high-quality',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
            allowTaint: true,
            useCORS: true,
            scrollX: 0,
            scrollY: 0,
            windowWidth: stepWidth,
            windowHeight: stepHeight
          }).then(canvas => canvas.toDataURL('image/png', 1.0));
          
          console.log(`✅ Alternative capture successful for "${stepTitle}"`);
        } catch (altError) {
          console.error(`❌ Alternative capture also failed for "${stepTitle}":`, altError);
          throw new Error(`Failed to capture step "${stepTitle}" for PDF generation`);
        }
      }
      
      if (i > 0) pdf.addPage();
      
      // Calculate dimensions to maintain aspect ratio and center content
      const stepAspectRatio = stepWidth / stepHeight;
      const pageAspectRatio = pageMmWidth / pageMmHeight;
      
      let finalWidth, finalHeight, offsetX, offsetY;
      
      if (stepAspectRatio > pageAspectRatio) {
        finalWidth = pageMmWidth * 0.98;
        finalHeight = finalWidth / stepAspectRatio;
        offsetX = (pageMmWidth - finalWidth) / 2;
        offsetY = (pageMmHeight - finalHeight) / 2;
      } else {
        finalHeight = pageMmHeight * 0.98;
        finalWidth = finalHeight * stepAspectRatio;
        offsetX = (pageMmWidth - finalWidth) / 2;
        offsetY = (pageMmHeight - finalHeight) / 2;
      }
      
      // Add image to PDF with proper aspect ratio preservation
      pdf.addImage(dataUrl, 'PNG', offsetX, offsetY, finalWidth, finalHeight, undefined, 'FAST');
      
      // Set PDF properties for better scaling behavior
      pdf.setProperties({
        title: `Step: ${stepTitle}`,
        subject: 'Project Step',
        author: 'Project System',
        creator: 'Project System',
        producer: 'jsPDF'
      });
      
      console.log(`✅ Added step "${stepTitle}" to PDF page ${i + 1}`);
    }
    
    console.log(`\n🎉 PDF generation completed successfully for ${validSteps.length} steps`);
    return pdf;
  };

  // Get step title by element (prefer data attribute)
  const getStepTitleByElement = (element, index) => {
    const dataTitle = element.getAttribute?.('data-step-title');
    if (dataTitle) return dataTitle;
    const titleElement = element.querySelector?.('h1, h2, h3, h4, h5, h6, [class*="title"]');
    if (titleElement) return titleElement.textContent.trim();
    return `Step ${index + 1}`;
  };

  // Validate step for PDF generation
  const validateStepForPDF = async (step, stepTitle) => {
    console.log(`Validating step "${stepTitle}" for PDF generation...`);
    
    // Check dimensions
    if (step.offsetWidth < 100 || step.offsetHeight < 100) {
      console.log(`❌ Step "${stepTitle}" has invalid dimensions: ${step.offsetWidth}x${step.offsetHeight}`);
      return false;
    }
    
    // Check for visible content
    const hasImages = step.querySelectorAll('img').length > 0;
    const hasTextElements = step.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, span, canvas, input, textarea').length > 0;
    const hasCanvas = step.querySelectorAll('canvas').length > 0;
    const hasInputs = step.querySelectorAll('input, textarea').length > 0;
    
    // Check HTML content
    const innerHTML = step.innerHTML?.trim();
    const hasHTMLContent = innerHTML && innerHTML.length > 100;
    
    // Check text content
    const textContent = step.textContent?.trim();
    const hasTextContent = textContent && textContent.length > 0;
    
    console.log(`Step "${stepTitle}" content check:`, {
      dimensions: `${step.offsetWidth}x${step.offsetHeight}`,
      hasImages,
      hasTextElements,
      hasCanvas,
      hasInputs,
      hasHTMLContent: hasHTMLContent ? `Yes (${innerHTML.length} chars)` : 'No',
      hasTextContent: hasTextContent ? `Yes ("${textContent.substring(0, 50)}...")` : 'No'
    });
    
    // A step is valid if it has any content
    const hasContent = hasImages || hasTextElements || hasCanvas || hasInputs || hasHTMLContent || hasTextContent;
    
    if (!hasContent) {
      console.log(`❌ Step "${stepTitle}" has no content at all`);
      return false;
    }
    
    // Force a small delay to ensure content is rendered
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Additional check: verify content is actually visible
    const computedStyle = window.getComputedStyle(step);
    const isVisible = computedStyle.display !== 'none' && 
                     computedStyle.visibility !== 'hidden' && 
                     computedStyle.opacity !== '0';
    
    if (!isVisible) {
      console.log(`❌ Step "${stepTitle}" is not visible (display: ${computedStyle.display}, visibility: ${computedStyle.visibility}, opacity: ${computedStyle.opacity})`);
      return false;
    }
    
    console.log(`✅ Step "${stepTitle}" is valid and visible for PDF generation`);
    return true;
  };

  // Handle individual steps PDF generation
  const handleIndividualStepsPDF = async () => {
    setLoading(true);
    try {
      const availableSteps = getAvailableSteps();
      if (selectedSteps.length === 0) {
        alert('Please select at least one step to print.');
        setLoading(false);
        return;
      }
      
      // Map selected indices to elements directly
      const stepsToPrint = selectedSteps.map(selIdx => {
        const step = availableSteps.find(s => s.index === selIdx);
        return step?.element || null;
      }).filter(Boolean);
      
      if (stepsToPrint.length === 0) {
        alert('Could not find the selected steps to print. Please try again.');
        setLoading(false);
        return;
      }
      
      const pdf = await generateIndividualStepsPDF(stepsToPrint);
      pdf.save('individual-steps.pdf');
      setShowStepSelector(false);
      setShowOptions(false);
    } catch (err) {
      console.error('Failed to generate individual steps PDF:', err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Concept & Direction PDF generation
  const handleConceptDirectionPDF = async () => {
    setLoading(true);
    try {
      const steps = getConceptDirectionSteps();
      if (!steps || steps.length === 0) {
        alert('No Concept & Direction steps found to print.');
        setLoading(false);
        return;
      }
      const pdf = await generateIndividualStepsPDF(steps);
      pdf.save('concept-direction.pdf');
      setShowConceptSelector(false);
      setShowOptions(false);
    } catch (err) {
      console.error('Failed to generate Concept & Direction PDF:', err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDFWithDomToImage = async () => {
    const steps = Array.from(document.querySelectorAll('.printable-step'));
    if (!steps.length) throw new Error('No printable steps found');
    
    // Calculate the exact content dimensions needed for proper sizing
    let maxContentHeight = 0;
    let maxContentWidth = 0;
    
    steps.forEach(step => {
      const stepWidth = step.offsetWidth;
      const stepHeight = step.offsetHeight;
      maxContentHeight = Math.max(maxContentHeight, stepHeight);
      maxContentWidth = Math.max(maxContentWidth, stepWidth);
    });
    
    // Convert pixels to mm (assuming 96 DPI: 1 inch = 25.4mm, 1 inch = 96px)
    const contentWidthMm = (maxContentWidth / 96) * 25.4;
    const contentHeightMm = (maxContentHeight / 96) * 25.4;
    
    // Create PDF with size that fits content exactly (minimal margins)
    const pageWidthMm = contentWidthMm + 2;
    const pageHeightMm = contentHeightMm + 2;
    
    const pdf = new jsPDF({ 
      orientation: 'landscape', 
      unit: 'mm', 
      format: [pageWidthMm, pageHeightMm],
      compress: true, // Enable compression for better file size
      precision: 16 // Higher precision for better scaling
    });
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepWidth = step.offsetWidth;
      const stepHeight = step.offsetHeight;
      const pageMmWidth = pdf.internal.pageSize.getWidth();
      const pageMmHeight = pdf.internal.pageSize.getHeight();
      
      const dataUrl = await domtoimage.toPng(step, { 
        bgcolor: '#fff', 
        style: { background: '#fff' }, 
        width: stepWidth * 4, // Triple the resolution for ultra-high quality
        height: stepHeight * 4, // Triple the resolution for ultra-high quality
        quality: 1.0,
        imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        filter: (node) => !node.classList?.contains('no-print'),
        style: {
          transform: 'scale(4)',
          transformOrigin: 'top left',
          width: stepWidth + 'px',
          height: stepHeight + 'px'
        }
      });
      
      if (i > 0) pdf.addPage();
      
      // Calculate dimensions to maintain aspect ratio and center content
      const stepAspectRatio = stepWidth / stepHeight;
      const pageAspectRatio = pageMmWidth / pageMmHeight;
      
      let finalWidth, finalHeight, offsetX, offsetY;
      
      if (stepAspectRatio > pageAspectRatio) {
        // Step is wider than page - fit to width
        finalWidth = pageMmWidth * 0.98; // Minimal margins (98% of page width)
        finalHeight = finalWidth / stepAspectRatio;
        offsetX = (pageMmWidth - finalWidth) / 2;
        offsetY = (pageMmHeight - finalHeight) / 2;
      } else {
        // Step is taller than page - fit to height
        finalHeight = pageMmHeight * 0.98; // Minimal margins (98% of page height)
        finalWidth = finalHeight * stepAspectRatio;
        offsetX = (pageMmWidth - finalWidth) / 2;
        offsetY = (pageMmHeight - finalHeight) / 2;
      }
      
      // Add image centered on page with preserved aspect ratio
      // Use 'FAST' compression and ensure proper scaling
      pdf.addImage(dataUrl, 'PNG', offsetX, offsetY, finalWidth, finalHeight, undefined, 'FAST');
      
      // Add a comment to the PDF to help with scaling behavior
      pdf.setProperties({
        title: `Step: ${stepTitle}`,
        subject: 'Project Step',
        author: 'Project System',
        creator: 'Project System',
        producer: 'jsPDF'
      });
    }
    
    return pdf;
  };

  const generatePDFWithHtml2Canvas = async () => {
    const steps = Array.from(document.querySelectorAll('.printable-step'));
    if (!steps.length) throw new Error('No printable steps found');
    
    // Calculate the exact content dimensions needed for proper sizing
    let maxContentHeight = 0;
    let maxContentWidth = 0;
    
    steps.forEach(step => {
      const stepWidth = step.offsetWidth;
      const stepHeight = step.offsetHeight;
      maxContentHeight = Math.max(maxContentHeight, stepHeight);
      maxContentWidth = Math.max(maxContentWidth, stepWidth);
    });
    
    // Convert pixels to mm (assuming 96 DPI: 1 inch = 25.4mm, 1 inch = 96px)
    const contentWidthMm = (maxContentWidth / 96) * 25.4;
    const contentHeightMm = (maxContentHeight / 96) * 25.4;
    
    // Create PDF with size that fits content exactly (minimal margins)
    const pageWidthMm = contentWidthMm + 2;
    const pageHeightMm = contentHeightMm + 2;
    
    const pdf = new jsPDF({ 
      orientation: 'landscape', 
      unit: 'mm', 
      format: [pageWidthMm, pageHeightMm],
      compress: true, // Enable compression for better file size
      precision: 16 // Higher precision for better scaling
    });
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepWidth = step.offsetWidth;
      const stepHeight = step.offsetHeight;
      const pageMmWidth = pdf.internal.pageSize.getWidth();
      const pageMmHeight = pdf.internal.pageSize.getHeight();
      
      const canvas = await html2canvas(step, {
        scale: 3, // Triple scale for ultra-high quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: stepWidth,
        height: stepHeight,
        imageTimeout: 30000, // Increased timeout for higher quality processing
        removeContainer: true,
        foreignObjectRendering: true,
        ignoreElements: (element) => element.classList?.contains('no-print'),
        imageRendering: 'high-quality',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
        allowTaint: true,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: stepWidth,
        windowHeight: stepHeight
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      if (i > 0) pdf.addPage();
      
      // Calculate dimensions to maintain aspect ratio and center content
      const stepAspectRatio = stepWidth / stepHeight;
      const pageAspectRatio = pageMmWidth / pageMmHeight;
      
      let finalWidth, finalHeight, offsetX, offsetY;
      
      if (stepAspectRatio > pageAspectRatio) {
        // Step is wider than page - fit to width
        finalWidth = pageMmWidth * 0.98; // Minimal margins (98% of page width)
        finalHeight = finalWidth / stepAspectRatio;
        offsetX = (pageMmWidth - finalWidth) / 2;
        offsetY = (pageMmHeight - finalHeight) / 2;
      } else {
        // Step is taller than page - fit to height
        finalHeight = pageMmHeight * 0.98; // Minimal margins (98% of page height)
        finalWidth = finalHeight * stepAspectRatio;
        offsetX = (pageMmWidth - finalWidth) / 2;
        offsetY = (pageMmHeight - finalHeight) / 2;
      }
      
      // Add image centered on page with preserved aspect ratio
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, finalWidth, finalHeight, undefined, 'FAST');
      
      // Set PDF properties for better scaling behavior
      pdf.setProperties({
        title: `Step ${i + 1}`,
        subject: 'Project Step',
        author: 'Project System',
        creator: 'Project System',
        producer: 'jsPDF'
      });
    }
    
    return pdf;
  };

  const handleDownload = async () => {
    setShowOptions(true);
  };

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={loading}
        className={className}
        style={style}
      >
        {loading ? "Generating PDF..." : "Download PDF"}
      </button>

      {/* PDF Options Modal */}
      {showOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl border border-black rounded-none" style={{boxShadow: 'none'}}>
            <div className="border-b border-black px-4 sm:px-6 py-4 relative">
              <h3
                className="font-serif font-extralight text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center"
                style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250 }}
              >
                Choose PDF Option
              </h3>
              <button
                onClick={() => setShowOptions(false)}
                aria-label="Close"
                className="absolute right-3 top-3 font-gothic text-2xl leading-none hover:bg-gray-100 px-2"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col sm:flex-row w-full">
              <button
                onClick={() => {
                  setShowOptions(false);
                  setShowStepSelector(true);
                }}
                className="custom-action-btn font-serif font-extralight text-sm sm:text-base md:text-xl lg:text-2xl border-b border-r border-black rounded-none px-2 sm:px-0 py-4 sm:py-6 bg-white hover:bg-gray-100 transition w-full sm:w-1/2"
                style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250, minWidth: 0, borderLeft: 'none', borderTop: 'none', borderRadius: 0, borderRight: '1px solid #000', borderBottom: '1px solid #000' }}
              >
                Individual Steps
              </button>
              <button
                onClick={() => {
                  setShowOptions(false);
                  setShowConceptSelector(true);
                }}
                className="custom-action-btn font-serif font-extralight text-sm sm:text-base md:text-xl lg:text-2xl border-b border-black rounded-none px-2 sm:px-0 py-4 sm:py-6 bg-white hover:bg-gray-100 transition w-full sm:w-1/2"
                style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250, minWidth: 0, borderLeft: 'none', borderTop: 'none', borderRadius: 0, borderRight: 'none', borderBottom: '1px solid #000' }}
              >
                Concept & Direction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Steps Selection Modal */}
      {showStepSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl border border-black rounded-none" style={{boxShadow: 'none'}}>
            <div className="border-b border-black px-4 sm:px-6 py-4 relative">
              <h3
                className="font-serif font-extralight text-2xl sm:text-3xl md:text-4xl text-center"
                style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250 }}
              >
                Select Steps to Print
              </h3>
              <button
                onClick={() => { setShowStepSelector(false); setSelectedSteps([]); }}
                aria-label="Close"
                className="absolute right-3 top-3 font-gothic text-2xl leading-none hover:bg-gray-100 px-2"
              >
                ×
              </button>
            </div>
            <div className="px-4 sm:px-6 py-4">
              <p className="text-sm text-gray-600 mb-4 font-gothic">
                Select the steps you want to include (Q&A, Contract, Delivery are excluded).
              </p>
              <div className="max-h-80 overflow-auto border border-black">
                {getAvailableSteps().length > 0 ? (
                  getAvailableSteps().map((step) => (
                    <label key={step.index} className="flex items-center justify-between px-3 py-3 border-b border-black last:border-b-0">
                      <span className="font-gothic text-lg">{step.title}</span>
                      <input
                        type="checkbox"
                        checked={selectedSteps.includes(step.index)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSteps([...selectedSteps, step.index]);
                          } else {
                            setSelectedSteps(selectedSteps.filter(i => i !== step.index));
                          }
                        }}
                        className="rounded"
                      />
                    </label>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 font-gothic">
                    No steps found.
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row w-full">
              <button
                onClick={handleIndividualStepsPDF}
                disabled={selectedSteps.length === 0 || loading}
                className="custom-action-btn font-serif font-extralight text-sm sm:text-base md:text-xl border-t border-r border-black rounded-none px-2 sm:px-0 py-4 sm:py-6 bg-white hover:bg-gray-100 transition w-full sm:w-1/2 disabled:opacity-50"
                style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250, minWidth: 0, borderLeft: 'none', borderBottom: 'none', borderRadius: 0, borderRight: '1px solid #000' }}
              >
                {loading ? "Generating..." : "Generate PDF"}
              </button>
              <button
                onClick={() => { setShowStepSelector(false); setSelectedSteps([]); }}
                className="custom-action-btn font-serif font-extralight text-sm sm:text-base md:text-xl border-t border-black rounded-none px-2 sm:px-0 py-4 sm:py-6 bg-white hover:bg-gray-100 transition w-full sm:w-1/2"
                style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250, minWidth: 0, borderLeft: 'none', borderBottom: 'none', borderRadius: 0, borderRight: 'none' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Concept & Direction Subsection Selection Modal */}
      {showConceptSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl border border-black rounded-none" style={{boxShadow: 'none'}}>
            <div className="border-b border-black px-4 sm:px-6 py-4 relative">
              <h3
                className="font-serif font-extralight text-2xl sm:text-3xl md:text-4xl text-center"
                style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250 }}
              >
                Concept & Direction
              </h3>
              <button
                onClick={() => { setShowConceptSelector(false); setSelectedConceptSubsections([]); }}
                aria-label="Close"
                className="absolute right-3 top-3 font-gothic text-2xl leading-none hover:bg-gray-100 px-2"
              >
                ×
              </button>
            </div>
            <div className="px-4 sm:px-6 py-4">
              <p className="text-sm text-gray-600 mb-3 font-gothic">
                The main section is always included. Select subsections to include:
              </p>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedConceptSubsections.length === CONCEPT_SUBSECTIONS.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedConceptSubsections([...CONCEPT_SUBSECTIONS]);
                      else setSelectedConceptSubsections([]);
                    }}
                    className="rounded"
                  />
                  <span className="font-gothic">Select all</span>
                </label>
                {selectedConceptSubsections.length > 0 && selectedConceptSubsections.length < CONCEPT_SUBSECTIONS.length && (
                  <button onClick={() => setSelectedConceptSubsections([...CONCEPT_SUBSECTIONS])} className="text-sm text-blue-600 underline font-gothic">
                    Select remaining
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-auto border border-black">
                {CONCEPT_SUBSECTIONS.map((subsection) => (
                  <label key={subsection} className="flex items-center justify-between px-3 py-3 border-b border-black last:border-b-0">
                    <span className="font-gothic text-lg">{subsection}</span>
                    <input
                      type="checkbox"
                      checked={selectedConceptSubsections.includes(subsection)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedConceptSubsections([...selectedConceptSubsections, subsection]);
                        else setSelectedConceptSubsections(selectedConceptSubsections.filter(s => s !== subsection));
                      }}
                      className="rounded"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row w-full">
              <button
                onClick={handleConceptDirectionPDF}
                disabled={loading}
                className="custom-action-btn font-serif font-extralight text-sm sm:text-base md:text-xl border-t border-r border-black rounded-none px-2 sm:px-0 py-4 sm:py-6 bg-white hover:bg-gray-100 transition w-full sm:w-1/2 disabled:opacity-50"
                style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250, minWidth: 0, borderLeft: 'none', borderBottom: 'none', borderRadius: 0, borderRight: '1px solid #000' }}
              >
                {loading ? "Generating..." : "Generate PDF"}
              </button>
              <button
                onClick={() => { setShowConceptSelector(false); setSelectedConceptSubsections([]); }}
                className="custom-action-btn font-serif font-extralight text-sm sm:text-base md:text-xl border-t border-black rounded-none px-2 sm:px-0 py-4 sm:py-6 bg-white hover:bg-gray-100 transition w-full sm:w-1/2"
                style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 250, minWidth: 0, borderLeft: 'none', borderBottom: 'none', borderRadius: 0, borderRight: 'none' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DownloadPDFButton; 