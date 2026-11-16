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

  // Build a fixed VISIBLE-slot window centered exactly on currentIndex,
  // using invisible placeholders (not real lines) for slots that fall
  // before the first or after the last lyric. Clamping/shifting the
  // window near the start or end of a song — like slicing the array and
  // relying on justify-content to center the group — makes the active
  // line land off-center, since there aren't enough real lines to fill
  // the slots on one side.
  const slots = Array.from({ length: VISIBLE }, (_, i) => {
    const idx = currentIndex + (i - CENTER)
    return idx >= 0 && idx < lyrics.length ? { idx, line: lyrics[idx] } : null
  })

  return (
    <div className="lyrics-window">
      {slots.map((slot, i) => {
        const offset = i - CENTER
        const dist = Math.abs(offset)
        // Match a real line's tier class even for placeholders, so an
        // empty slot takes up exactly the same height a real line at
        // that distance would — keeping the active line symmetric
        // (and therefore centered) regardless of which slots are empty.
        const tierClass = dist === 0 ? 'active' : dist === 1 ? 'near' : ''

        if (!slot) {
          return (
            <div key={`empty-${i}`} className={`lyric-line ${tierClass}`} style={{ visibility: 'hidden' }}>&nbsp;</div>
          )
        }

        return (
          <div
            key={slot.idx}
            className={`lyric-line ${tierClass}`}
            onClick={() => onSeek(slot.line.time)}
          >
            {slot.line.text}
          </div>
        )
      })}
    </div>
  )
}
