import React, { useEffect, useRef } from 'react';
import { useSmartico } from '../hooks/useSmartico';

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

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          if (onLoad) {
            onLoad();
          }
        }
      });
    });

    observer.observe(widget, { childList: true, subtree: true });

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

export const MissionsWidget = ({ className, style, onLoad, onError }) => (
  <SmarticoWidget
    app="missions"
    className={`missions-widget ${className || ''}`}
    style={style}
    onLoad={onLoad}
    onError={onError}
  />
);

export const TournamentsListWidget = ({ className, style, onLoad, onError }) => (
  <SmarticoWidget
    app="tournaments"
    className={`tournaments-widget ${className || ''}`}
    style={style}
    onLoad={onLoad}
    onError={onError}
  />
);

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

export const SmarticoFallback = ({ 
  children, 
  fallbackWidget, 
  showFallback = true,
  loadingComponent = null 
}) => {
  const { isReady, error } = useSmartico();

  if (!isReady && loadingComponent) {
    return loadingComponent;
  }

  if (error && showFallback && fallbackWidget) {
    return (
      <div className="smartico-fallback-container">
        {fallbackWidget}
      </div>
    );
  }

  return children;
};

export default SmarticoWidget;