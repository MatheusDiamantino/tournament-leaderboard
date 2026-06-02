const toInt = (value) => {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(parsed) ? parsed : 0
}

export const CHRISTMAS_MISSIONS_ID = toInt(import.meta.env.VITE_CHRISTMAS_MISSIONS_ID)
export const CHRISTMAS_TOURNAMENT_ID = toInt(import.meta.env.VITE_CHRISTMAS_TOURNAMENT_ID)
export const CHRISTMAS_DAILY_GIFT_ID = toInt(import.meta.env.VITE_CHRISTMAS_DAILY_GIFT_ID)
export const CHRISTMAS_CAMPAIGN_NAME = String(import.meta.env.VITE_CHRISTMAS_CAMPAIGN_NAME ?? '').trim()
