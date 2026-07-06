// hooks/useAI.js
import { useState } from 'react';
import api from '../services/api';

export const useAI = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateTestCases = async (ticketData) => {
    // Pass the full ticket object, not just the key
    if (!ticketData || !ticketData.key) {
      setError('Invalid ticket data');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/ai/generate', {
        ticketKey: ticketData.key,
        ticketData: ticketData, // ← send full ticket data to avoid re-fetch
      });

      setResult(response);
      return response;
    } catch (err) {
      const message = err.message || 'Failed to generate test cases';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, generateTestCases };
};