# IP Locator — React

A real-time IP address and geolocation tracker built with React, featuring a blue hacker-style Matrix rain background and live IP change detection.

## What It Does

Fetches your current public IP address and resolves it to a physical location using a free geolocation API. It continuously monitors your network in the background and instantly reflects any IP changes on screen — useful for detecting VPN switches, network hops, or ISP reassignments without ever refreshing the page.

## Features

- 🌐 **Full geolocation data** — displays IP, city, region, country, ISP, timezone, postal code, latitude & longitude
- 🔄 **Automatic polling every 10 seconds** — silently checks for IP changes in the background without disrupting the UI
- ⚡ **Live IP change detection** — the moment your IP changes, a slide-in alert banner fires and all affected fields highlight in real time
- 📋 **IP change history log** — every IP change is recorded with a timestamp and old → new IP, newest entries at the top
- 🌧️ **Animated blue Matrix rain background** — canvas-based falling character animation in a cyan/blue hacker theme
- 📍 **Map link** — opens your exact coordinates in OpenStreetMap

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm start
```

Then open **http://localhost:3000** in your browser.

> Uses `ip-api.com` free API — no API key needed, works on localhost out of the box.