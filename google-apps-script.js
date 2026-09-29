/**
 * LOCATION CONSENT LOGGER
 *
 * 1. Create a Google Sheet.
 * 2. Open Extensions > Apps Script.
 * 3. Replace the contents with this code.
 * 4. Put your Google Sheet ID below.
 * 5. Deploy as Web app:
 *      Execute as: Me
 *      Who has access: Anyone
 * 6. Copy the /exec URL into index.html.
 */

const SPREADSHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";
const SHEET_NAME = "Location Logs";

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Permission",
      "Latitude",
      "Longitude",
      "Accuracy (m)",
      "Altitude",
      "Altitude Accuracy (m)",
      "Heading",
      "Speed",
      "Error Code",
      "Error",
      "Page",
      "User Agent"
    ]);
  }

  return sheet;
}

function doGet() {
  return ContentService
    .createTextOutput("Location consent endpoint is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : {};

    const sheet = getSheet_();

    sheet.appendRow([
      body.timestamp || new Date().toISOString(),
      body.permission || "",
      body.latitude ?? "",
      body.longitude ?? "",
      body.accuracy_meters ?? "",
      body.altitude ?? "",
      body.altitude_accuracy_meters ?? "",
      body.heading ?? "",
      body.speed ?? "",
      body.errorCode ?? "",
      body.error ?? "",
      body.page ?? "",
      body.userAgent ?? ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: String(err)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
