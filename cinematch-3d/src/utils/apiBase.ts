const configuredBase = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '')

export const API_BASE = configuredBase
  ? (configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`)
  : '/api'

const API_ORIGIN = API_BASE.startsWith('http') ? API_BASE.replace(/\/api$/, '') : ''

export function backendUrl(path: string) {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:')) return path
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}