import { useState, useEffect } from 'react'
import { useSpotify } from './hooks/useSpotify'
import { useLyrics } from './hooks/useLyrics'
import { LyricDisplay } from './components/LyricsDisplay'
import { IconSettings, IconMinimize, IconClose, IconPrev, IconNext, IconPlay, IconPause } from './components/Icons'
import './styles/lyrics.css'

const hexToRgba = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${1 - opacity})`
}

const applySettings = (settings: any) => {
  const root = document.documentElement
  root.style.setProperty('--font-size', `${settings.fontSize}px`)
  root.style.setProperty('--active-font-size', `${settings.activeFontSize}px`)
  root.style.setProperty('--font-family', settings.fontFamily)
  root.style.setProperty('--active-color', settings.activeColor)
  root.style.setProperty('--inactive-color', settings.inactiveColor)
  root.style.setProperty('--lyrics-center-color', settings.lyricsCenterColor)
  root.style.setProperty('--lyrics-center-gradient', `${settings.lyricsCenterGradient}`)
  root.style.setProperty('--lyrics-radius', `${settings.lyricsPanelRadius}px`)
  root.style.setProperty('--lyrics-bg-color', hexToRgba(settings.lyricsPanelColor, settings.lyricsPanelOpacity))
  root.style.setProperty('--title-color', settings.titleColor)
  root.style.setProperty('--title-size', `${settings.titleSize}px`)
  root.style.setProperty('--artist-color', settings.artistColor)
  root.style.setProperty('--artist-size', `${settings.artistSize}px`)
  root.style.setProperty('--button-color', settings.buttonColor)
  root.style.setProperty('--button-bg', settings.buttonBgColor)
  root.style.setProperty('--button-size', `${settings.buttonSize}px`)
  root.style.setProperty('--bg-color', hexToRgba(settings.bgColor, settings.bgOpacity))
}

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function App() {
  const { isAuthenticated, track, login, togglePlay, skipNext, skipPrevious, seek } = useSpotify()
  const { lyrics, currentIndex, isLoading, hasLyrics } = useLyrics(track)
  const [controlsHovered, setControlsHovered] = useState(false)

  useEffect(() => {
    window.electronAPI.getSettings().then((saved: any) => {
      if (saved) applySettings(saved)
    })

    const removeListener = window.electronAPI.onSettingsUpdated((settings: any) => {
      applySettings(settings)
    })

    const handleMouseUp = () => window.electronAPI.dragEnd()
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      removeListener?.()
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <p className="login-title">lyritify</p>
        <p className="login-sub">floating lyrics for spotify</p>
        <button className="login-btn" onClick={login}>
          Connect Spotify
        </button>
      </div>
    )
  }

  const progress = track ? Math.min(100, (track.progressMs / track.durationMs) * 100) : 0

  return (
    <div
      className="app-wrapper"
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.button === 0) window.electronAPI.dragWindow()
      }}
      onMouseUp={() => window.electronAPI.dragEnd()}
      onMouseLeave={() => window.electronAPI.dragEnd()}
    >
      <div
        className={`controls ${controlsHovered ? 'controls-visible' : ''}`}
        onMouseEnter={() => setControlsHovered(true)}
        onMouseLeave={() => setControlsHovered(false)}
      >
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => window.electronAPI.openSettings()}
          title="Settings"
        ><IconSettings /></button>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => window.electronAPI.minimizeApp()}
          title="Minimize"
        ><IconMinimize /></button>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => window.electronAPI.closeApp()}
          title="Close"
        ><IconClose /></button>
      </div>

      {track && (
        <div className="now-playing-header">
          <p className="now-playing-label">Now Playing</p>
          <p className="track-title">{track.name}</p>
          <p className="track-artist">{track.artist}</p>
        </div>
      )}

      <div className="lyrics-stage">
        <div className="accent-gradient" />
        <LyricDisplay
          lyrics={lyrics}
          currentIndex={currentIndex}
          isLoading={isLoading}
          hasLyrics={hasLyrics}
          track={track}
          onSeek={seek}
        />
      </div>

      {track && (
        <>
          <div className="progress-section">
            <div
              className="progress-track"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const ratio = (e.clientX - rect.left) / rect.width
                seek(ratio * track.durationMs)
              }}
            >
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-times">
              <span>{formatTime(track.progressMs)}</span>
              <span>{formatTime(track.durationMs)}</span>
            </div>
          </div>

          <div className="divider" />

          <div className="transport-controls">
            <button
              className="transport-btn"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={skipPrevious}
              title="Previous"
            ><IconPrev /></button>

            <button
              className="play-pause-btn"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={togglePlay}
              title={track.isPlaying ? 'Pause' : 'Play'}
            >{track.isPlaying ? <IconPause /> : <IconPlay />}</button>

            <button
              className="transport-btn"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={skipNext}
              title="Next"
            ><IconNext /></button>
          </div>
        </>
      )}
    </div>
  )
}
