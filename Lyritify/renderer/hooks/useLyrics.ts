import { useState, useEffect, useRef } from 'react'
import { TrackInfo } from './useSpotify'

export interface LyricLine {
  time: number   // in milliseconds
  text: string
}

interface LyricsState {
  lyrics: LyricLine[]
  currentIndex: number
  isLoading: boolean
  hasLyrics: boolean
}

// Parse .lrc format into array of { time, text }
// Example LRC line: [01:23.45] Some lyric text
function parseLRC(lrc: string): LyricLine[] {
  const lines = lrc.split('\n')
  const result: LyricLine[] = []

  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
    if (!match) continue

    const minutes = parseInt(match[1])
    const seconds = parseInt(match[2])
    const ms = parseInt(match[3].padEnd(3, '0'))   // normalize to ms
    const text = match[4].trim()

    if (text) {
      result.push({
        time: minutes * 60 * 1000 + seconds * 1000 + ms,
        text
      })
    }
  }

  return result.sort((a, b) => a.time - b.time)
}

async function fetchLyrics(
  track: string,
  artist: string,
  album: string,
  duration: number
): Promise<LyricLine[]> {
  try {
    const params = new URLSearchParams({
      track_name: track,
      artist_name: artist,
      album_name: album,
      duration: Math.floor(duration / 1000).toString()
    })

    const response = await fetch(
      `https://lrclib.net/api/get?${params.toString()}`
    )

    if (!response.ok) return []

    const data = await response.json()

    // LRCLIB returns syncedLyrics (with timestamps) or plainLyrics
    if (data.syncedLyrics) {
      return parseLRC(data.syncedLyrics)
    }

    return []
  } catch {
    return []
  }
}

function findCurrentIndex(lyrics: LyricLine[], progressMs: number): number {
  let index = 0

  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].time <= progressMs) {
      index = i
    } else {
      break
    }
  }

  return index
}

export function useLyrics(track: TrackInfo | null): LyricsState {
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const lastTrackId = useRef<string>('')

  // Fetch lyrics when track changes
  useEffect(() => {
    if (!track) {
      setLyrics([])
      setCurrentIndex(0)
      return
    }

    // Don't refetch if same track
    if (track.id === lastTrackId.current) return
    lastTrackId.current = track.id

    setIsLoading(true)
    setLyrics([])
    setCurrentIndex(0)

    fetchLyrics(track.name, track.artist, track.album, track.durationMs)
      .then((lines) => {
        setLyrics(lines)
        setIsLoading(false)
      })
  }, [track?.id])

  // Update current lyric line based on playback progress
  useEffect(() => {
    if (!track || lyrics.length === 0) return

    const index = findCurrentIndex(lyrics, track.progressMs)
    setCurrentIndex(index)
  }, [track?.progressMs, lyrics])

  return {
    lyrics,
    currentIndex,
    isLoading,
    hasLyrics: lyrics.length > 0
  }
}