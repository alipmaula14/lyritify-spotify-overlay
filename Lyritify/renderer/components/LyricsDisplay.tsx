import { LyricLine } from '../hooks/useLyrics'
import { TrackInfo } from '../hooks/useSpotify'

interface Props {
  lyrics: LyricLine[]
  currentIndex: number
  isLoading: boolean
  hasLyrics: boolean
  track: TrackInfo | null
  onSeek: (positionMs: number) => void
}

const VISIBLE = 5
const CENTER = Math.floor(VISIBLE / 2)

export function LyricDisplay({ lyrics, currentIndex, isLoading, hasLyrics, track, onSeek }: Props) {
  // No track playing
  if (!track) {
    return (
      <div className="state-message">
        <span>Nothing playing</span>
      </div>
    )
  }

  // Fetching lyrics
  if (isLoading) {
    return (
      <div className="state-message">
        <span>Loading lyrics...</span>
      </div>
    )
  }

  // No synced lyrics found
  if (!hasLyrics) {
    return (
      <div className="state-message">
        <div className="track-info">
          <img src={track.albumArt} alt={track.album} className="album-art" />
          <div>
            <p className="track-name">{track.name}</p>
            <p className="track-artist">{track.artist}</p>
          </div>
        </div>
        <span className="no-lyrics">No lyrics available</span>
      </div>
    )
  }

  const startIdx = Math.max(0, Math.min(currentIndex - CENTER, lyrics.length - VISIBLE))
  const visibleLyrics = lyrics.slice(startIdx, startIdx + VISIBLE)

  return (
    <div className="lyrics-window">
      {visibleLyrics.map((line, i) => {
        const absoluteIndex = startIdx + i
        const isActive = absoluteIndex === currentIndex
        const dist = Math.abs(absoluteIndex - currentIndex)

        return (
          <div
            key={absoluteIndex}
            className={[
              'lyric-line',
              isActive ? 'active' : '',
              dist === 1 ? 'near' : dist > 1 ? 'far' : ''
            ].join(' ').trim()}
            onClick={() => onSeek(line.time)}
          >
            {line.text}
          </div>
        )
      })}
    </div>
  )
}
