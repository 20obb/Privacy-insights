
import { useState } from 'react';
import './App.css'; // Ensure Tailwind is properly configured via index.css or similar
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import {
  Terminal, // Error icon
  Search, // Input icon
  ShieldAlert, // VirusTotal icon
  Cookie, // Cookies icon
  Fingerprint, // Fingerprinting icon
  Link2, // Third-party requests icon
  Target, // Trackers icon
  Loader2, // Loading spinner icon
  Info // Tooltip/Info icon
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // For tooltips (Step 008)

// Interface matching the FastAPI backend response model
interface AnalysisResult {
  trackers: number;
  cookies: number;
  thirdPartyRequests: number;
  fingerprinting: boolean;
  virusTotal: { score: string; details: string | null };
}

// Define the API endpoint URL
const API_ENDPOINT = "http://localhost:8000/analyze"; // Needs to be updated for deployment

// --- Reusable Result Card Component with Icon ---
interface ResultCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  tooltipText?: string; // For Step 008
  className?: string;
}

function ResultCard({ title, value, description, icon: Icon, tooltipText, className = '' }: ResultCardProps) {
  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          {description}
          {tooltipText && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 ml-1.5 cursor-help text-blue-500" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

// --- Main App Component ---
function App() {
  const [url, setUrl] = useState<string>('');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isValidUrl = (input: string): boolean => {
    return /^https?:\/\//.test(input);
  };

  const handleAnalyzeClick = async () => {
    if (!isValidUrl(url)) {
      setError('Invalid URL format. Please enter a URL starting with http:// or https://');
      setResults(null);
      return;
    }
    setIsLoading(true);
    setResults(null);
    setError(null);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_ENDPOINT || API_ENDPOINT;
      const response = await fetch(`${apiBaseUrl}?url=${encodeURIComponent(url)}`);

      if (!response.ok) {
        let errorDetail = `API request failed: ${response.statusText} (${response.status})`;
        try {
            const errorData = await response.json();
            if (errorData.detail) {
                errorDetail = errorData.detail;
            }
        } catch (jsonError) { /* Ignore */ }
        throw new Error(errorDetail);
      }

      const data: AnalysisResult = await response.json();
      setResults(data);

    } catch (err: any) {
      console.error("Analysis API call failed:", err);
      setError(err.message || 'Failed to fetch analysis results. Check API status and URL.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 p-4 md:p-8">
      <main className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Privacy Insights</h1>
          <p className="text-md text-gray-600">Analyze website privacy practices instantly.</p>
        </header>

        {/* Input Section */}
        <div className="relative flex items-center gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <Search className="absolute left-4 h-5 w-5 text-gray-400" />
          <Input
            type="url"
            placeholder="Enter website URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={`flex-grow pl-10 pr-2 py-2 border-none focus:ring-0 ${error && !isValidUrl(url) ? 'border-red-500' : ''}`}
            aria-invalid={error && !isValidUrl(url) ? "true" : "false"}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeClick()} // Allow Enter key submission
          />
          <Button onClick={handleAnalyzeClick} disabled={isLoading || !url} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Analyze'}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
           <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-800">
             <Terminal className="h-4 w-4" />
             <AlertTitle>Analysis Error</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}

        {/* Results Section - Skeleton Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className={`shadow-sm ${i === 4 ? 'md:col-span-2' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Section - Data Display */}
        {results && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <ResultCard
              title="Trackers"
              value={results.trackers.toString()}
              description="External scripts/pixels monitoring activity."
              icon={Target}
              tooltipText="These are elements, often from third parties, used to monitor your behavior across websites for advertising or analytics."
            />
            <ResultCard
              title="Cookies"
              value={results.cookies.toString()}
              description="Small data files stored on your device."
              icon={Cookie}
              tooltipText="Websites use cookies to remember information about you, like login status or preferences. Some cookies, especially third-party ones, can track you across sites."
            />
            <ResultCard
              title="Third-Party Requests"
              value={results.thirdPartyRequests.toString()}
              description="Connections to external domains."
              icon={Link2}
              tooltipText="Requests made by the website to domains other than its own, often for loading ads, fonts, analytics, or other external resources."
            />
            <ResultCard
              title="Fingerprinting Risk"
              value={results.fingerprinting ? 'Potential Risk' : 'Low Risk'}
              description="Techniques to uniquely identify your browser."
              icon={Fingerprint}
              tooltipText="Browser fingerprinting uses subtle characteristics of your browser and device (like screen size, fonts, plugins) to create a unique ID for tracking, even without cookies."
            />
            <ResultCard
              title="Security Scan (VirusTotal)"
              value={results.virusTotal.score}
              description={results.virusTotal.details || 'Basic security check result.'}
              icon={ShieldAlert}
              tooltipText="Checks the URL against VirusTotal's database of malicious websites. 'N/A' means the check couldn't be performed (e.g., requires API key)."
              className="md:col-span-2"
            />
          </div>
        )}

        {/* About Section */}
        <div className="w-full p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">About This Tool</h2>
          <p className="text-gray-700 mb-4 text-sm leading-relaxed">
            The <strong>Privacy Insights</strong> tool helps you evaluate the privacy level of websites. It analyzes potential risks like tracking elements, third-party requests, cookies, and browser fingerprinting techniques, generating a snapshot of the site's privacy practices.
          </p>
          <details className="text-sm">
              <summary className="cursor-pointer text-blue-600 hover:underline font-medium">Learn More</summary>
              <div className="mt-2 space-y-3 text-gray-600">
                  <div>
                      <h3 className="font-semibold mb-1">Key Features Analyzed:</h3>
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        <li><strong>Trackers</strong>: Identifies tracking elements.</li>
                        <li><strong>Cookies</strong>: Estimates cookies set by the site.</li>
                        <li><strong>Third-Party Requests</strong>: Counts requests to external domains.</li>
                        <li><strong>Fingerprinting</strong>: Checks for potential browser fingerprinting.</li>
                        <li><strong>Security Scan</strong>: Basic check via VirusTotal (requires setup for full results).</li>
                      </ul>
                  </div>
                  <div>
                      <h3 className="font-semibold mb-1">Benefits:</h3>
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        <li>Understand website privacy practices.</li>
                        <li>Make informed browsing decisions.</li>
                        <li>Raise awareness about online privacy.</li>
                      </ul>
                  </div>
              </div>
          </details>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-xs text-gray-500">
          <p>Privacy Insights - Analyze with care. Results are indicative.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;

