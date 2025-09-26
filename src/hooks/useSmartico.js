import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar a API Smartico de forma reativa
 * @returns {Object} { api, dp, isReady, error, identifyUser }
 */
export const useSmartico = () => {
  const [isReady, setIsReady] = useState(false);
  const [api, setApi] = useState(null);
  const [dp, setDp] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verifica se já está pronto
    const checkInitialState = () => {
      if (window._smartico && window._smartico.api) {
        setApi(window._smartico.api);
        setDp(window._smartico.dp);
        setIsReady(true);
        return true;
      }
      return false;
    };

    // Se já estiver pronto, não precisa esperar o evento
    if (checkInitialState()) {
      return;
    }

    // Listener para o evento customizado
    const handleSmarticoReady = (event) => {
      try {
        setApi(event.detail.api);
        setDp(event.detail.dp);
        setIsReady(true);
        setError(null);
      } catch (err) {
        setError(err);
      }
    };

    // Adiciona o listener
    window.addEventListener('smartico:ready', handleSmarticoReady);

    // Timeout de segurança
    const timeout = setTimeout(() => {
      if (!isReady) {
        setError(new Error('Timeout: Smartico não carregou em 10 segundos'));
      }
    }, 10000);

    // Cleanup
    return () => {
      window.removeEventListener('smartico:ready', handleSmarticoReady);
      clearTimeout(timeout);
    };
  }, [isReady]);

  // Função para identificar usuário dinamicamente
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
    identifyUser
  };
};

export default useSmartico;