# Pyzora Finechem LLP website

Static, responsive website (HTML, CSS and JavaScript only; no build step). Content comes from the Pyzora Labware brochure.

## Publish on GitHub Pages

```bash
cd pyzora-website
git init
git add .
git commit -m "Pyzora Finechem LLP website"
git branch -M main
git remote add origin https://github.com/<your-user>/<repo>.git
git push -u origin main
```

Then in the repository: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
The site goes live at `https://<your-user>.github.io/<repo>/`.

### Using www.pyzora.com
Add a file named `CNAME` containing `www.pyzora.com`, then point the domain's DNS to GitHub Pages
(a `CNAME` record for `www` to `<your-user>.github.io`). See GitHub's "Managing a custom domain for your GitHub Pages site".

## Editing

| What | Where |
| --- | --- |
| Product items and brands | `assets/catalogue.js` |
| Text, phone, email, addresses | `index.html` |
| Phone / email used by the enquiry buttons | top of `script.js` (`EMAIL`, `WA`) |
| Colours and fonts | `:root` in `styles.css` |
| Facility photo | `assets/facility.jpg` and `assets/facility.webp` |

## Notes
- The enquiry form has no server. "Email enquiry" opens the visitor's mail app with the list filled in, and "Send on WhatsApp" opens WhatsApp with the same text.
- Fonts (Fraunces, IBM Plex Sans, Dancing Script) are self-hosted under the SIL Open Font License.
- The facility image is the AI-upscaled picture from the brochure files. Replace it with a real photo when available.
