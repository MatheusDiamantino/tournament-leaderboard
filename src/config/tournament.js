const toInt = (value) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const TOURNAMENT_ID = toInt(import.meta.env.VITE_TOURNAMENT_ID);
export const TOURNAMENT_INSTANCE_ID = toInt(import.meta.env.VITE_TOURNAMENT_INSTANCE_ID);

export const LEADERBOARD_ENDPOINTS = [
  TOURNAMENT_ID ? `/tournament/${TOURNAMENT_ID}/leaderboard` : null,
  TOURNAMENT_INSTANCE_ID ? `/tournament/instance/${TOURNAMENT_INSTANCE_ID}/leaderboard` : null,
].filter(Boolean);
