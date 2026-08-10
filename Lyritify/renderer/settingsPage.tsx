import { useState, useEffect } from 'react'
import './styles/settings.css'

const FONT_OPTIONS = [
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
    windowWidth: 500,
    windowHeight: 160,
    fontSize: 15,
    activeFontSize: 18,
    fontFamily: 'Segoe UI',
    activeColor: '#000000',
    inactiveColor: 'rgba(0,0,0,0.35)',
    bgColor: '#ffffff',
    bgOpacity: 0.0
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
        <input type="number" value={settings.windowWidth} min={200} max={1000}
          onChange={e => update('windowWidth', Number(e.target.value))} />
      </div>

      <div className="settings-group">
        <label>Window Height</label>
        <input type="number" value={settings.windowHeight} min={80} max={800}
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

      <div className="settings-actions">
        <button className="btn-save" onClick={save}>Save & Close</button>
        <button className="btn-cancel" onClick={() => window.electronAPI.closeSettings()}>Cancel</button>
      </div>
    </div>
  )
}