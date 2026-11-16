import { useState, useEffect } from 'react'
import './styles/settings.css'

const FONT_OPTIONS = [
  'Inter',
  'Segoe UI',
  'Arial',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Courier New',
  'Times New Roman',
  'Impact'
]

export default function Settings() {
  const [settings, setSettings] = useState({
    windowWidth: 396,
    windowHeight: 516,
    fontSize: 13,
    activeFontSize: 20,
    fontFamily: 'Inter',
    activeColor: '#ffffff',
    inactiveColor: 'rgba(255,255,255,0.4)',
    bgColor: '#0c0c12',
    bgOpacity: 0.28,
    lyricsPanelColor: '#0c0c12',
    lyricsPanelOpacity: 0.28,
    lyricsCenterColor: '#1a1a2e',
    lyricsCenterGradient: 0.4,
    lyricsPanelRadius: 16,
    titleColor: '#ffffff',
    titleSize: 14,
    artistColor: '#999999',
    artistSize: 12,
    buttonColor: '#cccccc',
    buttonBgColor: '#ffffff',
    buttonSize: 40
  })

  useEffect(() => {
    window.electronAPI.getSettings().then((saved: typeof settings) => {
      if (saved) setSettings(saved)
    })
  }, [])

  const update = (key: string, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const save = () => {
    window.electronAPI.saveSettings(settings)
    window.electronAPI.closeSettings()
  }

  return (
    <div className="settings-wrapper">
      <h1 className="settings-title">⚙ Lyritify Settings</h1>

      <div className="settings-group">
        <label>Window Width</label>
        <input type="number" value={settings.windowWidth} min={250} max={1000}
          onChange={e => update('windowWidth', Number(e.target.value))} />
      </div>

      <div className="settings-group">
        <label>Window Height</label>
        <input type="number" value={settings.windowHeight} min={200} max={800}
          onChange={e => update('windowHeight', Number(e.target.value))} />
      </div>

      <div className="settings-group">
        <label>Lyric Font Size ({settings.fontSize}px)</label>
        <input type="range" min={10} max={30} value={settings.fontSize}
          onChange={e => update('fontSize', Number(e.target.value))} />
      </div>

      <div className="settings-group">
        <label>Active Lyric Font Size ({settings.activeFontSize}px)</label>
        <input type="range" min={12} max={40} value={settings.activeFontSize}
          onChange={e => update('activeFontSize', Number(e.target.value))} />
      </div>

      <div className="settings-group">
        <label>Font</label>
        <select value={settings.fontFamily}
          onChange={e => update('fontFamily', e.target.value)}>
          {FONT_OPTIONS.map(f => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </select>
      </div>

      <div className="settings-group">
        <label>Active Lyric Colour</label>
        <input type="color" value={settings.activeColor}
          onChange={e => update('activeColor', e.target.value)} />
      </div>

      <div className="settings-group">
        <label>Inactive Lyric Colour</label>
        <input type="color" value={settings.inactiveColor}
          onChange={e => update('inactiveColor', e.target.value)} />
      </div>

      <div className="settings-group">
        <label>Background Colour</label>
        <input type="color" value={settings.bgColor}
          onChange={e => update('bgColor', e.target.value)} />
      </div>

      <div className="settings-group">
        <label>Background Transparency ({Math.round(settings.bgOpacity * 100)}%)</label>
        <input type="range" min={0} max={100} value={Math.round(settings.bgOpacity * 100)}
          onChange={e => update('bgOpacity', Number(e.target.value) / 100)} />
      </div>

      <div className="settings-group">
        <label>Lyrics Panel Colour</label>
        <input type="color" value={settings.lyricsPanelColor}
          onChange={e => update('lyricsPanelColor', e.target.value)} />
      </div>

      <div className="settings-group">
        <label>Lyrics Panel Transparency ({Math.round(settings.lyricsPanelOpacity * 100)}%)</label>
        <input type="range" min={0} max={100} value={Math.round(settings.lyricsPanelOpacity * 100)}
          onChange={e => update('lyricsPanelOpacity', Number(e.target.value) / 100)} />
      </div>

      <div className="settings-group">
        <label>Lyrics Panel Centre Colour</label>
        <input type="color" value={settings.lyricsCenterColor}
          onChange={e => update('lyricsCenterColor', e.target.value)} />
      </div>

      <div className="settings-group">
        <label>Lyrics Panel Centre Gradient ({Math.round(settings.lyricsCenterGradient * 100)}%)</label>
        <input type="range" min={0} max={100} value={Math.round(settings.lyricsCenterGradient * 100)}
          onChange={e => update('lyricsCenterGradient', Number(e.target.value) / 100)} />
      </div>

      <div className="settings-group">
        <label>Lyrics Panel Top Roundness ({settings.lyricsPanelRadius}px)</label>
        <input type="range" min={0} max={24} value={settings.lyricsPanelRadius}
          onChange={e => update('lyricsPanelRadius', Number(e.target.value))} />
      </div>

      <div className="settings-group">
        <label>Title Colour</label>
        <input type="color" value={settings.titleColor}
          onChange={e => update('titleColor', e.target.value)} />
      </div>

      <div className="settings-group">
        <label>Title Size ({settings.titleSize}px)</label>
        <input type="range" min={10} max={24} value={settings.titleSize}
          onChange={e => update('titleSize', Number(e.target.value))} />
      </div>

      <div className="settings-group">
        <label>Artist Colour</label>
        <input type="color" value={settings.artistColor}
          onChange={e => update('artistColor', e.target.value)} />
      </div>

      <div className="settings-group">
        <label>Artist Size ({settings.artistSize}px)</label>
        <input type="range" min={9} max={18} value={settings.artistSize}
          onChange={e => update('artistSize', Number(e.target.value))} />
      </div>

      <div className="settings-group">
        <label>Button Colour</label>
        <input type="color" value={settings.buttonColor}
          onChange={e => update('buttonColor', e.target.value)} />
      </div>

      <div className="settings-group">
        <label>Play Button Background</label>
        <input type="color" value={settings.buttonBgColor}
          onChange={e => update('buttonBgColor', e.target.value)} />
      </div>

      <div className="settings-group">
        <label>Button Size ({settings.buttonSize}px)</label>
        <input type="range" min={32} max={56} value={settings.buttonSize}
          onChange={e => update('buttonSize', Number(e.target.value))} />
      </div>

      <div className="settings-actions">
        <button className="btn-save" onClick={save}>Save & Close</button>
        <button className="btn-cancel" onClick={() => window.electronAPI.closeSettings()}>Cancel</button>
      </div>
    </div>
  )
}