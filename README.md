# CampusConnect LTCE - Official Campus Events & Student Opportunities Hub

> **Lokmanya Tilak College of Engineering (LTCE), Navi Mumbai**  
> Complete web project recreation of `https://campus-connectltce.vercel.app`.

---

## 🚀 How to Run the Website

### Option 1: One-Click Launcher (Recommended)
Simply double-click **`start.bat`**.  
It will automatically open your default browser to `http://localhost:8000/index.html` and start Python's built-in web server.

### Option 2: Direct Double-Click
Double-click **`index.html`** in File Explorer.  
All styling, images, and interactive scripts use self-contained relative paths and work seamlessly without a server.

### Option 3: Command Line
Open a terminal in this folder and run:
```bash
python -m http.server 8000
```
Then visit: `http://localhost:8000`

---

## 🛠️ Compilation & Deployment Readiness

To compile, audit, and verify deployment readiness across all files and targets:

### One-Click Compiler
Double-click **`compile.bat`** or run:
```bash
python compile.py --build-dist
```

This automated compiler:
1. **Validates All 16 Pages**: HTML5 semantic markup, `<meta>` tags, viewport, OpenGraph, and title compliance.
2. **Audits 230+ Assets**: Checks stylesheet paths, JS scripts, images, and club badges to ensure zero 404 broken assets.
3. **Verifies 500+ Internal Hyperlinks**: Tests every navigation item, pass link, and dynamic event route (`event-details.html?id=X`).
4. **Validates Schema & Data**: Inspects `events_data.json` and syntax across `css/style.css` and `js/main.js`.
5. **Generates Distribution**: Builds a production-ready package in the **`dist/`** directory.

---

## 🌐 Deploy to Production

The project is fully pre-configured for instant zero-configuration deployment to any platform:

### 1. Deploying to Vercel (Recommended)
- Push this folder to a GitHub repository or install the Vercel CLI (`npm i -g vercel`).
- Run `vercel` in this folder (or link via the Vercel Dashboard).
- The included `vercel.json` automatically configures clean URLs, asset caching headers, and security policies.

### 2. Deploying to Netlify
- Drag and drop either the root folder or `dist/` into the Netlify Web App dashboard, or connect via Git.
- The included `netlify.toml` and `_redirects` handle clean URLs and asset caching automatically.

### 3. Deploying to GitHub Pages
- Push the repository to GitHub.
- Go to **Repository Settings &rarr; Pages &rarr; Deploy from branch (`main` / root)**.
- The included `.nojekyll` ensures all static files and folders are served seamlessly without Jekyll interference.

---

## 📂 Project Structure

```
campus/
├── index.html                 # Homepage: Hero Ticket Carousel, Trending Topics, Clubs Reel, Upcoming Events
├── dashboard.html             # Discover Events: Real-time search, department & year filter, category pills
├── clubs.html                 # Student Chapters & Bodies Directory (CESA, AIMSA, DSSA, GDG, GFG, E-CELL, etc.)
├── event-details.html         # Unified Dynamic Event Details (All 6 LTCE events: Navratri, GDG, Poster, Rookery, etc.)
├── event-details-1.html..6    # Static standalone event pages
├── my-registrations.html      # Digital Event Passes: Attendance duty leave tracking & printable QR tickets
├── login.html                 # Student, Club President & Admin 1-click test login
├── register.html              # Student registration form
├── 404.html                   # Obsidian Glass branded 404 error page
├── privacy.html               # Institutional Privacy Policy
├── terms.html                 # Terms of Use
├── start.bat                  # One-click Windows server launcher
├── compile.py                 # Full audit & distribution compiler script
├── compile.bat                # One-click Windows build and compiler launcher
├── vercel.json                # Vercel deployment configuration (clean URLs, caching, security headers)
├── netlify.toml               # Netlify deployment configuration
├── _redirects                 # Netlify routing rules
├── .nojekyll                  # GitHub Pages bypass rule
├── robots.txt                 # Search engine crawler permissions
├── sitemap.xml                # SEO Sitemap for search indexers
├── .gitignore                 # Clean Git repository ignore rules
├── events_data.json           # Institutional events catalog
├── dist/                      # Compiled production distribution
├── css/
│   └── style.css              # Obsidian Glass theme, responsive mobile-first typography & layout
├── js/
│   └── main.js                # Search & filter engine, mobile drawer, interactive passes, local auth
└── images/
    ├── campusconnect-*.png    # Official CampusConnect emblems & logos
    ├── ltce_official_logo.png # Institutional LTCE crest
    ├── default_event.jpg      # Fallback event banner
    ├── navratri_carnival.jpg  # Navratri Carnival 2026 poster
    ├── gdg_hacktoberfest.jpg  # GDG Hacktoberfest banner
    ├── iic_aimsa_poster.jpg   # IIC x AIMSA poster
    ├── rookery_hackathon.jpg  # Rookery Hackathon poster
    ├── gd_workshop.jpg        # GD Practice Workshop poster
    ├── project_deep_blue.jpg  # Project Deep Blue Season 12 poster
    └── clubs/                 # Official club emblems (AIMSA, CESA, DSSA, GDG, GFG, E-CELL, etc.)
```

---

## ✨ Features Included

1. **Collegiate Split Hero & Ticket Carousel**:
   - Interactive rotating card featuring active and past campus passes.
   - Real-time search autocomplete for hackathons, workshops, and chapters.
2. **Real-Time Client Filter**:
   - Filter by Department (Computer, CSE AI & ML, Data Science, etc.).
   - Filter by Academic Year (FE, SE, TE, BE).
   - Filter by Event Category (Cultural, Technical, Hackathon, Workshop, Competition).
3. **Event Registration & Digital Passes**:
   - 1-Click Pass reservation with instant Duty Leave (DL) verification.
   - Interactive modal to view or print the student campus pass.
4. **Institutional 1-Click Demo Accounts**:
   - **Student Account**: Rahul Sharma
   - **Club President**: GDG on Campus, AIMSA, CESA
   - **Super Admin**: Chief Institutional Administrator
5. **Mobile-First Experience**:
   - Obsidian Glass mobile drawer navigation with swipe gestures.
   - Native-feel bottom navigation bar for phones.
