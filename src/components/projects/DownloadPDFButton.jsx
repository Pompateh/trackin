import React, { useState } from "react";
import domtoimage from "dom-to-image-more";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const DownloadPDFButton = ({ printableRef, className = '', style = {} }) => {
  const [loading, setLoading] = useState(false);

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
    
    // Create PDF with size that fits content exactly (add 10mm for margins)
    const pageWidthMm = contentWidthMm + 10;
    const pageHeightMm = contentHeightMm + 10;
    
    const pdf = new jsPDF({ 
      orientation: 'landscape', 
      unit: 'mm', 
      format: [pageWidthMm, pageHeightMm],
      compress: false // Disable compression for maximum quality
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
        finalWidth = pageMmWidth * 0.9; // 90% of page width for margins
        finalHeight = finalWidth / stepAspectRatio;
        offsetX = (pageMmWidth - finalWidth) / 2;
        offsetY = (pageMmHeight - finalHeight) / 2;
      } else {
        // Step is taller than page - fit to height
        finalHeight = pageMmHeight * 0.9; // 90% of page height for margins
        finalWidth = finalHeight * stepAspectRatio;
        offsetX = (pageMmWidth - finalWidth) / 2;
        offsetY = (pageMmHeight - finalHeight) / 2;
      }
      
      // Add image centered on page with preserved aspect ratio
      pdf.addImage(dataUrl, 'PNG', offsetX, offsetY, finalWidth, finalHeight, undefined, 'FAST');
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
    
    // Create PDF with size that fits content exactly (add 10mm for margins)
    const pageWidthMm = contentWidthMm + 10;
    const pageHeightMm = contentHeightMm + 10;
    
    const pdf = new jsPDF({ 
      orientation: 'landscape', 
      unit: 'mm', 
      format: [pageWidthMm, pageHeightMm],
      compress: false // Disable compression for maximum quality
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
        finalWidth = pageMmWidth * 0.9; // 90% of page width for margins
        finalHeight = finalWidth / stepAspectRatio;
        offsetX = (pageMmWidth - finalWidth) / 2;
        offsetY = (pageMmHeight - finalHeight) / 2;
      } else {
        // Step is taller than page - fit to height
        finalHeight = pageMmHeight * 0.9; // 90% of page height for margins
        finalWidth = finalHeight * stepAspectRatio;
        offsetX = (pageMmWidth - finalWidth) / 2;
        offsetY = (pageMmHeight - finalHeight) / 2;
      }
      
      // Add image centered on page with preserved aspect ratio
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, finalWidth, finalHeight, undefined, 'FAST');
    }
    
    return pdf;
  };

  const handleDownload = async () => {
    setLoading(true);
    
    try {
      // Pre-load all images to ensure they're ready for PDF generation
      const images = document.querySelectorAll('.printable-step img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      }));
      
      // Force a small delay to ensure all rendering is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try html2canvas first (usually better quality), fallback to dom-to-image
      let pdf;
      try {
        pdf = await generatePDFWithHtml2Canvas();
      } catch (err) {
        console.log('html2canvas failed, trying dom-to-image:', err);
        pdf = await generatePDFWithDomToImage();
      }
      
      pdf.save('project.pdf');
      console.log('DownloadPDFButton: Ultra high quality PDF saved successfully');
    } catch (err) {
      console.error('DownloadPDFButton: Failed to generate PDF', err);
      alert("Failed to generate PDF. Please try again.\n" + (err && err.message ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={className}
      style={style}
    >
      {loading ? "Generating PDF..." : "Download PDF"}
    </button>
  );
};

export default DownloadPDFButton; 