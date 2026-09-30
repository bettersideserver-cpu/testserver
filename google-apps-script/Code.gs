const SPREADSHEET_ID = "1MhgQoCAUWQNxr-NpATW5PrFcYwv2JqhkcGSacWxWFKs";

// Same Google Spreadsheet, separate tabs.
const VISITOR_SHEET = "Visitor Form";
const REQUEST_CALLBACK_SHEET = "Sheet2";

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      message: "CM Infinia lead endpoint is working"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const p = (e && e.parameter) ? e.parameter : {};
    const formType = String(p.formType || "").trim();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (formType === "visitor") {
      saveVisitor_(ss, p);
    } else {
      // Existing Request Call Back form goes to Sheet2.
      saveRequestCallback_(ss, p);
    }

    return json_({ ok: true, message: "Saved successfully" });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function saveVisitor_(ss, p) {
  const sheet = getOrCreateSheet_(ss, VISITOR_SHEET, [
    "Name",
    "Phone Number",
    "Email",
    "City"
  ]);

  // ONLY these four fields are stored for the Visitor Form.
  sheet.appendRow([
    safe_(p.fullName),
    safe_(p.phone),
    safe_(p.email),
    safe_(p.city)
  ]);
}

function saveRequestCallback_(ss, p) {
  const sheet = getOrCreateSheet_(ss, REQUEST_CALLBACK_SHEET, [
    "Submitted At",
    "Tower / Page",
    "Name",
    "Dial Code",
    "Phone Number",
    "Email",
    "City",
    "Preferred Time",
    "Page URL",
    "Page Path",
    "Source"
  ]);

  // Keep the existing Request Call Back data structure.
  sheet.appendRow([
    new Date(),
    safe_(p.tower),
    safe_(p.fullName),
    safe_(p.dialCode),
    safe_(p.phone),
    safe_(p.email),
    safe_(p.city),
    safe_(p.preferredTime),
    safe_(p.page_url),
    safe_(p.page_path),
    safe_(p.source || "Request Call Back")
  ]);
}

function getOrCreateSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function safe_(value) {
  value = String(value || "").trim();
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
