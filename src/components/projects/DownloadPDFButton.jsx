import React, { useState } from "react";
import domtoimage from "dom-to-image-more";
import jsPDF from "jspdf";

const DownloadPDFButton = ({ printableRef }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Select all printable steps
      const steps = Array.from(document.querySelectorAll('.printable-step'));
      if (!steps.length) throw new Error('No printable steps found');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        // Use dom-to-image-more to capture each step
        const dataUrl = await domtoimage.toPng(step, { bgcolor: '#fff', width: step.offsetWidth, height: step.offsetHeight });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        if (i > 0) pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pageHeight);
      }
      pdf.save('project.pdf');
      setLoading(false);
      console.log('DownloadPDFButton: PDF saved successfully');
    } catch (err) {
      setLoading(false);
      console.error('DownloadPDFButton: Failed to generate PDF', err);
      alert("Failed to generate PDF. Please try again.\n" + (err && err.message ? err.message : 'Unknown error'));
    }
  };

  return (
    <button onClick={handleDownload} disabled={loading} style={{ padding: '8px 16px', background: '#222', color: '#fff', borderRadius: 4 }}>
      {loading ? "Generating PDF..." : "Download PDF"}
    </button>
  );
};

export default DownloadPDFButton; 