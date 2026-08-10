# Lyritify 

A floating lyrics overlay for Spotify that stays on top of whatever you're doing and syncs in real time.

---

Still in development — UI needs some work and there are a few known issues, but the core functionality works. Built this for myself and sharing it for anyone who wants to try it out or contribute.

---

## Features
- Real-time synced lyrics from LRCLIB
- Always-on-top floating window
- Customizable — font, size, text colour, background colour, transparency
- Draggable window
- Lightweight — no background service, just run and go

---

## Prerequisites
- Windows 10/11
- Node.js v18+ — [nodejs.org](https://nodejs.org)
- A Spotify account

---

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/lyritify.git
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
