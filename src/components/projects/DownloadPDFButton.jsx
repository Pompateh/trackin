import React, { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const DownloadPDFButton = ({ printableRef }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!printableRef.current) return;
    setLoading(true);
    try {
      const element = printableRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("project.pdf");
    } catch (err) {
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDownload} disabled={loading} style={{ padding: '8px 16px', background: '#222', color: '#fff', borderRadius: 4 }}>
      {loading ? "Generating PDF..." : "Download PDF"}
    </button>
  );
};

export default DownloadPDFButton; 