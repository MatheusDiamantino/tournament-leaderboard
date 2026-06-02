import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const SMARTICO_SCRIPT_SRC = 'https://libs.smartico.ai/smartico.js'

const getEnvString = (value) => (typeof value === 'string' ? value.trim() : '')

const toInt = (value) => {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(parsed) ? parsed : 0
}

const dispatchSmarticoEvent = (eventName, detail) => {
  window.dispatchEvent(new CustomEvent(eventName, { detail }))
}

const updateDeepLinks = () => {
  const tournamentId = toInt(import.meta.env.VITE_SMARTICO_DP_TOURNAMENT_ID ?? import.meta.env.VITE_TOURNAMENT_ID)
  const missionsId = toInt(import.meta.env.VITE_SMARTICO_DP_MISSIONS_ID)
  const dailyGiftId = toInt(import.meta.env.VITE_SMARTICO_DP_DAILY_GIFT_ID)

  const setHref = (elementId, href) => {
    const element = document.getElementById(elementId)
    if (element && element.tagName === 'A') {
      element.setAttribute('href', href)
    }
  }

  if (tournamentId) setHref('smartico-tournaments-link', `dp:tournaments?id=${tournamentId}`)
  if (missionsId) setHref('smartico-missions-link', `dp:missions?id=${missionsId}`)
  if (dailyGiftId) setHref('smartico-daily-gift-link', `dp:daily_gift?id=${dailyGiftId}`)
}

const loadSmarticoScript = () =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SMARTICO_SCRIPT_SRC}"]`)
    if (existing) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = SMARTICO_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Falha ao carregar smartico.js'))
    document.head.appendChild(script)
  })

const bootstrapSmartico = async () => {
  updateDeepLinks()

  const projectKey = getEnvString(import.meta.env.VITE_SMARTICO_PROJECT_KEY)
  const brandKey = getEnvString(import.meta.env.VITE_SMARTICO_BRAND_KEY)

  if (!projectKey || !brandKey) {
    dispatchSmarticoEvent('smartico:disabled', { reason: 'missing_env' })
    return
  }

  if (window.location.hostname === 'localhost') {
    window._smartico_allow_localhost = true
  }

  const useDemoUser = String(import.meta.env.VITE_SMARTICO_USE_DEMO_USER ?? '').toLowerCase() === 'true'
  const demoUserId = getEnvString(import.meta.env.VITE_SMARTICO_DEMO_USER_ID) || 'public-demo'
  const initialUserId = getEnvString(import.meta.env.VITE_SMARTICO_USER_ID) || (useDemoUser ? demoUserId : '')
  const initialUserHash = getEnvString(import.meta.env.VITE_SMARTICO_USER_HASH)

  window.identifyUser = (userId, userHash) => {
    const nextUserId = getEnvString(userId)
    const nextUserHash = getEnvString(userHash)

    if (nextUserId) window._smartico_user_id = nextUserId
    if (nextUserHash) window._smartico_user_hash = nextUserHash

    if (window._smartico?.identify && nextUserId) {
      window._smartico.identify({ ext_user_id: nextUserId })
    }
  }

  if (initialUserId) window._smartico_user_id = initialUserId
  if (initialUserHash) window._smartico_user_hash = initialUserHash

  try {
    await loadSmarticoScript()

    const init = window._smartico?.init
    if (typeof init !== 'function') {
      dispatchSmarticoEvent('smartico:error', { error: 'SDK carregou, mas window._smartico.init não existe' })
      return
    }

    const initOptions = { brand_key: brandKey }
    if (window._smartico_user_id) initOptions.user_id = window._smartico_user_id
    if (window._smartico_user_hash) initOptions.user_hash = window._smartico_user_hash

    init(projectKey, initOptions)

    const startedAt = Date.now()
    const pollReady = () => {
      if (window._smartico?.api) {
        dispatchSmarticoEvent('smartico:ready', { api: window._smartico.api, dp: window._smartico.dp })
        return
      }
      if (Date.now() - startedAt >= 10000) {
        dispatchSmarticoEvent('smartico:error', { error: 'Timeout: Smartico não ficou pronto em 10 segundos' })
        return
      }
      setTimeout(pollReady, 100)
    }
    pollReady()
  } catch (err) {
    dispatchSmarticoEvent('smartico:error', { error: err instanceof Error ? err.message : String(err) })
  }
}

bootstrapSmartico()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
