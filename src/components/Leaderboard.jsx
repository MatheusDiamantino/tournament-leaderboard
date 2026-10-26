import React, { useState, useEffect, useRef } from "react";
import { useSmartico } from "../hooks/useSmartico";
import SmarticoLeaderboardWidget from "./SmarticoLeaderboardWidget";
import { TOURNAMENT_ID, TOURNAMENT_INSTANCE_ID, LEADERBOARD_ENDPOINTS } from "../config/tournament";

const Leaderboard = ({ tournamentId = TOURNAMENT_ID, instanceId = String(TOURNAMENT_INSTANCE_ID) }) => {
  const { api, isReady, error, status } = useSmartico();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [useWidget, setUseWidget] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const prizesGridRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - prizesGridRef.current.offsetLeft);
    setScrollLeft(prizesGridRef.current.scrollLeft);
    prizesGridRef.current.classList.add('dragging');
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (prizesGridRef.current) {
      prizesGridRef.current.classList.remove('dragging');
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (prizesGridRef.current) {
      prizesGridRef.current.classList.remove('dragging');
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - prizesGridRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    prizesGridRef.current.scrollLeft = scrollLeft - walk;
  };

  const jackpotTiers = [
    { threshold: 1500000, prize: "Prêmio Prata", color: "#C0C0C0", emoji: "🥈" },
    { threshold: 3000000, prize: "Prêmio Ouro", color: "#FFD700", emoji: "🥇" },
    { threshold: 7500000, prize: "Prêmio Diamante", color: "#B9F2FF", emoji: "👑" },
    { threshold: 15000000, prize: "Prêmio Lendário", color: "#FF4500", emoji: "🔥" },
    { threshold: 20000000, prize: "Prêmio Supremo", color: "#8B0000", emoji: "⚡" },
  ];

  const calculateJackpotStats = () => {
    if (!leaderboardData.length) return null;

    const totalPlayers = leaderboardData.length;
    const totalScore = leaderboardData.reduce(
      (sum, player) => sum + (player.scores || 0),
      0
    );
    const averageScore = Math.round(totalScore / totalPlayers);
    const topScore = leaderboardData[0]?.scores || 0;

    const nextTier = jackpotTiers.find((tier) => totalScore < tier.threshold);
    const currentTier = jackpotTiers
      .slice()
      .reverse()
      .find((tier) => totalScore >= tier.threshold);

    return {
      totalPlayers,
      totalScore,
      averageScore,
      topScore,
      nextTier,
      currentTier,
    };
  };

  const jackpotStats = calculateJackpotStats();

  useEffect(() => {
    if (!isReady || !api) return;

    const fetchLeaderboardData = async () => {
      try {
        setApiError(null);
        
        let allPlayers = [];
        
        if (api && api.api && api.api.label_api_key) {
          try {
            const apiKey = api.api.label_api_key;
            const publicUrl = api.api.publicUrl.trim();
            
            const labelFormats = [
              `label=${apiKey}`,
              `label_key=${apiKey}`,
              `api_key=${apiKey}&label=${apiKey}`
            ];
            
            const endpoints = LEADERBOARD_ENDPOINTS;
            
            for (const endpoint of endpoints) {
              for (const labelFormat of labelFormats) {
                try {
                  const finalUrl = `${publicUrl}${endpoint}?${labelFormat}&limit=20`;
                  
                  const response = await fetch(finalUrl, {
                    method: 'GET',
                    headers: {
                      'Accept': 'application/json'
                    }
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    
                    let players = [];
                    if (Array.isArray(data)) {
                      players = data;
                    } else if (data.players && Array.isArray(data.players)) {
                      players = data.players;
                    } else if (data.leaderboard && Array.isArray(data.leaderboard)) {
                      players = data.leaderboard;
                    } else if (data.data && Array.isArray(data.data)) {
                      players = data.data;
                    } else if (data.results && Array.isArray(data.results)) {
                      players = data.results;
                    }
                    
                    if (players.length > 0) {
                      allPlayers = players.slice(0, 20);
                      setLeaderboardData(allPlayers);
                      setApiError(null);
                      return;
                    }
                  }
                } catch {
                }
              }
            }
          } catch {
          }
        }
        
        if (window._smartico?.api) {
          try {
            const result = await window._smartico.api.getTournamentInstanceInfo(String(instanceId));
            
            if (result && (result.players || result.leaderboard || Array.isArray(result))) {
              let players = [];
              if (result.players) {
                players = result.players;
              } else if (result.leaderboard) {
                players = result.leaderboard;
              } else if (Array.isArray(result)) {
                players = result;
              }
              
              if (players.length > 0) {
                const limitedPlayers = players.slice(0, 20);
                setLeaderboardData(limitedPlayers);
                setApiError(null);
                return;
              }
            }
          } catch {
          }
        }
        
        setUseWidget(true);
        
      } catch (error) {
        setApiError(error);
        setUseWidget(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();

    const interval = setInterval(() => {
      fetchLeaderboardData();
    }, 5000);

    return () => clearInterval(interval);
  }, [isReady, api, instanceId]);

  if (useWidget && status !== 'disabled') {
    return (
      <div className="leaderboard-container">
        <div className="tournament-header">
          <h1>🏆 TORNEIO SMARTICO</h1>
          <p>Leaderboard Oficial - Todos os Usuários</p>
          {apiError && (
            <div style={{
              background: 'rgba(255, 165, 0, 0.1)',
              border: '1px solid rgba(255, 165, 0, 0.3)',
              borderRadius: '8px',
              padding: '10px',
              margin: '10px 0',
              fontSize: '12px',
              color: '#FFA500'
            }}>
              ⚠️ API indisponível - Usando widget oficial para garantir todos os dados
            </div>
          )}
        </div>
        
        <SmarticoLeaderboardWidget 
          instanceId={instanceId}
          tournamentId={tournamentId}
        />
      </div>
    );
  }

  const getThemeLevel = () => {
    if (!jackpotStats) return 0;

    const score = jackpotStats.totalScore;
    if (score >= 50000) return 6;
    if (score >= 25000) return 5;
    if (score >= 10000) return 4;
    if (score >= 5000) return 3;
    if (score >= 2000) return 2;
    if (score >= 1000) return 1;
    return 0;
  };

  const themeLevel = getThemeLevel();
  const isLoading = status === 'loading' || (isReady && loading);

  return (
    <div className={`leaderboard-container theme-level-${themeLevel}`}>
      <div className="tournament-header">
        <h1>🎰 JACKPOT 🎰</h1>
        {status === 'disabled' && <p>Smartico não configurado (.env)</p>}
        {status === 'error' && <p>Smartico com erro: {error?.message || 'erro desconhecido'}</p>}
        {isLoading && status !== 'disabled' && <p>Carregando dados...</p>}
      </div>

      {jackpotStats && (
        <div className="jackpot-stats">
          <div className="stats-horizontal-layout">
            <div className="total-points-section">
              <div className="points-display">
                <div className="points-value">
                  {jackpotStats.totalScore.toLocaleString()}
                </div>
                <div className="points-label">🎯 PONTOS TOTAIS</div>
              </div>
            </div>

            {jackpotStats.nextTier && (
              <div className="next-prize-section">
                <div className="prize-info">
                  <div className="prize-header">
                    <span className="prize-name">
                      {jackpotStats.nextTier.emoji} {jackpotStats.nextTier.prize}
                    </span>
                    <span className="prize-percentage">
                      {Math.round(
                        (jackpotStats.totalScore / jackpotStats.nextTier.threshold) *
                          100
                      )}%
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(
                          (jackpotStats.totalScore / jackpotStats.nextTier.threshold) *
                            100,
                          100
                        )}%`,
                        backgroundColor: jackpotStats.nextTier.color,
                      }}
                    />
                  </div>
                  <div className="remaining-points">
                    Faltam {(jackpotStats.nextTier.threshold - jackpotStats.totalScore).toLocaleString()} pontos
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {jackpotStats && (
        <div className="all-prizes-section">
          <h3 className="prizes-title">🏆 Todos os Prêmios e Metas</h3>
          <div 
            className="prizes-grid"
            ref={prizesGridRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{ userSelect: 'none' }}
          >
            {jackpotTiers.map((tier, index) => {
              const isCompleted = jackpotStats.totalScore >= tier.threshold;
              const isCurrent = jackpotStats.currentTier && jackpotStats.currentTier.threshold === tier.threshold;
              const isNext = jackpotStats.nextTier && jackpotStats.nextTier.threshold === tier.threshold;
              
              return (
                <React.Fragment key={index}>
                  <div 
                    className={`prize-card ${isCompleted ? 'completed' : 'locked'} ${isCurrent ? 'current' : ''} ${isNext ? 'next' : ''}`}
                    style={{
                      borderColor: tier.color,
                      backgroundColor: isCompleted ? `${tier.color}20` : 'rgba(128, 128, 128, 0.1)',
                      opacity: isCompleted ? 1 : 0.6
                    }}
                  >
                    <div className="prize-emoji">{tier.emoji}</div>
                    <div className="prize-name">{tier.prize}</div>
                    <div className="prize-threshold">
                      {tier.threshold.toLocaleString()} pontos
                    </div>
                    <div className="prize-status">
                      {isCompleted ? '✅ Conquistado' : 
                       isNext ? '🎯 Próximo' : 
                       '🔒 Bloqueado'}
                    </div>
                  </div>
                  
                  {index < jackpotTiers.length - 1 && (
                    <div className={`prize-connector ${isCompleted ? 'completed' : 'locked'}`}>
                      <div className="connector-line"></div>
                      <div className="connector-dot"></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      <div className="leaderboard-list">
        {leaderboardData.map((player, index) => {
          const isCurrentUser = player.is_me === true;
          const position = index + 1;
          
          let borderColor = "#4B5563";
          if (position === 1) borderColor = "#FFD700";
          else if (position === 2) borderColor = "#C0C0C0";
          else if (position === 3) borderColor = "#CD7F32";
          else if (position <= 10) borderColor = "#8B5CF6";

          return (
            <div
              key={`${player.public_username || 'player'}-${position}`}
              className={`player-card ${isCurrentUser ? 'current-user' : ''}`}
              style={{ border: `2px solid ${borderColor}` }}
            >
              <div className="player-position">
                <div className="position-number">#{position}</div>
                <div className="position-medal">
                  {position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : ''}
                </div>
              </div>

              <div className="player-info">
                <div className="player-name">
                  {player.public_username || player.username || player.name || `Player ${position}`}
                  {isCurrentUser && <span className="you-badge">Você</span>}
                </div>
                <div className="player-details">
                  <div className="player-score">
                    {(player.scores ?? player.score ?? player.points ?? 0).toLocaleString()} pts
                  </div>
                </div>
              </div>

              <div className="player-stats">
                <div className="player-progress">
                  <div className="progress-mini">
                    <div
                      className="progress-mini-fill"
                      style={{
                        width: `${Math.min(
                          ((player.scores ?? player.score ?? player.points ?? 0) / jackpotTiers[jackpotTiers.length - 1].threshold) * 100,
                          100
                        )}%`,
                        backgroundColor: borderColor,
                      }}
                    />
                  </div>
                  <div className="progress-text">progresso</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {leaderboardData.length === 0 && (
        <div className="leaderboard-footer">
          {status === 'disabled'
            ? 'Configure VITE_SMARTICO_PROJECT_KEY/VITE_SMARTICO_BRAND_KEY e IDs do torneio no .env para buscar dados reais.'
            : 'Nenhum dado disponível ainda.'}
        </div>
      )}
    
    </div>
  );
};

export default Leaderboard;
