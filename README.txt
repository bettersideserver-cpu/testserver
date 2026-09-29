# Location Consent → Google Sheets

This project records a visitor's browser geolocation permission choice.

## What happens

### Visitor clicks "Allow Location Access"

The browser asks for location permission.

If the visitor allows it, the system records:

- Timestamp
- Permission = Granted
- Latitude
- Longitude
- Accuracy in meters
- Altitude (when available)
- Heading
- Speed
- Page URL
- Browser user agent

### Visitor clicks "Don't Allow"

The system records:

- Timestamp
- Permission = Rejected
- Error code = 1
- Error = Permission denied by visitor
- Page URL
- Browser user agent

The system does NOT attempt to obtain the location after permission is denied.

## Google Sheet setup

1. Create a new Google Sheet.
2. Open `Extensions → Apps Script`.
3. Copy the contents of `google-apps-script.js` into Apps Script.
4. Replace:

   PASTE_YOUR_GOOGLE_SHEET_ID_HERE

   with your spreadsheet ID.

   Example:
   https://docs.google.com/spreadsheets/d/ABC123XYZ/edit

   The ID is:
   ABC123XYZ

5. Save the Apps Script.
6. Click `Deploy → New deployment`.
7. Select `Web app`.
8. Set:
   - Execute as: Me
   - Who has access: Anyone
9. Deploy and authorize the script when Google asks.
10. Copy the Web App URL ending in `/exec`.

## Connect the website

Open `index.html` and replace:

PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE

with your Apps Script `/exec` URL.

Example:

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/XXXXX/exec";

## Hosting

For real visitor testing, host the page on HTTPS.

Good options include:

- GitHub Pages
- Vercel
- Netlify
- Your existing HTTPS website

`localhost` can also be used for development.

## Important browser behavior

The browser controls the permission dialog. JavaScript cannot force a visitor to grant permission.

If the visitor rejects permission, the website receives a `PERMISSION_DENIED` geolocation error and records `Rejected`.

If the visitor previously blocked the site, the browser may not show the permission dialog again until the visitor changes the site's browser permission.

## Privacy

Because this system records precise location when permission is granted, your website should clearly tell visitors why the location is being collected and how it will be used.

Do not use this system to bypass browser permission controls or secretly track visitors.
