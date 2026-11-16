# Lyritify 

A floating lyrics overlay for Spotify that stays on top of whatever you're doing and syncs in real time.

---

Still in development — UI needs some work and there are a few known issues, but the core functionality works. Built this for myself and sharing it for anyone who wants to try it out or contribute.

---

## What's new in v2

### New
- **Real playback control** — play/pause, skip next/previous, and seek (drag the progress bar or click any lyric line) now actually control Spotify, instead of the overlay being read-only
- **Smart previous-track button** — matches how every other media player behaves: tap it in the first 5 seconds of a track to go to the previous song, tap it any later and it restarts the current track instead
- **Redesigned widget UI** — a floating card with a blurred, translucent background, a dedicated "Now Playing" header, and a visually separated lyrics panel with its own colour and a centred radial glow behind the active line
- **Deep visual customization** — on top of the original font/colour options, you can now tune: title colour/size, artist colour/size, button colour/size, the lyrics panel's own background colour, its centre-glow colour and intensity, and its corner roundness

### Updated
- **Lyrics now track playback smoothly** — the active line updates continuously between Spotify's once-a-second status polls instead of jumping forward once a second, so it no longer feels laggy
- **Settings window** — expanded with all the new styling options above, and saved settings now migrate safely (upgrading from v1 won't lose or break your existing preferences)
- **Default look** — the default theme moved from a light, mostly-opaque card to a dark, blurred, glass-like one

### Different from v1
- **Requires reconnecting Spotify once** — playback control needs a new permission scope that old login tokens don't have, so you'll be prompted to log in again after updating
- **Playback control needs Spotify Premium** — reading the currently playing track and lyrics still works on Free accounts, but Spotify only allows third-party apps to control playback (play/pause/skip/seek) for Premium accounts
- **Default window size changed** — the default card is taller/narrower than v1's to fit the new header and player controls; existing custom sizes in Settings are untouched

---

## Features
- Real-time synced lyrics from LRCLIB, smoothly interpolated between playback updates
- Full playback control — play/pause, skip next/previous, seek via progress bar or by clicking a lyric line
- Always-on-top floating window with a distinct lyrics panel and player section
- Deeply customizable — fonts, sizes, and colours for lyrics, title, artist, buttons, and the lyrics panel's background/gradient/roundness
- Draggable window
- Lightweight — no background service, just run and go

---

## Prerequisites
- Windows 10/11
- Node.js v18+ — [nodejs.org](https://nodejs.org)
- A Spotify account (Premium if you want to use the playback controls — Free accounts can still read lyrics and the currently playing track)

---

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/alipmaula14/lyritify.git
cd lyritify
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your Spotify App
- Go to [developer.spotify.com](https://developer.spotify.com)
- Login → **Create App**
- Fill in any App name and description
- Add this as Redirect URI:

http://127.0.0.1:8888/callback

- Copy your **Client ID**

### 4. Create `.env` file
Create a `.env` file in the root folder:

VITE_SPOTIFY_CLIENT_ID=paste_your_client_id_here


### 5. Run the app
```bash
npm run dev
```

### 6. Connect Spotify
Click **Connect Spotify** in the overlay and login with your Spotify account.

---

## Build your own .exe
```bash
npm run package
```
Output will be in `release/Lyritify-portable.exe`

---

## Stack
- Electron
- React + TypeScript
- Vite (via electron-vite)
- Spotify Web API
- LRCLIB API

---
- Works with Spotify on any device (phone, desktop) as long as you're logged in
- Some songs may not have synced lyrics — LRCLIB coverage depends on the song

---
