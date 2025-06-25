import React, { useState } from "react";
import domtoimage from "dom-to-image-more";
import jsPDF from "jspdf";

const DownloadPDFButton = ({ printableRef }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!printableRef.current) {
      console.error('DownloadPDFButton: printableRef.current is null');
      return;
    }
    setLoading(true);
    try {
      const element = printableRef.current;
      console.log('DownloadPDFButton: Using dom-to-image-more', element);
      const dataUrl = await domtoimage.toPng(element, { bgcolor: '#fff' });
      console.log('DownloadPDFButton: PNG generated');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const img = new window.Image();
      img.src = dataUrl;
      img.onload = function () {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth;
        const imgHeight = (img.height * imgWidth) / img.width;
        pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('project.pdf');
        setLoading(false);
        console.log('DownloadPDFButton: PDF saved successfully');
      };
      img.onerror = function (err) {
        setLoading(false);
        console.error('DownloadPDFButton: Failed to load image for PDF', err);
        alert('Failed to generate PDF. Please try again.');
      };
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