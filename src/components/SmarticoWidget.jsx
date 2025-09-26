import React, { useEffect, useRef } from 'react';
import { useSmartico } from '../hooks/useSmartico';

/**
 * Componente genérico para renderizar widgets Smartico via embed
 * Usado como fallback quando a API não está disponível
 */
const SmarticoWidget = ({ 
  app, 
  instanceId, 
  tournamentId,
  width = '100%', 
  height = '400px',
  style = {},
  className = '',
  onLoad,
  onError
}) => {
  const widgetRef = useRef(null);

  useEffect(() => {
    if (!widgetRef.current) return;

    // Configura atributos do widget
    const widget = widgetRef.current;
    
    if (app) {
      widget.setAttribute('data-smartico-app', app);
    }
    
    if (instanceId) {
      widget.setAttribute('data-instance-id', instanceId);
    }
    
    if (tournamentId) {
      widget.setAttribute('data-tournament-id', tournamentId);
    }

    // Observa mudanças no widget para detectar carregamento
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Widget foi carregado
          if (onLoad) {
            onLoad();
          }
        }
      });
    });

    observer.observe(widget, { childList: true, subtree: true });

    // Timeout para detectar erro de carregamento
    const errorTimeout = setTimeout(() => {
      if (widget.children.length === 0) {
        if (onError) {
          onError(new Error('Widget não carregou em 10 segundos'));
        }
      }
    }, 10000);

    return () => {
      observer.disconnect();
      clearTimeout(errorTimeout);
    };
  }, [app, instanceId, tournamentId, onLoad, onError]);

  const combinedStyle = {
    width,
    height,
    border: 'none',
    ...style
  };

  return (
    <div 
      ref={widgetRef}
      className={`smartico-widget ${className}`}
      style={combinedStyle}
    />
  );
};

/**
 * Widget específico para Missões
 */
export const MissionsWidget = ({ className, style, onLoad, onError }) => (
  <SmarticoWidget
    app="missions"
    className={`missions-widget ${className || ''}`}
    style={style}
    onLoad={onLoad}
    onError={onError}
  />
);

/**
 * Widget específico para Lista de Torneios
 */
export const TournamentsListWidget = ({ className, style, onLoad, onError }) => (
  <SmarticoWidget
    app="tournaments"
    className={`tournaments-widget ${className || ''}`}
    style={style}
    onLoad={onLoad}
    onError={onError}
  />
);

/**
 * Widget específico para Torneio individual (com leaderboard)
 */
export const TournamentWidget = ({ instanceId, className, style, onLoad, onError }) => (
  <SmarticoWidget
    app="tournament"
    instanceId={instanceId}
    className={`tournament-widget ${className || ''}`}
    style={style}
    onLoad={onLoad}
    onError={onError}
  />
);

/**
 * Widget específico para Leaderboard
 */
export const LeaderboardWidget = ({ instanceId, className, style, onLoad, onError }) => (
  <SmarticoWidget
    app="leaderboard"
    instanceId={instanceId}
    className={`leaderboard-widget ${className || ''}`}
    style={style}
    onLoad={onLoad}
    onError={onError}
  />
);

/**
 * Componente que automaticamente escolhe entre API e Widget embed
 */
export const SmarticoFallback = ({ 
  children, 
  fallbackWidget, 
  showFallback = true,
  loadingComponent = null 
}) => {
  const { isReady, error } = useSmartico();

  // Mostra loading se fornecido
  if (!isReady && loadingComponent) {
    return loadingComponent;
  }

  // Se há erro e fallback está habilitado, mostra widget embed
  if (error && showFallback && fallbackWidget) {
    return (
      <div className="smartico-fallback-container">
        {fallbackWidget}
      </div>
    );
  }

  // Caso contrário, renderiza os children (componentes que usam API)
  return children;
};

export default SmarticoWidget;