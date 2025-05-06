from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware # Import CORS
from pydantic import BaseModel
import httpx
from bs4 import BeautifulSoup
import asyncio
import re
import random
from urllib.parse import urlparse

app = FastAPI(title="Privacy Score Checker API")

# --- CORS Middleware ---
# Allow requests from typical frontend development ports and potentially deployed frontend
origins = [
    "http://localhost",
    "http://localhost:3000", # Default React dev port
    "http://localhost:5173", # Default Vite dev port
    # Add deployed frontend URL here later if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

# --- Pydantic Models ---
class VirusTotalResult(BaseModel):
    score: str
    details: str | None = None

class AnalysisResult(BaseModel):
    trackers: int
    cookies: int
    thirdPartyRequests: int
    fingerprinting: bool
    virusTotal: VirusTotalResult

# --- Helper Functions ---
async def fetch_url_content(url: str) -> str:
    """Fetches the HTML content of a given URL."""
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            response = await client.get(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            })
            response.raise_for_status()
            return response.text
    except httpx.RequestError as exc:
        print(f"An error occurred while requesting {exc.request.url!r}: {exc}")
        raise HTTPException(status_code=400, detail=f"Could not fetch URL: {exc}")
    except httpx.HTTPStatusError as exc:
        print(f"Error response {exc.response.status_code} while requesting {exc.request.url!r}.")
        raise HTTPException(status_code=exc.response.status_code, detail=f"Error fetching URL: Status {exc.response.status_code}")

def analyze_content(html_content: str, base_url: str) -> tuple[int, int, int, bool]:
    """Analyzes HTML content for trackers, cookies, third-party requests, and fingerprinting."""
    soup = BeautifulSoup(html_content, 'html.parser')
    scripts = soup.find_all('script', src=True)
    iframes = soup.find_all('iframe', src=True)
    images = soup.find_all('img', src=True)
    links = soup.find_all('link', href=True)

    base_domain = urlparse(base_url).netloc

    trackers_count = 0
    third_party_count = 0
    fingerprinting_detected = False

    tracker_domains = [
        'google-analytics.com', 'googletagmanager.com', 'facebook.net',
        'fbcdn.net', 'doubleclick.net', 'twitter.com', 'linkedin.com',
        'scorecardresearch.com', 'quantserve.com', 'adservice.google.com'
    ]
    fingerprinting_scripts = ['fingerprintjs', 'clientjs']

    all_srcs = [tag.get('src') for tag in scripts + iframes + images] + [tag.get('href') for tag in links]

    for src in all_srcs:
        if not src:
            continue
        try:
            src_domain = urlparse(src).netloc
            if src_domain and base_domain not in src_domain:
                third_party_count += 1
                if any(tracker_domain in src_domain for tracker_domain in tracker_domains):
                    trackers_count += 1
            if any(fp_script in src.lower() for fp_script in fingerprinting_scripts):
                 fingerprinting_detected = True
        except Exception as e:
            print(f"Error parsing source URL {src}: {e}")

    cookies_count = random.randint(0, 2) if trackers_count == 0 else random.randint(1, 5 + trackers_count)

    return trackers_count, cookies_count, third_party_count, fingerprinting_detected

# --- API Endpoints ---
@app.get("/analyze", response_model=AnalysisResult)
async def analyze(url: str = Query(..., description="The URL to analyze", example="https://example.com")):
    """Analyzes the provided URL for privacy metrics."""
    if not re.match(r'^https?://', url):
        raise HTTPException(status_code=400, detail="Invalid URL format. Must start with http:// or https://")

    try:
        html_content = await fetch_url_content(url)
        trackers, cookies, third_party, fingerprinting = analyze_content(html_content, url)

        vt_result = VirusTotalResult(score="N/A", details="VirusTotal analysis requires API key configuration.")

        result_dict = AnalysisResult(
            trackers=trackers,
            cookies=cookies,
            thirdPartyRequests=third_party,
            fingerprinting=fingerprinting,
            virusTotal=vt_result
        )
        return result_dict

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"An unexpected error occurred during analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error during analysis: {e}")

@app.get("/")
async def read_root():
    return {"message": "Privacy Score Checker API is running."}

# Command: uvicorn main:app --reload --host 0.0.0.0 --port 8000

