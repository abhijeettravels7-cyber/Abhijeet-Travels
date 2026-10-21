// ============================================================
//  Abhijeet Travels — Google Apps Script Backend
//  Handles two actions:
//    1. booking_inquiry  — Website form submission → Sheet + Customer email + Owner email
//    2. send_invoice_pdf — Admin billing page → Email PDF voucher to customer
//
//  SETUP INSTRUCTIONS (2 minutes):
//  ─────────────────────────────────
//  1. Go to https://sheets.google.com and create a new spreadsheet
//  2. Name it "Abhijeet Travels — Booking CRM"
//  3. In Row 1, add these headers in order:
//     Timestamp | Name | Phone | Email | Source | Destination | Date | Vehicle | Trip Type | Passengers | Status
//  4. Click Extensions → Apps Script
//  5. Delete any existing code and paste THIS ENTIRE FILE
//  6. Replace OWNER_EMAIL below with your actual email
//  7. Click Deploy → New Deployment
//  8. Select Type = "Web app"
//  9. Set "Execute as" = "Me" and "Who has access" = "Anyone"
//  10. Click Deploy and copy the Web App URL
//  11. Paste that URL into:
//      a) admin/billing.html → const APPS_SCRIPT_URL = 'YOUR_URL_HERE';
//      b) script.js          → const APPS_SCRIPT_URL = 'YOUR_URL_HERE';
//  ─────────────────────────────────
// ============================================================

// ============ CONFIGURATION ============
const OWNER_EMAIL = 'abhijeettravels7@gmail.com';  // ← Replace with your actual email
const OWNER_NAME = 'Mr. Prasenjeet Waghmare';
const OWNER_PHONE = '7020460865';
const BUSINESS_NAME = 'Abhijeet Tours & Travels';
const WEBSITE_URL = 'www.abhijeettravels.com';

// ============ MAIN HANDLER ============
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'booking_inquiry';

    if (action === 'booking_inquiry') {
      return handleBookingInquiry(data);
    } else if (action === 'send_invoice_pdf') {
      return handleSendInvoicePDF(data);
    } else {
      return jsonResponse({ result: 'error', error: 'Unknown action' });
    }
  } catch (err) {
    return jsonResponse({ result: 'error', error: err.message });
  }
}

// Allow GET for testing
function doGet(e) {
  return jsonResponse({ result: 'success', message: 'Abhijeet Travels API is running.' });
}

// ============ ACTION 1: BOOKING INQUIRY ============
function handleBookingInquiry(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Append row to Sheet
  sheet.appendRow([
    new Date(),                         // Timestamp
    data.name || '',                    // Name
    data.mobile || '',                  // Phone
    data.email || '',                   // Email
    data.source || '',                  // Source
    data.destination || '',             // Destination
    data.date || '',                    // Date
    data.vehicle || '',                 // Vehicle
    data.triptype || '',                // Trip Type
    data.passengers || '',              // Passengers
    'New'                               // Status
  ]);

  // Send "Thank you" email to customer
  if (data.email) {
    try {
      const customerSubject = `Thank You for Choosing ${BUSINESS_NAME}! 🙏`;
      const customerBody = getCustomerThankYouEmail(data);
      MailApp.sendEmail({
        to: data.email,
        subject: customerSubject,
        htmlBody: customerBody,
        name: BUSINESS_NAME
      });
    } catch (emailErr) {
      Logger.log('Customer email failed: ' + emailErr.message);
    }
  }

  // Send notification email to owner
  try {
    const ownerSubject = `🚗 New Booking Inquiry: ${data.name} — ${data.source} → ${data.destination}`;
    const ownerBody = getOwnerNotificationEmail(data);
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: ownerSubject,
      htmlBody: ownerBody,
      name: 'Abhijeet Travels Bot'
    });
  } catch (ownerErr) {
    Logger.log('Owner email failed: ' + ownerErr.message);
  }

  return jsonResponse({ result: 'success' });
}

// ============ ACTION 2: SEND INVOICE PDF ============
function handleSendInvoicePDF(data) {
  if (!data.customerEmail) {
    return jsonResponse({ result: 'error', error: 'Customer email is required' });
  }

  if (!data.pdfBase64) {
    return jsonResponse({ result: 'error', error: 'PDF data is required' });
  }

  // Convert base64 to PDF blob
  const pdfBlob = Utilities.newBlob(
    Utilities.base64Decode(data.pdfBase64),
    'application/pdf',
    `${data.voucherNumber || 'Booking'}_Confirmation.pdf`
  );

  // Build email
  const subject = `Booking Confirmation & Travel Voucher — ${BUSINESS_NAME} (${data.voucherNumber || ''})`;
  const htmlBody = getInvoiceEmail(data);

  try {
    MailApp.sendEmail({
      to: data.customerEmail,
      subject: subject,
      htmlBody: htmlBody,
      name: BUSINESS_NAME,
      attachments: [pdfBlob]
    });

    return jsonResponse({ result: 'success' });
  } catch (err) {
    return jsonResponse({ result: 'error', error: err.message });
  }
}

