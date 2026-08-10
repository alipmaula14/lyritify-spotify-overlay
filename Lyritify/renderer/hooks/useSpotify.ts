import { useState, useEffect, useCallback, useRef } from 'react'

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string
const REDIRECT_URI = 'http://127.0.0.1:8888/callback'
const SCOPES = [
  'user-read-playback-state',
  'user-read-currently-playing'
].join(' ')

export interface TrackInfo {
  id: string
  name: string
  artist: string
  album: string
  albumArt: string
  progressMs: number
  durationMs: number
  isPlaying: boolean
}

interface SpotifyState {
  isAuthenticated: boolean
  track: TrackInfo | null
  error: string | null
  login: () => void
}

function generateCodeVerifier(): string {
  const array = new Uint32Array(56)
  crypto.getRandomValues(array)
  return Array.from(array, (n) => n.toString(36)).join('').slice(0, 128)
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function useSpotify(): SpotifyState {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [track, setTrack] = useState<TrackInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const codeVerifierRef = useRef<string>('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('spotify_tokens')
    if (stored) {
      const { access, refresh } = JSON.parse(stored)
      setAccessToken(access)
      setRefreshToken(refresh)
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    window.electronAPI.onAuthCode(async (code: string) => {
      await exchangeCodeForToken(code)
    })
  }, [])

  const exchangeCodeForToken = async (code: string): Promise<void> => {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          code_verifier: codeVerifierRef.current
        })
      })

      const data = await response.json()

      if (data.access_token) {
        setAccessToken(data.access_token)
        setRefreshToken(data.refresh_token)
        setIsAuthenticated(true)
        localStorage.setItem('spotify_tokens', JSON.stringify({
          access: data.access_token,
          refresh: data.refresh_token
        }))
      }
    } catch {
      setError('Failed to exchange token')
    }
  }

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (!refreshToken) return null

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID
      })
    })

    const data = await response.json()

    if (data.access_token) {
      setAccessToken(data.access_token)
      localStorage.setItem('spotify_tokens', JSON.stringify({
        access: data.access_token,
        refresh: refreshToken
      }))
      return data.access_token
    }

    return null
  }, [refreshToken])

  const fetchCurrentTrack = useCallback(async (): Promise<void> => {
    if (!accessToken) return

    try {
      const response = await fetch(
        'https://api.spotify.com/v1/me/player/currently-playing',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (response.status === 401) {
        const newToken = await refreshAccessToken()
        if (!newToken) {
          setIsAuthenticated(false)
          localStorage.removeItem('spotify_tokens')
        }
        return
      }

      if (response.status === 204 || !response.ok) {
        setTrack(null)
        return
      }

      const data = await response.json()
      if (!data.item) return

      setTrack({
        id: data.item.id,
        name: data.item.name,
        artist: data.item.artists.map((a: { name: string }) => a.name).join(', '),
        album: data.item.album.name,
        albumArt: data.item.album.images[0]?.url ?? '',
        progressMs: data.progress_ms,
        durationMs: data.item.duration_ms,
        isPlaying: data.is_playing
      })
    } catch {
      setError('Failed to fetch track')
    }
  }, [accessToken, refreshAccessToken])

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return

    fetchCurrentTrack()
    pollRef.current = setInterval(fetchCurrentTrack, 1000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [isAuthenticated, accessToken, fetchCurrentTrack])

  const login = useCallback(async () => {
    const verifier = generateCodeVerifier()
    codeVerifierRef.current = verifier
    const challenge = await generateCodeChallenge(verifier)

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: challenge
    })

    window.electronAPI.openAuthWindow(
      `https://accounts.spotify.com/authorize?${params.toString()}`
    )
  }, [])

  return { isAuthenticated, track, error, login }
}