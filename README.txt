EZRA JOB ALERTS — GOOGLE SHEETS + SEPARATE RECRUITMENT LOGOS + SECURITY

GOOGLE SHEETS
- The website reads the exact published CSV URL configured in script.js.
- Current published CSV URL is the one supplied by the site owner.
- New rows appear after the published sheet is refreshed; hard-refresh the website if an old GitHub Pages copy is cached.
- Keep the actual Sheet editing permission restricted. Do not give public Editor access.

RECRUITMENT LOGOS
- Add a column named: Department Logo
- Each row can contain a different logo URL.
- Supported alternative headers: Recruitment Logo, Company Logo, Organization Logo, Logo URL, Logo.
- A Google Drive sharing URL can be used when the image is accessible.
- A local filename can also be used, with the matching file placed in assets/logos/.
- If a recruitment has no logo, a neutral department icon is used. The EZRA logo is NOT used as the recruitment logo.

SECURITY
- No passwords, API keys, write credentials or service-account JSON are included.
- Job text is HTML-escaped before rendering.
- External URLs accept only HTTP/HTTPS.
- External links use noopener/noreferrer.
- A Content Security Policy is enabled, including Google published-sheet endpoints needed for CSV loading.
