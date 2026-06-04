export interface ScrapingResult {
  success: boolean
  content?: string
  source: string
  collectedAt: Date
  error?: {
    reason: 'blocked' | 'login_required' | 'timeout' | 'api_unavailable' | 'invalid_url'
    message: string
  }
}