// ============ EMAIL TEMPLATES ============

// Customer Thank-You Email (on form submit)
function getCustomerThankYouEmail(data) {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0; padding:20px; background:#f4f4f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
      <!-- Dark Navy Header -->
      <div style="background:#0f172a; padding:24px 20px; text-align:center;">
        <h1 style="color:#f59e0b; font-size:22px; font-weight:700; margin:0; letter-spacing:-0.01em;">${BUSINESS_NAME}</h1>
        <p style="color:#ffffff; font-size:13px; font-weight:500; margin:6px 0 0;">Solapur, Maharashtra</p>
      </div>

      <!-- Body -->
      <div style="padding:24px 26px;">
        <h2 style="color:#0f172a; font-size:17px; margin:0 0 12px; font-weight:700;">Thank You for Choosing Us! 🙏</h2>
        <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 14px;">
          Dear <strong>${data.name || 'Customer'}</strong>,
        </p>
        <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 16px;">
          Thank you for your travel booking inquiry with <strong>${BUSINESS_NAME}</strong>. We have successfully received your request and it is being processed.
        </p>

        <!-- What happens next box (Golden/Amber) -->
        <div style="background:#fefce8; border-left:4px solid #f59e0b; padding:14px 16px; border-radius:6px; margin:16px 0;">
          <p style="color:#b45309; font-weight:700; font-size:13px; margin:0 0 4px;">📞 What happens next?</p>
          <p style="color:#451a03; font-size:13px; line-height:1.6; margin:0;">
            Our owner will call you shortly on your mobile number <strong>${data.mobile || ''}</strong> to confirm your booking and finalize the trip details.
          </p>
        </div>

        <!-- Trip Details Table -->
        <table style="width:100%; border-collapse:collapse; margin:18px 0;">
          <tr>
            <td style="padding:10px 4px; font-size:13px; color:#64748b; border-bottom:1px solid #f1f5f9; font-weight:500; width:35%;">📍 Route</td>
            <td style="padding:10px 4px; font-size:13px; color:#0f172a; border-bottom:1px solid #f1f5f9; font-weight:700;">${data.source || ''} → ${data.destination || ''}</td>
          </tr>
          <tr>
            <td style="padding:10px 4px; font-size:13px; color:#64748b; border-bottom:1px solid #f1f5f9; font-weight:500;">📅 Date</td>
            <td style="padding:10px 4px; font-size:13px; color:#0f172a; border-bottom:1px solid #f1f5f9; font-weight:700;">${data.date || 'To be confirmed'}</td>
          </tr>
          <tr>
            <td style="padding:10px 4px; font-size:13px; color:#64748b; border-bottom:1px solid #f1f5f9; font-weight:500;">🚗 Vehicle</td>
            <td style="padding:10px 4px; font-size:13px; color:#0f172a; border-bottom:1px solid #f1f5f9; font-weight:700;">${data.vehicle || 'To be confirmed'}</td>
          </tr>
          ${data.triptype ? `
          <tr>
            <td style="padding:10px 4px; font-size:13px; color:#64748b; border-bottom:none; font-weight:500;">🔄 Trip Type</td>
            <td style="padding:10px 4px; font-size:13px; color:#0f172a; border-bottom:none; font-weight:700;">${data.triptype}</td>
          </tr>` : ''}
        </table>

        <p style="color:#475569; font-size:13px; line-height:1.6; margin:16px 0 0;">
          For urgent queries, you can reach us directly:<br>
          📞 <strong>+91 ${OWNER_PHONE}</strong><br>
          🌐 <a href="https://${WEBSITE_URL}" style="color:#2563eb; text-decoration:none; font-weight:600;">${WEBSITE_URL}</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#0f172a; padding:16px 24px; text-align:center;">
        <p style="color:#f59e0b; font-size:14px; font-weight:bold; font-style:italic; margin:0;">"Have a Safe Journey" 🙏</p>
        <p style="color:#94a3b8; font-size:11px; margin:6px 0 0;">© ${new Date().getFullYear()} ${BUSINESS_NAME} | Solapur, Maharashtra</p>
      </div>
    </div>
  </body>
  </html>`;
}

// Owner Notification Email (Matches exact Previous UI from First Image)
function getOwnerNotificationEmail(data) {
  const phone = (data.mobile || '').replace(/\D/g, '');
  const waPhone = phone.startsWith('91') ? phone : '91' + phone;
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0; padding:20px; background:#f4f4f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
      <!-- Dark Navy Header -->
      <div style="background:#0f172a; padding:24px 20px; text-align:center;">
        <h1 style="color:#f59e0b; font-size:22px; font-weight:700; margin:0; letter-spacing:-0.01em;">${BUSINESS_NAME}</h1>
        <p style="color:#ffffff; font-size:13px; font-weight:500; margin:6px 0 0; letter-spacing:0.02em;">New Booking Request</p>
      </div>

      <!-- Content Table -->
      <div style="padding:22px 26px;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="padding:11px 4px; color:#64748b; font-size:14px; border-bottom:1px solid #f1f5f9; width:38%;">👤 Name</td>
            <td style="padding:11px 4px; color:#0f172a; font-size:14px; font-weight:700; border-bottom:1px solid #f1f5f9;">${data.name || '—'}</td>
          </tr>
          <tr>
            <td style="padding:11px 4px; color:#64748b; font-size:14px; border-bottom:1px solid #f1f5f9;">📞 Mobile</td>
            <td style="padding:11px 4px; color:#0f172a; font-size:14px; font-weight:700; border-bottom:1px solid #f1f5f9;"><a href="tel:${data.mobile}" style="color:#0f172a; text-decoration:none;">${data.mobile || '—'}</a></td>
          </tr>
          ${data.email ? `
          <tr>
            <td style="padding:11px 4px; color:#64748b; font-size:14px; border-bottom:1px solid #f1f5f9;">✉️ Email</td>
            <td style="padding:11px 4px; color:#0f172a; font-size:14px; font-weight:700; border-bottom:1px solid #f1f5f9;"><a href="mailto:${data.email}" style="color:#2563eb; text-decoration:none;">${data.email}</a></td>
          </tr>` : ''}
          <tr>
            <td style="padding:11px 4px; color:#64748b; font-size:14px; border-bottom:1px solid #f1f5f9;">📍 From</td>
            <td style="padding:11px 4px; color:#0f172a; font-size:14px; font-weight:700; border-bottom:1px solid #f1f5f9;">${data.source || '—'}</td>
          </tr>
          <tr>
            <td style="padding:11px 4px; color:#64748b; font-size:14px; border-bottom:1px solid #f1f5f9;">🏁 To</td>
            <td style="padding:11px 4px; color:#0f172a; font-size:14px; font-weight:700; border-bottom:1px solid #f1f5f9;">${data.destination || '—'}</td>
          </tr>
          <tr>
            <td style="padding:11px 4px; color:#64748b; font-size:14px; border-bottom:1px solid #f1f5f9;">📅 Travel Date</td>
            <td style="padding:11px 4px; color:#0f172a; font-size:14px; font-weight:700; border-bottom:1px solid #f1f5f9;">${data.date || '—'}</td>
          </tr>
          <tr>
            <td style="padding:11px 4px; color:#64748b; font-size:14px; border-bottom:1px solid #f1f5f9;">🚗 Vehicle</td>
            <td style="padding:11px 4px; color:#0f172a; font-size:14px; font-weight:700; border-bottom:1px solid #f1f5f9;">${data.vehicle || '—'}</td>
          </tr>
          <tr>
            <td style="padding:11px 4px; color:#64748b; font-size:14px; border-bottom:1px solid #f1f5f9;">🔄 Trip Type</td>
            <td style="padding:11px 4px; color:#0f172a; font-size:14px; font-weight:700; border-bottom:1px solid #f1f5f9;">${data.triptype || '—'}</td>
          </tr>
          <tr>
            <td style="padding:11px 4px; color:#64748b; font-size:14px; border-bottom:none;">👥 Passengers</td>
            <td style="padding:11px 4px; color:#0f172a; font-size:14px; font-weight:700; border-bottom:none;">${data.passengers || '—'}</td>
          </tr>
        </table>

        <!-- Light Amber Callout Note -->
        <div style="background:#fefce8; border-left:4px solid #f59e0b; padding:12px 14px; border-radius:4px; margin:20px 0 16px; font-size:13px; color:#451a03; line-height:1.5;">
          Please call <strong>${data.name || 'Customer'}</strong> on <strong>${data.mobile || ''}</strong> to confirm this booking.
        </div>

        <!-- Action Buttons -->
        <div style="margin-top:14px; display:flex; gap:10px;">
          <a href="tel:${data.mobile}" style="background:#1e293b; color:#ffffff; padding:10px 18px; border-radius:6px; text-decoration:none; font-size:13px; font-weight:700; display:inline-block;">📞 Call Now</a>
          <a href="https://wa.me/${waPhone}" style="background:#22c55e; color:#ffffff; padding:10px 18px; border-radius:6px; text-decoration:none; font-size:13px; font-weight:700; display:inline-block;">💬 WhatsApp</a>
        </div>
      </div>
    </div>
  </body>
  </html>`;
}

