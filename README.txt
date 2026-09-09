EZRA JOB ALERTS — SECURE STATIC VERSION

Preserved functionality:
- Reads the existing published Google Sheets CSV (read-only).
- Job cards, search, category filters and job details continue to use Sheet data.
- Add a Department Logo URL in the Google Sheet using the header: Department Logo.
- Job details page is loaded by job.html?job=JOB-ID.

Security improvements:
- Added a restrictive Content-Security-Policy in both pages.
- Removed inline JavaScript and inline event handlers.
- Validates external URLs to allow only HTTP/HTTPS; javascript:, data:, file: and similar schemes are rejected.
- External links use rel="noopener noreferrer".
- Job and department text is HTML-escaped before rendering.
- Removed the Google Favicon fallback; missing department logos fall back to the local EZRA logo.
- No passwords, write credentials, API secrets or service-account files are included.
- Job details page now explicitly calls its loader and has a separate responsive layout.

IMPORTANT:
The published Google Sheet CSV URL is visible to a static frontend by design. Keep the Sheet itself read-only/public for viewing and never give the public edit permission. If the Sheet must be writable by admins, use a server-side authenticated API rather than putting credentials in this repository.

GITHUB PAGES:
Upload all files and the assets folder together. Keep index.html, job.html, script.js and style.css in the same folder.
