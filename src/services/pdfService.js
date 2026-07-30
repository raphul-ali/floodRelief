import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const pdfService = {
  // Download single Victim Rescue Dispatch Card as PDF
  downloadVictimPDF: (victim) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Banner
    doc.setFillColor(185, 28, 28); // Emergency Deep Red
    doc.rect(0, 0, pageWidth, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('EMERGENCY FLOOD RESCUE DISPATCH SLIP', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ref ID: ${victim.id} | Generated: ${new Date().toLocaleString()}`, 14, 26);

    // Urgent Warning Box if rescue needed
    let startY = 40;
    if (victim.isUrgentRescue) {
      doc.setFillColor(254, 226, 226);
      doc.setDrawColor(239, 68, 68);
      doc.rect(14, startY, pageWidth - 28, 16, 'FD');

      doc.setTextColor(185, 28, 28);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CRITICAL RESCUE SIGNAL: STRANDED / IMMEDIATE EVACUATION NEEDED', 18, startY + 11);
      startY += 24;
    }

    // Victim Information Table
    autoTable(doc, {
      startY: startY,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
      head: [['Field', 'Victim Distress Details']],
      body: [
        ['Victim / Contact Person', victim.name || 'N/A'],
        ['Primary Phone', victim.phone || 'N/A'],
        ['Alternate Phone', victim.altPhone || 'None provided'],
        ['Total People Needing Aid', `${victim.peopleCount} (${victim.adultsCount || 0} Adults, ${victim.childrenCount || 0} Children/Infants)`],
        ['District / Area', victim.district || 'Unassigned'],
        ['Exact Location / Landmark', victim.locationName || 'N/A'],
        ['GPS Coordinates', victim.latitude && victim.longitude ? `${victim.latitude.toFixed(5)}, ${victim.longitude.toFixed(5)}` : 'Location not pinned'],
        ['Required Relief Supplies', Array.isArray(victim.needs) ? victim.needs.join(', ') : (victim.needs || 'N/A')],
        ['Current Status', (victim.status || 'Pending').toUpperCase()],
        ['Assigned NGO / Response Team', victim.assignedNgo || 'Unassigned'],
        ['Submission Timestamp', new Date(victim.createdAt).toLocaleString()]
      ],
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    // Emergency Details / Notes Section
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, pageWidth - 28, 30, 'F');
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Situation & Landmark Notes:', 18, currentY + 8);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(victim.details || 'No additional notes provided.', pageWidth - 36);
    doc.text(splitNotes, 18, currentY + 16);

    currentY += 38;

    // Instructions for Rescue Team
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Instructions for Rescue Team: Confirm contact via satellite/cellular before dispatch. Update rescue status in portal upon completion.', 14, currentY);

    // Save File
    doc.save(`Rescue_Dispatch_${victim.id}_${(victim.name || 'Victim').replace(/\s+/g, '_')}.pdf`);
  },

  // Download Bulk Report of Filtered Victim Requests for NGOs
  downloadBulkReportPDF: (requestsList, title = "Flood Relief Operations Report") => {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 14, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Records: ${requestsList.length} | Export Date: ${new Date().toLocaleString()}`, 14, 23);

    // Table Data mapping
    const tableHead = [['ID', 'Urgency', 'Contact Name', 'Phone', 'Location / District', 'People', 'Needs', 'Status']];
    const tableBody = requestsList.map(req => [
      req.id,
      req.isUrgentRescue ? 'CRITICAL RESCUE' : 'STANDARD AID',
      req.name,
      req.phone,
      `${req.district || ''} - ${req.locationName}`,
      `${req.peopleCount} Total`,
      Array.isArray(req.needs) ? req.needs.join(', ') : req.needs,
      req.status
    ]);

    autoTable(doc, {
      startY: 34,
      head: tableHead,
      body: tableBody,
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { fontStyle: 'bold', cellWidth: 32 },
        2: { fontStyle: 'bold', cellWidth: 35 },
        3: { cellWidth: 32 },
        4: { cellWidth: 70 },
        5: { cellWidth: 20 },
        6: { cellWidth: 45 },
        7: { fontStyle: 'bold', cellWidth: 22 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          if (data.cell.raw === 'CRITICAL RESCUE') {
            data.cell.styles.textColor = [185, 28, 28];
          }
        }
      }
    });

    doc.save(`Flood_Relief_Summary_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  }
};
