import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Result.css';

interface AnalysisResult {
  status: 'Safe' | 'Suspicious' | 'Phishing';
  summary: string;
}

export const Result = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        // For development, simulate an API response
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
        setResult({
          status: 'Suspicious',
          summary: 'This is a demo result. The email contains suspicious elements that might indicate a phishing attempt. Please exercise caution.'
        });
        
        // Uncomment when backend is ready
        /*
        const response = await fetch('/api/analysis-result');
        if (!response.ok) {
          throw new Error('Failed to fetch analysis result');
        }
        const data = await response.json();
        setResult(data);
        */
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, []);

  if (loading) {
    return (
      <div className="result-container">
        <div className="result-card">
          <div className="loading">Analyzing email...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-container">
        <div className="result-card">
          <div className="error">{error}</div>
          <button type="button" onClick={() => navigate('/')} className="back-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="result-container">
        <div className="result-card">
          <div className="error">No analysis result found</div>
          <button type="button" onClick={() => navigate('/')} className="back-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="result-container">
      <div className="result-card">
        <div className={`status ${result.status.toLowerCase()}`}>
          {result.status}
        </div>
        <p className="summary">{result.summary}</p>
        <button type="button" onClick={() => navigate('/')} className="back-button">
          Analyze Another Email
        </button>
      </div>
    </div>
  );
};
