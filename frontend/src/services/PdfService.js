/**
 * PDF Statement Service
 * 
 * Generates professional PDF reports of transaction history for contacts.
 * Uses jsPDF and jspdf-autotable for document generation.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { getTransactionUIMeta } from '../utils/transactionSemantics';

// Brand colors
const BRAND_COLOR = [99, 102, 241]; // #6366f1 - Indigo/Primary
const GREEN_COLOR = [22, 163, 74];  // #16a34a - Success/Receivable
const RED_COLOR = [220, 38, 38];    // #dc2626 - Danger/Payable
const HEADER_BG = [243, 244, 246];  // #f3f4f6 - Light gray

/**
 * Sanitizes a filename by removing special characters
 * @param {string} name - The name to sanitize
 * @returns {string} - Sanitized filename
 */
const sanitizeFilename = (name) => {
  return name
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Formats a number as currency with ₹ symbol
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount) => {
  return `₹${Math.abs(parseFloat(amount)).toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

/**
 * Formats a date string as DD MMM YYYY
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string
 */
const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), 'dd MMM yyyy');
  } catch {
    return dateString;
  }
};

/**
 * Downloads a statement PDF for a contact's transaction history
 * 
 * @param {string} contactName - The name of the contact
 * @param {Array} transactions - Array of transaction objects
 * @param {number|string} netBalance - The net balance with the contact
 */
export const downloadStatement = (contactName, transactions, netBalance) => {
  // Initialize jsPDF (A4 size)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;

  // ==================== HEADER SECTION ====================
  
  // App Name (left aligned, brand color)
  doc.setFontSize(20);
  doc.setTextColor(...BRAND_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.text('CoBalance', margin, yPosition);

  // Date (right aligned)
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  const currentDate = format(new Date(), 'dd MMM yyyy');
  doc.text(`Date: ${currentDate}`, pageWidth - margin, yPosition, { align: 'right' });

  yPosition += 15;

  // Title (centered, bold)
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Statement of Account', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;

  // ==================== SUMMARY BOX SECTION ====================
  
  const boxX = margin;
  const boxY = yPosition;
  const boxWidth = pageWidth - (2 * margin);
  const boxHeight = 28;

  // Draw summary box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'FD');

  // Account of: Contact Name
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text('Account of:', boxX + 8, boxY + 10);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(contactName, boxX + 35, boxY + 10);

  // Net Balance with color coding
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Net Balance:', boxX + 8, boxY + 20);

  const balance = parseFloat(netBalance);
  const balanceText = formatCurrency(balance);
  
  // Color coding: Green for receivable (positive), Red for payable (negative)
  if (balance > 0) {
    doc.setTextColor(...GREEN_COLOR);
    doc.setFont('helvetica', 'bold');
    doc.text(`${balanceText} (You will get)`, boxX + 38, boxY + 20);
  } else if (balance < 0) {
    doc.setTextColor(...RED_COLOR);
    doc.setFont('helvetica', 'bold');
    doc.text(`${balanceText} (You owe)`, boxX + 38, boxY + 20);
  } else {
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'bold');
    doc.text(`${balanceText} (Settled)`, boxX + 38, boxY + 20);
  }

  yPosition = boxY + boxHeight + 12;

  // ==================== TRANSACTION TABLE SECTION ====================
  
  if (transactions && transactions.length > 0) {
    // Prepare table data
    const tableData = transactions.map((txn) => {
      const meta = getTransactionUIMeta(txn.transaction_type);
      const displayType = txn.transaction_type === 'credit' ? 'You Paid' : 'You Received';
      const noteText = txn.note || txn.category || '-';
      
      return [
        formatDate(txn.date),
        noteText,
        displayType,
        formatCurrency(txn.amount)
      ];
    });

    // Generate table with autoTable
    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Category/Note', 'Type', 'Amount']],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 10,
        cellPadding: 4,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: HEADER_BG,
        textColor: [50, 50, 50],
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [252, 252, 252]
      },
      columnStyles: {
        0: { cellWidth: 30 },  // Date
        1: { cellWidth: 'auto' }, // Category/Note
        2: { cellWidth: 30 },  // Type
        3: { cellWidth: 35, halign: 'right' }  // Amount
      },
      didParseCell: function(data) {
        // Apply color styling to Amount column based on transaction type
        if (data.section === 'body' && data.column.index === 3) {
          const rowIndex = data.row.index;
          const txn = transactions[rowIndex];
          if (txn) {
            // Credit (You Paid) = GREEN, Debit (You Received) = RED
            if (txn.transaction_type === 'credit') {
              data.cell.styles.textColor = GREEN_COLOR;
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.textColor = RED_COLOR;
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
        // Apply color styling to Type column
        if (data.section === 'body' && data.column.index === 2) {
          const rowIndex = data.row.index;
          const txn = transactions[rowIndex];
          if (txn) {
            if (txn.transaction_type === 'credit') {
              data.cell.styles.textColor = GREEN_COLOR;
            } else {
              data.cell.styles.textColor = RED_COLOR;
            }
          }
        }
      }
    });
  } else {
    // No transactions message
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.text('No transactions recorded.', pageWidth / 2, yPosition + 10, { align: 'center' });
  }

  // ==================== FOOTER SECTION ====================
  
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 15;
  
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  
  const timestamp = format(new Date(), 'dd MMM yyyy, hh:mm a');
  doc.text(
    `Generated by CoBalance on ${timestamp}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // ==================== SAVE/DOWNLOAD ====================
  
  const sanitizedName = sanitizeFilename(contactName);
  const dateStamp = format(new Date(), 'yyyy-MM-dd');
  const filename = `Statement_${sanitizedName}_${dateStamp}.pdf`;
  
  doc.save(filename);
};

export default {
  downloadStatement
};
