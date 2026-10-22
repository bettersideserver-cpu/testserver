# CM Infinia forms — separate Google Sheet tabs

Both forms use the SAME Google Spreadsheet:

Spreadsheet ID:
1MhgQoCAUWQNxr-NpATW5PrFcYwv2JqhkcGSacWxWFKs

Tabs:
- `Visitor Form` — ONLY Name, Phone Number, Email, City
- `Sheet2` — existing Request Call Back form data

## Apps Script
1. Paste `Code.gs` into Apps Script.
2. Save.
3. Deploy → New deployment → Web app.
4. Execute as: Me.
5. Who has access: Anyone.
6. Copy the `/exec` URL.
7. Put the same `/exec` URL in BOTH:
   - `JS/tower-lead.js`
   - `JS/bz021sxwxo.js`

Replace `PASTE_YOUR_NEW_APPS_SCRIPT_EXEC_URL_HERE` in both files.

## Request Call Back
The existing Request Call Back overlay/form is preserved. Its fields and behavior remain the same, except reCAPTCHA has been removed as requested.

## Visitor Form
The separate visitor welcome form remains separate. It stores ONLY:
- Name
- Phone Number
- Email
- City

No timestamp, tower, URL, source, preferred time, or other metadata is stored in the Visitor Form tab.
