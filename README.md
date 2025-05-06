# 🛡️ Privacy Score Checker

**Privacy Score Checker** is a web tool that helps users evaluate the privacy practices of websites they visit. It analyzes various privacy-related signals such as trackers, cookies, third-party requests, and browser fingerprinting techniques, then presents a clear summary to inform users of potential privacy risks.

## 🚀 Features

- 🔍 **Tracker Detection** – Counts the number of tracking elements embedded in the webpage.
- 🍪 **Cookies Analysis** – Shows how many cookies are set by the site.
- 🌐 **Third-Party Requests** – Measures the percentage of requests sent to third-party domains.
- 🧠 **Fingerprinting Detection** – Detects the presence of browser fingerprinting techniques.
- 🧪 **VirusTotal Scan** – Performs a basic (mock) security check using VirusTotal API.

## 🎯 Purpose

This project aims to:
- Raise awareness about privacy issues on the web.
- Empower users to make informed decisions when browsing websites.
- Encourage website owners to adopt better privacy practices.

## 🛠️ Tech Stack

- **Frontend**: React (with TailwindCSS + shadcn/ui for styling and components)
- **Backend**: FastAPI (Python)
- **Deployment**: (Frontend supports static deployment on GitHub Pages / Netlify; Backend requires a dynamic host such as Render or Railway)

## 📦 Installation

### Frontend

```bash
cd frontend
npm install
npm run dev
and read "local_run_instructions.md" 
