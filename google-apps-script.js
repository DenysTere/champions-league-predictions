/**
 * UCL Bracket Challenge — Google Apps Script
 *
 * SETUP:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Delete the default code and paste this entire file
 * 4. Click Deploy → New deployment
 * 5. Select type: "Web app"
 * 6. Set "Execute as": Me
 * 7. Set "Who has access": Anyone
 * 8. Click Deploy and copy the URL
 * 9. Paste the URL into GOOGLE_SHEET_URL in index.html
 *
 * IMPORTANT: If you update this code, you must create a NEW deployment
 * (Deploy → Manage deployments → New version) for changes to take effect.
 */

function doGet(e) {
  var p = e.parameter || {};

  // If no data params, return status
  if (!p.email && !p.twitter) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'UCL Bracket API is running' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Save prediction to sheet
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Create headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Email',
        'Twitter',
        'Champion',
        'QF1 Winner',
        'QF2 Winner',
        'QF3 Winner',
        'QF4 Winner',
        'SF1 Winner',
        'SF2 Winner',
        'Final Winner'
      ]);
      sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
    }

    sheet.appendRow([
      p.timestamp || new Date().toISOString(),
      p.email || '',
      p.twitter || '',
      p.champion || '',
      p.qf1 || '',
      p.qf2 || '',
      p.qf3 || '',
      p.qf4 || '',
      p.sf1 || '',
      p.sf2 || '',
      p.final || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'Email', 'Twitter', 'Champion',
        'QF1 Winner', 'QF2 Winner', 'QF3 Winner', 'QF4 Winner',
        'SF1 Winner', 'SF2 Winner', 'Final Winner'
      ]);
      sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.email || '', data.twitter || '', data.champion || '',
      data.qf1 || '', data.qf2 || '', data.qf3 || '', data.qf4 || '',
      data.sf1 || '', data.sf2 || '', data.final || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