// Invoice / PDF Attachment Email
function getInvoiceEmail(data) {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0; padding:20px; background:#f4f4f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
      <!-- Dark Navy Header -->
      <div style="background:#0f172a; padding:24px 20px; text-align:center;">
        <h1 style="color:#f59e0b; font-size:22px; font-weight:700; margin:0; letter-spacing:-0.01em;">${BUSINESS_NAME}</h1>
        <p style="color:#ffffff; font-size:13px; font-weight:500; margin:6px 0 0;">Booking Confirmation & Travel Voucher</p>
      </div>

      <!-- Body -->
      <div style="padding:24px 26px;">
        <h2 style="color:#0f172a; font-size:17px; margin:0 0 12px; font-weight:700;">Your Vehicle Is Confirmed ✅</h2>
        <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 14px;">
          Dear <strong>${data.customerName || 'Customer'}</strong>,
        </p>
        <p style="color:#475569; font-size:14px; line-height:1.6; margin:0 0 16px;">
          Your travel booking with <strong>${BUSINESS_NAME}</strong> has been confirmed. Please find your official <strong>Travel Confirmation Voucher (PDF)</strong> attached to this email.
        </p>

        <!-- Attachment callout box (Green) -->
        <div style="background:#f0fdf4; border-left:4px solid #22c55e; padding:13px 16px; border-radius:6px; margin:16px 0;">
          <p style="color:#166534; font-size:13px; line-height:1.6; margin:0;">
            📎 <strong>Your confirmation voucher is attached as a PDF.</strong> Please save or print it for your records.
          </p>
        </div>

        <!-- Details Table -->
        <table style="width:100%; border-collapse:collapse; margin:18px 0;">
          <tr>
            <td style="padding:10px 4px; font-size:13px; color:#64748b; border-bottom:1px solid #f1f5f9; font-weight:500; width:35%;">📄 Voucher No.</td>
            <td style="padding:10px 4px; font-size:13px; color:#0f172a; border-bottom:1px solid #f1f5f9; font-weight:700;">${data.voucherNumber || '—'}</td>
          </tr>
          <tr>
            <td style="padding:10px 4px; font-size:13px; color:#64748b; border-bottom:1px solid #f1f5f9; font-weight:500;">📅 Travel Dates</td>
            <td style="padding:10px 4px; font-size:13px; color:#0f172a; border-bottom:1px solid #f1f5f9; font-weight:700;">${data.dateFrom || ''} to ${data.dateTo || ''}</td>
          </tr>
          <tr>
            <td style="padding:10px 4px; font-size:13px; color:#64748b; border-bottom:1px solid #f1f5f9; font-weight:500;">🚗 Vehicle</td>
            <td style="padding:10px 4px; font-size:13px; color:#0f172a; border-bottom:1px solid #f1f5f9; font-weight:700;">${data.vehicleType || '—'}</td>
          </tr>
          <tr>
            <td style="padding:10px 4px; font-size:13px; color:#64748b; border-bottom:none; font-weight:500;">👤 Coordinator</td>
            <td style="padding:10px 4px; font-size:13px; color:#0f172a; border-bottom:none; font-weight:700;">${OWNER_NAME} (+91 ${OWNER_PHONE})</td>
          </tr>
        </table>

        <p style="color:#475569; font-size:13px; line-height:1.6; margin:16px 0 0;">
          Our coordinator will contact you with driver and vehicle details before your trip.<br><br>
          For any queries, reach us at:<br>
          📞 <strong>+91 ${OWNER_PHONE}</strong><br>
          🌐 <a href="https://${WEBSITE_URL}" style="color:#2563eb; text-decoration:none; font-weight:600;">${WEBSITE_URL}</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#0f172a; padding:16px 24px; text-align:center;">
        <p style="color:#f59e0b; font-size:14px; font-weight:bold; font-style:italic; margin:0;">"Have a Safe Journey" 🙏</p>
        <p style="color:#94a3b8; font-size:11px; margin:6px 0 0;">© ${new Date().getFullYear()} ${BUSINESS_NAME} | Solapur, Maharashtra</p>
      </div>
    </div>
  </body>
  </html>`;
}

// ============ HELPER ============
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
