// frontend/src/hooks/useJira.js
// Keep original
import { useState, useCallback } from 'react';
import { jiraApi } from '../services/api.js';

export const useJira = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);

  const fetchTicket = useCallback(async (key) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await jiraApi.getTicket(key);
      setTicket(response);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setTicket(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    ticket,
    loading,
    error,
    fetchTicket,
    reset
  };
};