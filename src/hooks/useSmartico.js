import { useState, useEffect, useCallback, useRef } from 'react';

export const useSmartico = () => {
  const [isReady, setIsReady] = useState(false);
  const [api, setApi] = useState(null);
  const [dp, setDp] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('loading');
  const statusRef = useRef('loading');

  useEffect(() => {
    const checkInitialState = () => {
      if (window._smartico && window._smartico.api) {
        setApi(window._smartico.api);
        setDp(window._smartico.dp);
        setIsReady(true);
        setStatus('ready');
        statusRef.current = 'ready';
        return true;
      }
      return false;
    };

    if (checkInitialState()) {
      return;
    }

    const handleSmarticoReady = (event) => {
      try {
        setApi(event.detail.api);
        setDp(event.detail.dp);
        setIsReady(true);
        setError(null);
        setStatus('ready');
        statusRef.current = 'ready';
      } catch (err) {
        setError(err);
        setStatus('error');
        statusRef.current = 'error';
      }
    };

    const handleSmarticoDisabled = () => {
      setApi(null);
      setDp(null);
      setIsReady(false);
      setError(null);
      setStatus('disabled');
      statusRef.current = 'disabled';
    };

    const handleSmarticoError = (event) => {
      const message =
        (event && event.detail && typeof event.detail.error === 'string' && event.detail.error) ||
        'Erro ao carregar Smartico';
      setError(new Error(message));
      setIsReady(false);
      setStatus('error');
      statusRef.current = 'error';
    };

    window.addEventListener('smartico:ready', handleSmarticoReady);
    window.addEventListener('smartico:disabled', handleSmarticoDisabled);
    window.addEventListener('smartico:error', handleSmarticoError);

    const timeout = setTimeout(() => {
      if (!isReady && statusRef.current !== 'disabled') {
        setError(new Error('Timeout: Smartico não carregou em 10 segundos'));
        setStatus('error');
        statusRef.current = 'error';
      }
    }, 10000);

    return () => {
      window.removeEventListener('smartico:ready', handleSmarticoReady);
      window.removeEventListener('smartico:disabled', handleSmarticoDisabled);
      window.removeEventListener('smartico:error', handleSmarticoError);
      clearTimeout(timeout);
    };
  }, [isReady]);

  const identifyUser = useCallback((userId, userHash) => {
    if (window.identifyUser) {
      window.identifyUser(userId, userHash);
    }
  }, []);

  return {
    api,
    dp,
    isReady,
    error,
    identifyUser,
    status
  };
};

export default useSmartico;
