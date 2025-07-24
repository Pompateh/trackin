import React, { useState } from "react";
import domtoimage from "dom-to-image-more";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const DownloadPDFButton = ({ printableRef, className = '', style = {} }) => {
  const [loading, setLoading] = useState(false);

  const generatePDFWithDomToImage = async () => {
    const steps = Array.from(document.querySelectorAll('.printable-step'));
    if (!steps.length) throw new Error('No printable steps found');
    
    const pdf = new jsPDF({ 
      orientation: 'landscape', 
      unit: 'mm', 
      format: 'a3',
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
        width: stepWidth * 3, // Triple the resolution for ultra-high quality
        height: stepHeight * 3, // Triple the resolution for ultra-high quality
        quality: 1.0,
        imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        filter: (node) => !node.classList?.contains('no-print'),
        style: {
          transform: 'scale(3)',
          transformOrigin: 'top left',
          width: stepWidth + 'px',
          height: stepHeight + 'px'
        }
      });
      
      if (i > 0) pdf.addPage();
      // Scale image to fill the PDF page
      pdf.addImage(dataUrl, 'PNG', 0, 0, pageMmWidth, pageMmHeight, undefined, 'FAST');
    }
    
    return pdf;
  };

  const generatePDFWithHtml2Canvas = async () => {
    const steps = Array.from(document.querySelectorAll('.printable-step'));
    if (!steps.length) throw new Error('No printable steps found');
    
    const pdf = new jsPDF({ 
      orientation: 'landscape', 
      unit: 'mm', 
      format: 'a3',
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
      // Scale image to fill the PDF page
      pdf.addImage(imgData, 'PNG', 0, 0, pageMmWidth, pageMmHeight, undefined, 'FAST');
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