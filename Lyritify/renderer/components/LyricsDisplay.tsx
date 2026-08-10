import { useEffect, useRef } from 'react'
import { LyricLine } from '../hooks/useLyrics'
import { TrackInfo } from '../hooks/useSpotify'

interface Props {
  lyrics: LyricLine[]
  currentIndex: number
  isLoading: boolean
  hasLyrics: boolean
  track: TrackInfo | null
}

export function LyricDisplay({ lyrics, currentIndex, isLoading, hasLyrics, track }: Props) {
  const activeRef = useRef<HTMLDivElement>(null)

  // Auto scroll to current lyric line
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }, [currentIndex])

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

  return (
    <div className="lyrics-container">
      {lyrics.map((line, index) => {
        const isActive = index === currentIndex
        const isPast = index < currentIndex
        const isNext = index === currentIndex + 1

        return (
          <div
            key={index}
            ref={isActive ? activeRef : null}
            className={[
              'lyric-line',
              isActive ? 'active' : '',
              isPast ? 'past' : '',
              isNext ? 'next' : ''
            ].join(' ')}
          >
            {line.text}
          </div>
        )
      })}
    </div>
  )
}