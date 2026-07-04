import { useState, useCallback } from 'react';
import { aiApi } from '../services/api.js';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const generateTestCases = useCallback(async (ticketKey) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await aiApi.generateTestCases(ticketKey);
      setResult(response);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    result,
    loading,
    error,
    generateTestCases,
    reset
  };
};