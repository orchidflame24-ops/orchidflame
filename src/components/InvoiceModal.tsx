import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faPrint,
  faShareNodes,
  faXmark,
  faCircleCheck,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import { Order } from '../types';

interface InvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

function numberToWords(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const rounded = Math.round(num);
  const n = ('000000000' + rounded).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return 'Zero Rupees Only';
  let str = '';
  str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
  str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
  str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
  str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
  str += Number(n[5]) !== 0 ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) : '';
  return str.trim() ? `${str.trim()} Rupees Only` : 'Zero Rupees Only';
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoiceHTML = () => {
    if (!invoiceRef.current) return;

    // Convert logo image to base64 Data URI so it displays anywhere offline
    const img = invoiceRef.current.querySelector('img');
    let logoDataUrl = '';
    if (img) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 200;
        canvas.height = img.naturalHeight || 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          logoDataUrl = canvas.toDataURL('image/png');
        }
      } catch (err) {
        console.warn('Could not extract image data URI', err);
      }
    }

    let invoiceContent = invoiceRef.current.innerHTML;
    if (logoDataUrl) {
      invoiceContent = invoiceContent.replace(/src="\/orchid-flame-logo\.png"/g, `src="${logoDataUrl}"`);
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice - ${order.invoiceNumber} | Orchid Flame</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f5f5f4;
      color: #1c1917;
      font-size: 11px;
      line-height: 1.5;
      padding: 24px 12px;
    }
    .invoice-page-container {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #d6d3d1;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    }
    .font-serif {
      font-family: 'Playfair Display', Georgia, Cambria, serif !important;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border-color: #d6d3d1 !important;
    }
    svg {
      display: inline-block;
      vertical-align: middle;
      fill: currentColor;
    }
    .download-action-bar {
      max-width: 860px;
      margin: 0 auto 16px auto;
      background: #1c1816;
      color: #fafaf9;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }
    .btn-print {
      background: #c29b64;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      cursor: pointer;
      border-radius: 2px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .btn-print:hover {
      background: #a8824f;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .download-action-bar {
        display: none !important;
      }
      .invoice-page-container {
        border: none !important;
        box-shadow: none !important;
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 !important;
      }
    }
  </style>
</head>
<body>
  <!-- Standalone Header with quick Print/PDF action -->
  <div class="download-action-bar no-print">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #c29b64;">
        🌸 Orchid Flame Official Tax Invoice
      </span>
      <span style="color: #a8a29e; font-size: 11px;">• Invoice No: ${order.invoiceNumber}</span>
    </div>
    <button onclick="window.print()" class="btn-print">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="invoice-page-container">
    ${invoiceContent}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${order.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareWhatsApp = () => {
    const text = `🌸 *TAX INVOICE - ORCHID FLAME* 🌸\n` +
      `Invoice No: ${order.invoiceNumber}\n` +
      `Order ID: #${order.id}\n` +
      `Customer: ${order.address.fullName}\n` +
      `Total Amount: ₹${order.grandTotal}\n` +
      `Payment Mode: ${order.paymentMethod === 'upi' ? 'UPI Online' : 'Cash on Delivery (COD)'}\n` +
      `Status: ${order.paymentStatus === 'paid' ? 'Paid & Verified' : 'Confirmed'}\n\n` +
      `Thank you for choosing Orchid Flame Luxury Scented Candles.`;
    window.open(`https://wa.me/919026006766?text=${encodeURIComponent(text)}`, '_blank');
  };

  const taxableSubtotal = Math.round((order.subtotal / 1.18) * 100) / 100;
  const totalGst = Math.round((order.subtotal - taxableSubtotal) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst / 2) * 100) / 100;

  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = orderDate.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static" id="invoice-modal-root">

      <div className="relative w-full max-w-4xl bg-white shadow-2xl rounded-none sm:rounded-md border-0 sm:border border-stone-300 overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none print:w-full">

        {/* Action Header Bar (Hidden during print) */}
        <div className="bg-[#1C1816] text-stone-100 px-3.5 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#825936]/40 print:hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <FontAwesomeIcon icon={faShieldHalved} className="text-[#C29B64] text-xs sm:text-sm flex-shrink-0" />
            <span className="font-serif text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-semibold text-white truncate">
              Tax Invoice · {order.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 bg-[#C29B64] hover:bg-[#a8824f] text-white text-[11px] sm:text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-1.5 cursor-pointer rounded-xs"
              title="Print or Save as PDF"
            >
              <FontAwesomeIcon icon={faPrint} className="text-xs" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadInvoiceHTML}
              className="px-2.5 sm:px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] sm:text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-1.5 cursor-pointer rounded-xs border border-stone-600"
              title="Download Invoice File"
            >
              <FontAwesomeIcon icon={faDownload} className="text-xs" />
              <span>Download</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-2.5 sm:px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] sm:text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-1.5 cursor-pointer rounded-xs"
              title="Send to WhatsApp"
            >
              <FontAwesomeIcon icon={faShareNodes} className="text-xs" />
              <span className="hidden xs:inline">WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded transition-colors cursor-pointer ml-0.5"
              aria-label="Close modal"
            >
              <FontAwesomeIcon icon={faXmark} className="text-sm" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE CONTENT (MATCHING REFERENCE IMAGE 1:1) */}
        <div
          ref={invoiceRef}
          className="p-3.5 xs:p-5 sm:p-10 text-stone-900 font-sans text-xs bg-white space-y-4 sm:space-y-5 print:p-6"
          id="invoice-document"
        >

          {/* 1. Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-stone-300">

            {/* Left: Brand Identity & Registered Office */}
            <div className="flex items-start gap-3.5 max-w-lg text-left">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-stone-300 bg-white flex-shrink-0 p-0.5 shadow-2xs">
                <img
                  src="/orchid-flame-logo.png"
                  alt="Orchid Flame Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div className="space-y-1">
                <h1 className="font-serif text-2xl font-normal tracking-[0.18em] uppercase text-stone-950 leading-tight">
                  ORCHID FLAME
                </h1>
                <p className="text-[10px] font-bold tracking-wider uppercase text-stone-800">
                  ORCHID FLAME LUXURY HOME FRAGRANCES PVT. LTD.
                </p>
                <div className="text-stone-600 text-[11px] leading-relaxed pt-1 space-y-0.5">
                  <p>Studio 14, The Heritage Mews, Mehrauli Heritage Corridor,</p>
                  <p>New Delhi, Delhi - 110030, India</p>
                  <p><b>GSTIN:</b> 07AAFC09821M1Z5 | <b>CIN:</b> U74999DL2024PTC109822</p>
                  <p><b>Email:</b> orchidflame24@gmail.com</p>
                  <p><b>Helpline:</b> +91 90260 06766</p>
                </div>
              </div>
            </div>

            {/* Right: Tax Invoice Details & Meta */}
            <div className="text-left sm:text-right space-y-1 sm:self-start min-w-[210px]">
              <div className="inline-block bg-stone-200 text-stone-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xs mb-1">
                TAX INVOICE
              </div>
              <p className="text-xs">
                <span className="font-bold text-stone-900">Invoice No: {order.invoiceNumber}</span>
              </p>
              <p className="text-xs text-stone-700">Order ID: #{order.id}</p>
              <p className="text-stone-600 text-[11px]">Date: {formattedDate} at {formattedTime}</p>
              <p className="text-stone-600 text-[11px]">Place of Supply: {order.address.state || 'Delhi'} (India)</p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-stone-200 text-stone-800 rounded-xs">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-[10px] text-stone-700" />
                  <span>{order.paymentMethod === 'upi' ? 'UPI Verified' : 'Cash On Delivery'}</span>
                </span>
              </div>
            </div>

          </div>

          {/* 2. Billed To & Shipping Side-by-Side (Matching Image 1:1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">

            {/* Box 1: Billed To / Customer */}
            <div className="border border-stone-300">
              <div className="bg-[#f5f5f4] px-3 py-1.5 border-b border-stone-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700">
                  BILLED TO / CUSTOMER
                </span>
              </div>
              <div className="p-3 text-[11px] leading-relaxed space-y-1">
                <p className="font-bold text-stone-950 text-xs">{order.address.fullName}</p>
                <p className="text-stone-700">
                  {order.address.addressLine1}
                  {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ''}
                  {order.address.landmark ? `, Landmark: ${order.address.landmark}` : ''}
                </p>
                <p className="text-stone-700">
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
                <p className="text-stone-700 pt-0.5">
                  <b>Phone:</b> {order.address.phone} | <b>Email:</b> {order.address.email}
                </p>
              </div>
            </div>

            {/* Box 2: Shipping & Delivery */}
            <div className="border border-stone-300">
              <div className="bg-[#f5f5f4] px-3 py-1.5 border-b border-stone-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700">
                  SHIPPING & DELIVERY
                </span>
              </div>
              <div className="p-3 text-[11px] leading-relaxed space-y-1">
                <p className="text-stone-900 font-medium">Priority Fragrance Courier (Air Express)</p>
                <p className="text-stone-700">Address Type: {order.address.addressType.toUpperCase()}</p>
                <p className="text-stone-700">Estimated Delivery: 3 - 5 Business Days</p>
                <p className="text-stone-700">
                  Payment Mode: {order.paymentMethod === 'upi'
                    ? `UPI Online (UTR: ${order.upiTransactionId || 'UPI_APP_PAID'})`
                    : 'Cash on Delivery (COD)'}
                </p>
              </div>
            </div>

          </div>

          {/* 3. Itemized Table (Matching Image 1:1) */}
          <div className="border border-stone-300 overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full min-w-[560px] text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-[#f5f5f4] border-b border-stone-300 text-stone-600 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-3 border-r border-stone-300 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 border-r border-stone-300">DESCRIPTION</th>
                  <th className="py-2.5 px-3 border-r border-stone-300 w-24 text-center">HSN</th>
                  <th className="py-2.5 px-3 border-r border-stone-300 w-14 text-center">QTY</th>
                  <th className="py-2.5 px-3 border-r border-stone-300 w-24 text-right">UNIT PRICE (₹)</th>
                  <th className="py-2.5 px-3 border-r border-stone-300 w-24 text-right">TAXABLE (₹)</th>
                  <th className="py-2.5 px-3 border-r border-stone-300 w-24 text-right">GST (18%)</th>
                  <th className="py-2.5 px-3 w-24 text-right">TOTAL (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-300 text-stone-800">
                {order.items.map((item, index) => {
                  const itemTotal = item.product.price * item.quantity;
                  const itemTaxable = Math.round((itemTotal / 1.18) * 100) / 100;
                  const itemTax = Math.round((itemTotal - itemTaxable) * 100) / 100;

                  return (
                    <tr key={index} className="align-top">
                      <td className="py-3 px-3 border-r border-stone-300 text-center font-mono text-stone-500">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3 border-r border-stone-300 space-y-0.5">
                        <span className="font-bold text-stone-950 block">
                          {item.product.name}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          Category: {item.product.category} {item.product.weight ? `- ${item.product.weight}` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-3 border-r border-stone-300 text-center font-mono text-stone-600">
                        {item.product.hsnCode || '34060010'}
                      </td>
                      <td className="py-3 px-3 border-r border-stone-300 text-center font-mono font-bold">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 border-r border-stone-300 text-right font-mono">
                        ₹{item.product.price}
                      </td>
                      <td className="py-3 px-3 border-r border-stone-300 text-right font-mono text-stone-700">
                        ₹{itemTaxable}
                      </td>
                      <td className="py-3 px-3 border-r border-stone-300 text-right font-mono text-stone-700">
                        ₹{itemTax}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-950">
                        ₹{itemTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4. Bottom Grid: Amount in Words, Tax Breakdown & Financial Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 text-left pt-1">

            {/* Left 7 Columns: Amount in Words, Tax Breakdown, Terms */}
            <div className="sm:col-span-7 space-y-3.5">

              <div>
                <p className="text-[11px] text-stone-800">
                  <span className="font-bold uppercase tracking-wider">AMOUNT IN WORDS: </span>
                  <span className="font-serif italic text-stone-950">{numberToWords(order.grandTotal)}</span>
                </p>
              </div>

              {/* Tax Breakdown Summary */}
              <div className="space-y-1 text-[11px] text-stone-700">
                <p className="font-bold uppercase tracking-wider text-stone-800 text-[10px]">
                  TAX BREAKDOWN SUMMARY
                </p>
                <p className="leading-snug">
                  • CGST (9.0%): ₹{cgst} | SGST (9.0%): ₹{sgst} | Total Tax: ₹{totalGst} (Included in prices)
                </p>
                <p className="leading-snug">
                  • 10 Products Sold = 1 Cataract Surgery Funded under Orchid Flame Social Mission
                </p>
              </div>

              {/* Terms & Conditions */}
              <div className="space-y-1 text-[10px] text-stone-600 pt-1">
                <p className="font-bold uppercase tracking-wider text-stone-700">
                  TERMS & CONDITIONS
                </p>
                <p>1. Goods once sold are carefully inspected for artisan quality prior to dispatch.</p>
                <p>2. Keep handcrafted candles away from direct drafts and flammable materials.</p>
                <p>3. Contact WhatsApp at +91 90260 06766 for any query.</p>
              </div>

            </div>

            {/* Right 5 Columns: Financial Totals Box & Authorized Signatory */}
            <div className="sm:col-span-5 space-y-4">

              {/* Financial Box */}
              <div className="border border-stone-300 bg-[#f5f5f4] text-xs">
                <div className="p-3 space-y-1.5 border-b border-stone-300">
                  <div className="flex justify-between text-stone-700">
                    <span>Gross Subtotal:</span>
                    <span className="font-mono font-medium">₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-stone-700">
                    <span>Taxable Value:</span>
                    <span className="font-mono">₹{taxableSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-stone-700">
                    <span>CGST + SGST (18%):</span>
                    <span className="font-mono">₹{totalGst}</span>
                  </div>
                  <div className="flex justify-between text-stone-700">
                    <span>Shipping & Handling:</span>
                    <span className="font-mono font-medium">
                      {order.shipping === 0 ? '₹0 (FREE)' : `₹${order.shipping}`}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Voucher Discount:</span>
                      <span className="font-mono">-₹{order.discount}</span>
                    </div>
                  )}
                </div>

                <div className="px-3 py-2 bg-[#eae8e4] flex justify-between font-bold text-stone-950 text-xs">
                  <span>GRAND TOTAL (INR):</span>
                  <span className="font-mono text-sm">₹{order.grandTotal}</span>
                </div>
              </div>

              {/* Digitally Verified Signature Block (Matching Image 1:1) */}
              <div className="flex flex-col items-end text-right pt-1 pr-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-900 block">
                  Digitally Verified
                </span>
                <span className="text-[9px] uppercase tracking-wider text-stone-600 block">
                  FOR ORCHID FLAME
                </span>
                <div className="pt-2">
                  {/* Elegant cursive signature depiction */}
                  <span className="font-serif italic text-2xl text-stone-800 tracking-wider inline-block transform -rotate-3 select-none" style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive" }}>
                    Signature
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* 5. Bottom Disclaimer (Matching Image 1:1) */}
          <div className="pt-5 border-t border-stone-300 text-center text-[10px] text-stone-500">
            This is a computer-generated tax invoice and does not require physical signature.
          </div>

        </div>

      </div>
    </div>
  );
};
