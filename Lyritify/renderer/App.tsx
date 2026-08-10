import { useState, useEffect } from 'react'
import { useSpotify } from './hooks/useSpotify'
import { useLyrics } from './hooks/useLyrics'
import { LyricDisplay } from './components/LyricsDisplay'
import './styles/lyrics.css'

const applySettings = (settings: any) => {
  const root = document.documentElement
  root.style.setProperty('--font-size', `${settings.fontSize}px`)
  root.style.setProperty('--active-font-size', `${settings.activeFontSize}px`)
  root.style.setProperty('--font-family', settings.fontFamily)
  root.style.setProperty('--active-color', settings.activeColor)
  root.style.setProperty('--inactive-color', settings.inactiveColor)
  const r = parseInt(settings.bgColor.slice(1, 3), 16)
  const g = parseInt(settings.bgColor.slice(3, 5), 16)
  const b = parseInt(settings.bgColor.slice(5, 7), 16)
  root.style.setProperty('--bg-color', `rgba(${r},${g},${b},${1 - settings.bgOpacity})`)
}

export default function App() {
  const { isAuthenticated, track, login } = useSpotify()
  const { lyrics, currentIndex, isLoading, hasLyrics } = useLyrics(track)
  const [isHovered, setIsHovered] = useState(false)

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

  return (
    <div
      className="app-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
  setTimeout(() => {
    setIsHovered(false)
  }, 300)
  window.electronAPI.dragEnd()
}}
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.button === 0) window.electronAPI.dragWindow()
      }}
      onMouseUp={() => window.electronAPI.dragEnd()}
    >
      <div className={`controls ${isHovered ? 'controls-visible' : ''}`}>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => window.electronAPI.openSettings()}
        >⚙</button>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => window.electronAPI.minimizeApp()}
        >−</button>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => window.electronAPI.closeApp()}
        >✕</button>
      </div>

      <LyricDisplay
        lyrics={lyrics}
        currentIndex={currentIndex}
        isLoading={isLoading}
        hasLyrics={hasLyrics}
        track={track}
      />
    </div>
  )
}