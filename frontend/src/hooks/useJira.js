import { useState, useCallback } from 'react';
import { jiraApi } from '../services/api.js';

export const useJira = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);

  const fetchTicket = useCallback(async (ticketKey) => {
    setLoading(true);
    setError(null);
    setTicket(null);
    
    try {
      const response = await jiraApi.getTicket(ticketKey);
      setTicket(response);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateTicketKey = (key) => {
    const pattern = /^[A-Z]+-\d+$/;
    return pattern.test(key);
  };

  return {
    ticket,
    loading,
    error,
    fetchTicket,
    validateTicketKey
  };
};