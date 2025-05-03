/**
 * Samudra Paket ERP - Waybill PDF Generator
 * Generates PDF waybill documents
 */

const fs = require('fs');
const path = require('path');
const moment = require('moment');

/**
 * Generate waybill PDF
 * @param {Object} doc - The PDF document
 * @param {Object} shipment - The shipment order
 * @param {Object} options - Generation options
 */
function generateWaybillPdf(doc, shipment, options) {
  // Set up document
  const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png');
  const hasLogo = fs.existsSync(logoPath);
  
  // Add logo if exists
  if (hasLogo) {
    doc.image(logoPath, 50, 45, { width: 150 });
  } else {
    doc.fontSize(24).font('Helvetica-Bold').text('SAMUDRA PAKET', 50, 45);
  }
  
  // Add title
  doc.fontSize(16).font('Helvetica-Bold').text('SURAT TANDA TERIMA (STT)', 50, hasLogo ? 100 : 80);
  
  // Add barcode/QR code
  if (options.barcodeImagePath) {
    doc.image(options.barcodeImagePath, 400, 45, { width: 100 });
    doc.fontSize(10).font('Helvetica').text(options.barcodeData, 400, 150, { width: 100, align: 'center' });
  }
  
  // Add waybill number
  doc.fontSize(12).font('Helvetica-Bold').text(`No. Resi: ${shipment.waybillNumber}`, 400, 170);
  
  // Add date
  const formattedDate = moment(shipment.createdAt).format('DD/MM/YYYY HH:mm');
  doc.fontSize(10).font('Helvetica').text(`Tanggal: ${formattedDate}`, 400, 190);
  
  // Add service type
  doc.fontSize(10).font('Helvetica-Bold')
    .fillColor(getServiceTypeColor(shipment.serviceType))
    .text(getServiceTypeLabel(shipment.serviceType), 400, 210, { 
      underline: true,
      width: 150,
      align: 'center' 
    })
    .fillColor('black');
  
  // Add horizontal line
  doc.moveTo(50, 230).lineTo(550, 230).stroke();
  
  // Shipper and consignee section
  doc.fontSize(11).font('Helvetica-Bold').text('PENGIRIM', 50, 250);
  doc.fontSize(11).font('Helvetica-Bold').text('PENERIMA', 300, 250);
  
  // Shipper details
  doc.fontSize(10).font('Helvetica')
    .text(`Nama: ${shipment.sender.name}`, 50, 270)
    .text(`Alamat: ${formatAddress(shipment.sender.address)}`, 50, 285, { width: 200 })
    .text(`Telepon: ${shipment.sender.phone}`, 50, 330);
  
  // Consignee details
  doc.fontSize(10).font('Helvetica')
    .text(`Nama: ${shipment.recipient.name}`, 300, 270)
    .text(`Alamat: ${formatAddress(shipment.recipient.address)}`, 300, 285, { width: 200 })
    .text(`Telepon: ${shipment.recipient.phone}`, 300, 330);
  
  // Add horizontal line
  doc.moveTo(50, 350).lineTo(550, 350).stroke();
  
  // Shipment details section
  doc.fontSize(11).font('Helvetica-Bold').text('DETAIL PENGIRIMAN', 50, 370);
  
  // Create shipment details table
  const tableTop = 390;
  const tableLeft = 50;
  const colWidth = [150, 100, 100, 150];
  const rowHeight = 20;
  
  // Table headers
  doc.fontSize(9).font('Helvetica-Bold')
    .text('Deskripsi', tableLeft, tableTop)
    .text('Berat (kg)', tableLeft + colWidth[0], tableTop)
    .text('Jumlah Koli', tableLeft + colWidth[0] + colWidth[1], tableTop)
    .text('Nilai Barang', tableLeft + colWidth[0] + colWidth[1] + colWidth[2], tableTop);
  
  // Table rows
  doc.fontSize(9).font('Helvetica')
    .text(shipment.items[0]?.description || 'Paket', tableLeft, tableTop + rowHeight)
    .text(formatWeight(shipment.totalWeight), tableLeft + colWidth[0], tableTop + rowHeight)
    .text(shipment.totalPackages || 1, tableLeft + colWidth[0] + colWidth[1], tableTop + rowHeight)
    .text(formatCurrency(shipment.declaredValue), tableLeft + colWidth[0] + colWidth[1] + colWidth[2], tableTop + rowHeight);
  
  // Add horizontal line
  doc.moveTo(50, tableTop + rowHeight * 2).lineTo(550, tableTop + rowHeight * 2).stroke();
  
  // Payment details section
  doc.fontSize(11).font('Helvetica-Bold').text('DETAIL PEMBAYARAN', 50, tableTop + rowHeight * 2 + 20);
  
  // Create payment details table
  const paymentTableTop = tableTop + rowHeight * 2 + 40;
  
  // Payment type
  doc.fontSize(10).font('Helvetica-Bold')
    .text('Jenis Pembayaran:', 50, paymentTableTop)
    .font('Helvetica')
    .text(getPaymentTypeLabel(shipment.paymentType), 150, paymentTableTop);
  
  // Shipping cost
  doc.fontSize(10).font('Helvetica-Bold')
    .text('Biaya Kirim:', 50, paymentTableTop + rowHeight)
    .font('Helvetica')
    .text(formatCurrency(shipment.shippingCost), 150, paymentTableTop + rowHeight);
  
  // Additional services
  if (shipment.additionalServices && shipment.additionalServices.length > 0) {
    doc.fontSize(10).font('Helvetica-Bold')
      .text('Layanan Tambahan:', 50, paymentTableTop + rowHeight * 2)
      .font('Helvetica');
    
    let additionalServiceY = paymentTableTop + rowHeight * 2;
    
    shipment.additionalServices.forEach((service, index) => {
      additionalServiceY += rowHeight;
      doc.text(`${service.name}: ${formatCurrency(service.cost)}`, 150, additionalServiceY);
    });
    
    // Insurance
    if (shipment.insurance && shipment.insurance.cost > 0) {
      additionalServiceY += rowHeight;
      doc.fontSize(10).font('Helvetica-Bold')
        .text('Asuransi:', 50, additionalServiceY)
        .font('Helvetica')
        .text(formatCurrency(shipment.insurance.cost), 150, additionalServiceY);
    }
    
    // Total
    doc.fontSize(10).font('Helvetica-Bold')
      .text('Total:', 50, additionalServiceY + rowHeight)
      .font('Helvetica-Bold')
      .text(formatCurrency(shipment.totalCost), 150, additionalServiceY + rowHeight);
  } else {
    // Insurance
    if (shipment.insurance && shipment.insurance.cost > 0) {
      doc.fontSize(10).font('Helvetica-Bold')
        .text('Asuransi:', 50, paymentTableTop + rowHeight * 2)
        .font('Helvetica')
        .text(formatCurrency(shipment.insurance.cost), 150, paymentTableTop + rowHeight * 2);
      
      // Total
      doc.fontSize(10).font('Helvetica-Bold')
        .text('Total:', 50, paymentTableTop + rowHeight * 3)
        .font('Helvetica-Bold')
        .text(formatCurrency(shipment.totalCost), 150, paymentTableTop + rowHeight * 3);
    } else {
      // Total
      doc.fontSize(10).font('Helvetica-Bold')
        .text('Total:', 50, paymentTableTop + rowHeight * 2)
        .font('Helvetica-Bold')
        .text(formatCurrency(shipment.totalCost), 150, paymentTableTop + rowHeight * 2);
    }
  }
  
  // Terms and conditions
  const termsY = doc.y + 30;
  doc.fontSize(8).font('Helvetica')
    .text('Syarat dan Ketentuan:', 50, termsY)
    .text('1. Dengan menyerahkan barang kepada Samudra Paket, pengirim menyetujui semua syarat dan ketentuan pengiriman.', 50, termsY + 15, { width: 500 })
    .text('2. Samudra Paket tidak bertanggung jawab atas keterlambatan, kehilangan, atau kerusakan yang disebabkan oleh keadaan di luar kendali.', 50, termsY + 30, { width: 500 })
    .text('3. Barang berharga, uang, dan dokumen penting harus diasuransikan. Klaim asuransi harus diajukan dalam waktu 7 hari.', 50, termsY + 45, { width: 500 })
    .text('4. Untuk informasi lebih lanjut, hubungi customer service kami di 021-12345678 atau kunjungi www.samudrapaket.com', 50, termsY + 60, { width: 500 });
  
  // Signature section
  const signatureY = doc.y + 30;
  
  doc.fontSize(9).font('Helvetica')
    .text('Tanda Tangan Pengirim', 50, signatureY, { width: 100, align: 'center' })
    .text('Tanda Tangan Kurir', 200, signatureY, { width: 100, align: 'center' })
    .text('Tanda Tangan Penerima', 350, signatureY, { width: 100, align: 'center' });
  
  // Signature lines
  doc.moveTo(50, signatureY + 40).lineTo(150, signatureY + 40).stroke();
  doc.moveTo(200, signatureY + 40).lineTo(300, signatureY + 40).stroke();
  doc.moveTo(350, signatureY + 40).lineTo(450, signatureY + 40).stroke();
  
  // Date
  doc.fontSize(9).font('Helvetica')
    .text('Tanggal: ___/___/______', 50, signatureY + 50, { width: 100 })
    .text('Tanggal: ___/___/______', 200, signatureY + 50, { width: 100 })
    .text('Tanggal: ___/___/______', 350, signatureY + 50, { width: 100 });
  
  // Footer
  const footerY = doc.page.height - 50;
  doc.fontSize(8).font('Helvetica')
    .text('Samudra Paket - Solusi Pengiriman Terpercaya', 50, footerY, { width: 500, align: 'center' })
    .text('Dokumen ini dibuat secara otomatis dan sah tanpa tanda tangan.', 50, footerY + 15, { width: 500, align: 'center' });
}

