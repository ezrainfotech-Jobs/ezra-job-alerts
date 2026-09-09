EZRA JOB ALERTS — SECURE + GOOGLE SHEETS + DEPARTMENT LOGOS

Google Sheets:
- The site reads the published Google Sheets CSV as read-only.
- If new rows do not appear, publish the sheet to the web again and make sure this project contains the latest CSV URL in script.js.
- Keep the actual Sheet editing permission restricted to your account/admins. Never give public Editor access.

Department / Recruitment logo:
- Add a column named: Department Logo
- Put a direct image URL in that cell, OR a Google Drive file-sharing URL for the image.
- Google Drive image links are converted automatically when possible.
- You can also put a local filename such as railway.png; then upload that image into assets/logos/railway.png.
- Each recruitment row can therefore have a different logo.
- If no logo is supplied, a neutral department icon is shown — the EZRA logo is NOT used as the recruitment logo.

Supported alternative logo headers include: Recruitment Logo, Company Logo, Organization Logo, Logo URL, Logo.

Security:
- No passwords, write credentials, service-account JSON or private API keys are included.
- External URLs accept only HTTP/HTTPS.
- Job text is HTML-escaped before rendering.
- External links use noopener/noreferrer.
- Content Security Policy is enabled.
