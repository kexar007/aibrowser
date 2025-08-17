import { useState } from 'react';
import type { WebScraper } from './types';

export const useWebScraper = (): WebScraper => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrapeQuery = async (query: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    scrapeQuery,
  };
};