/**
 * Format address
 * @param {Object} address - The address object
 * @returns {string} The formatted address
 */
function formatAddress(address) {
  if (!address) return 'N/A';
  
  const parts = [
    address.street,
    address.district && `Kec. ${address.district}`,
    address.city && `${address.city}`,
    address.province && `${address.province}`,
    address.postalCode && `${address.postalCode}`,
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Format weight
 * @param {number} weight - The weight in kg
 * @returns {string} The formatted weight
 */
function formatWeight(weight) {
  if (!weight) return '0 kg';
  return `${parseFloat(weight).toFixed(1)} kg`;
}

/**
 * Format currency
 * @param {number} amount - The amount
 * @returns {string} The formatted currency
 */
function formatCurrency(amount) {
  if (!amount) return 'Rp 0';
  return `Rp ${parseInt(amount).toLocaleString('id-ID')}`;
}

/**
 * Get service type label
 * @param {string} serviceType - The service type
 * @returns {string} The service type label
 */
function getServiceTypeLabel(serviceType) {
  const labels = {
    regular: 'REGULER',
    express: 'EXPRESS',
    same_day: 'SAME DAY',
    next_day: 'NEXT DAY',
    economy: 'ECONOMY',
  };
  
  return labels[serviceType] || serviceType.toUpperCase();
}

/**
 * Get service type color
 * @param {string} serviceType - The service type
 * @returns {string} The service type color
 */
function getServiceTypeColor(serviceType) {
  const colors = {
    regular: '#2563EB', // Primary blue
    express: '#DC2626', // Red
    same_day: '#DC2626', // Red
    next_day: '#EA580C', // Orange
    economy: '#65A30D', // Green
  };
  
  return colors[serviceType] || '#2563EB';
}

/**
 * Get payment type label
 * @param {string} paymentType - The payment type
 * @returns {string} The payment type label
 */
function getPaymentTypeLabel(paymentType) {
  const labels = {
    cash: 'CASH (Tunai)',
    cod: 'COD (Bayar di Tujuan)',
    cad: 'CAD (Bayar Setelah Pengiriman)',
    credit: 'Kredit (Pelanggan Korporat)',
  };
  
  return labels[paymentType] || paymentType.toUpperCase();
}

module.exports = generateWaybillPdf;
