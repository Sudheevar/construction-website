// ============================================================
// RCC Construction Website — Google Apps Script
//
// SETUP STEPS (one-time, ~10 minutes):
//
// 1. Go to https://sheets.google.com → create a new sheet
//    Name it "RCC Leads" (or anything you like)
//
// 2. In the sheet, go to Extensions → Apps Script
//
// 3. Delete any existing code, paste ALL of this file
//
// 4. Edit the OWNER_EMAIL constant below to your email
//
// 5. Click Save (Ctrl+S), then Deploy → New deployment
//    - Type: Web App
//    - Execute as: Me
//    - Who has access: Anyone
//    Click Deploy → Authorize → Copy the Web App URL
//
// 6. In js/script.js, replace YOUR_APPS_SCRIPT_URL_HERE
//    with the URL you just copied
//
// That's it! Every form submission will:
//   • Add a row to your Google Sheet
//   • Send you an email notification
// ============================================================

const OWNER_EMAIL = 'officialjrconstructions@gmail.com'; // ← change this if needed

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // --- Write to Sheet ---
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Add headers if this is the first submission
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Package Interest', 'Message']);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#2c3e50').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      data.submittedAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.name    || '',
      data.email   || '',
      data.phone   || 'Not provided',
      data.package || 'Not specified',
      data.message || ''
    ]);

    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, 6);

    // --- Send Email Notification ---
    const subject = `New Quote Enquiry – ${data.name}`;

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#2c3e50;padding:20px 30px;border-radius:8px 8px 0 0;">
          <h2 style="color:#ffffff;margin:0;">New Quote Request</h2>
          <p style="color:#bdc3c7;margin:5px 0 0;">RCC Construction Website</p>
        </div>
        <div style="background:#f9f9f9;padding:30px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;width:140px;color:#666;font-weight:bold;">Name</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-weight:bold;">Email</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;"><a href="mailto:${data.email}">${data.email}</a></td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-weight:bold;">Phone</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;">${data.phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-weight:bold;">Package Interest</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;">${data.package || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#666;font-weight:bold;vertical-align:top;">Message</td>
              <td style="padding:10px 0;">${(data.message || '').replace(/\n/g, '<br>')}</td>
            </tr>
          </table>
          <div style="margin-top:25px;padding:15px;background:#eaf4fb;border-left:4px solid #2980b9;border-radius:4px;">
            <p style="margin:0;color:#2980b9;font-size:0.9em;">Submitted on ${data.submittedAt}</p>
          </div>
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: subject,
      htmlBody: htmlBody
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
