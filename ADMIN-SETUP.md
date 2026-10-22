# CM Infinia admin setup

The admin is at `admin.html`. Serve the site over HTTP/HTTPS; ES modules do not work reliably through file://.

1. Create a **dedicated CM Infinia project** in https://supabase.com/dashboard.
2. Copy the project URL and publishable key from **Connect** into `JS/cm-config.js`. Never use a secret or service-role key in this file.
3. In the Supabase SQL Editor run, in order:
   - `admin/sql/project-setup.sql`
   - `admin/sql/visitor-analytics.sql`
   - `admin/sql/visitor-location.sql` (adds optional location fields used by the dashboard).
4. Create your login account using the admin login page's registration form, and confirm its email if required. Set your live site's URL in Supabase Authentication URL Configuration for confirmation links.
5. Every signed-in account registered through the admin login page receives admin access, including access to visitor data and deletion controls. No manual approval is required. For a project installed with the previous approval system, run `admin/sql/all-registered-admins.sql` and deploy the updated `admin/js/dashboard.js`. Tour visitor form submissions do not create admin accounts.

6. Run `admin/sql/inventory-and-holds.sql`. This manages one apartment (Unit 1) per floor across towers A–F and floors 1–33: 198 entries. Each floor has two physical apartments, but only one is managed here, as requested. Any previously seeded Unit 2 records and their buyer details remain in the database, excluded from the dashboard and new hold requests. Existing hold requests remain visible. New entries start as Available; update their actual statuses in the admin before accepting requests. Re-run this SQL and upload the updated dashboard if you already installed the earlier 390-unit version.
7. Upload the CM Infinia folder contents to your host. Deploy the changed HTML and JS together. The `_headers` file revalidates HTML and scripts so returning visitors receive the new gate.

## Included behavior

- Tower A/B/C open without the old visitor popup.
- Each 3BHK 360 page opens freely. Clicking a different room prompts for name, 10-digit phone and city; email is optional.
- Successful database submission opens the requested room. Closing the form stays in the current view. A failed submission stays gated and can be retried.
- Registration lasts for the current tab session and is separate from Hero Homes.
- Admin: inventory status and buyer fields, Save All, status management, visitors, visitor details with sessions/page journeys and deletion, and hold-request management.
- Browsing analytics covers SubPages, including individual 360 rooms. Initial anonymous activity is linked when the visitor registers.
- Existing Google Sheets callback/contact forms remain separate. The relocated visitor gate writes to Supabase.

## Remaining configuration

Live login, registration and analytics require the project URL/key and SQL above. IP geolocation is disabled by default; this installation records browsing sessions without claiming to capture IP addresses. All seven 3BHK 360 pages have Request to Hold. Visitors register first, then confirm the apartment they arrived from. The hold dialog remembers the selected tower/floor and has no apartment picker. Missing context or an unavailable apartment blocks submission instead of substituting another property. A successful submission creates a Pending hold request with visitor and apartment details. It does not automatically reserve the apartment or change inventory status. Public inventory overlays are unchanged.

See `admin/VISITOR-DETAILS.md` for dashboard usage.

## Bulk visitor deletion fix

If Delete All Visitor Details reports `DELETE requires a WHERE clause`, run the updated `admin/sql/visitor-delete.sql` in Supabase. The function now uses `WHERE id IS NOT NULL`, retains admin row-level security, and cascades deletion to sessions and page history. Registration records in Visitors are separate.
