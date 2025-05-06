
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For showing errors
import { Terminal } from "lucide-react"; // Icon for alert

// Interface matching the FastAPI backend response model
interface AnalysisResult {
  trackers: number;
  cookies: number;
  thirdPartyRequests: number; // Updated field name
  fingerprinting: boolean;
  virusTotal: { score: string; details: string | null };
}

// Define the API endpoint URL (assuming backend runs on port 8000 locally)
const API_ENDPOINT = "http://localhost:8000/analyze";

export default function Home() {
  const [url, setUrl] = useState<string>('');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Basic URL validation (starts with http:// or https://)
  const isValidUrl = (input: string): boolean => {
    return /^https?:\[/]{2}/.test(input);
  };

  const handleAnalyzeClick = async () => {
    if (!isValidUrl(url)) {
      setError('Invalid URL format. Please enter a URL starting with http:// or https://');
      return;
    }
    setIsLoading(true);
    setResults(null);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINT}?url=${encodeURIComponent(url)}`);

      if (!response.ok) {
        // Try to get error detail from API response body
        let errorDetail = `API request failed with status: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.detail) {
                errorDetail = errorData.detail;
            }
        } catch (jsonError) {
            // Ignore if response body is not JSON or empty
        }
        throw new Error(errorDetail);
      }

      const data: AnalysisResult = await response.json();
      setResults(data);

    } catch (err: any) {
      console.error("Analysis API call failed:", err);
      setError(err.message || 'Failed to fetch analysis results. Check if the backend API is running and the URL is correct.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Privacy Score Checker</h1>

        {/* Input Section */}
        <div className="flex gap-2 mb-6">
          <Input
            type="url"
            placeholder="Enter website URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={`flex-grow ${error && !isValidUrl(url) ? 'border-red-500' : ''}`}
            aria-invalid={error && !isValidUrl(url) ? "true" : "false"}
          />
          <Button onClick={handleAnalyzeClick} disabled={isLoading || !url}>
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
           <Alert variant="destructive" className="mb-4">
             <Terminal className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}

        {/* Results Section */}
        {isLoading && <p className="text-center text-gray-600">Loading analysis results...</p>}

        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Using a reusable Card component concept (implementation can be externalized) */}
            <ResultCard title="Trackers" value={results.trackers.toString()} description="Detected tracking elements." />
            <ResultCard title="Cookies" value={results.cookies.toString()} description="Number of cookies set (estimated)." />
            <ResultCard title="Third-Party Requests" value={results.thirdPartyRequests.toString()} description="External resources loaded." />
            <ResultCard title="Fingerprinting" value={results.fingerprinting ? 'Detected' : 'Not Detected'} description="Potential browser fingerprinting techniques." />
            <ResultCard title="VirusTotal Score" value={results.virusTotal.score} description={results.virusTotal.details || 'Security scan result.'} className="md:col-span-2" />
          </div>
        )}
      </div>

      {/* Placeholder for Homepage content */}
      <div className="w-full max-w-2xl mt-12 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">About Privacy Score Checker</h2>
        <p className="text-gray-700">
          (Placeholder for the descriptive content about the project - what it is and why it's important. This will be populated later based on the original Arabic text provided by the user, translated and adapted to English.)
        </p>
      </div>
    </main>
  );
}

// Simple Reusable Result Card Component (can be moved to a separate file)
interface ResultCardProps {
  title: string;
  value: string;
  description: string;
  className?: string;
}

function ResultCard({ title, value, description, className = '' }: ResultCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
}


