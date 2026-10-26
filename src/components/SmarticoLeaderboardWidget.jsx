import React, { useEffect, useRef, useState } from 'react';

const SmarticoLeaderboardWidget = ({ 
  instanceId, 
  tournamentId, 
  onLoad, 
  onError 
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!window._smartico) {
      const errorMsg = 'Smartico SDK não está disponível';
      setError(errorMsg);
      setIsLoading(false);
      if (onError) onError(new Error(errorMsg));
      return;
    }

    if (typeof window._smartico.showWidget !== 'function') {
      const errorMsg = 'Smartico SDK não suporta showWidget';
      setError(errorMsg);
      setIsLoading(false);
      if (onError) onError(new Error(errorMsg));
      return;
    }

    const container = containerRef.current;
    if (!container) {
      const errorMsg = 'Container do widget não está disponível';
      setError(errorMsg);
      setIsLoading(false);
      if (onError) onError(new Error(errorMsg));
      return;
    }

    const loadWidget = () => {
      try {
        setIsLoading(true);
        setError(null);

        container.innerHTML = '';

        const widgetConfig = {
          iframe: `smartico-leaderboard-${Date.now()}`,
          zoom: 1,
          height: 'auto',
          wuuid: `REMOVIDO`,
          id: parseInt(tournamentId),
          instance_id: parseInt(instanceId),
          container
        };

        window._smartico.showWidget(
          'leaderboard',
          widgetConfig,
          (success) => {
            setIsLoading(false);
            if (success) {
              if (onLoad) onLoad();
            } else {
              const errorMsg = 'Falha ao carregar widget Smartico';
              setError(errorMsg);
              if (onError) onError(new Error(errorMsg));
            }
          }
        );

      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        if (onError) onError(err);
      }
    };

    loadWidget();

    return () => {
      container.innerHTML = '';
    };
  }, [instanceId, tournamentId, onLoad, onError]);

  if (error) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        background: 'rgba(220, 38, 38, 0.1)',
        border: '1px solid rgba(220, 38, 38, 0.3)',
        borderRadius: '8px',
        color: '#DC2626'
      }}>
        <p>❌ Erro ao carregar widget: {error}</p>
        <p style={{ fontSize: '12px', opacity: 0.8 }}>
          Verifique se o Smartico SDK está configurado corretamente
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '400px' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10
        }}>
          <div style={{
            padding: '20px',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px',
            color: '#8B5CF6'
          }}>
            <p>🔄 Carregando widget oficial...</p>
            <p style={{ fontSize: '12px', opacity: 0.8 }}>
              Aguarde enquanto carregamos todos os dados do torneio
            </p>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef}
        style={{
          width: '100%',
          minHeight: '400px',
          opacity: isLoading ? 0.3 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  );
};

export default SmarticoLeaderboardWidget;
