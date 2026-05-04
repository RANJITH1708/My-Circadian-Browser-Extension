# My Circadian — Automatic Screen Warmth & Brightness

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/femmajfmdpemdkkjdgooimlhbkchbhla?label=Chrome%20Web%20Store&logo=google-chrome&color=FF6B35)](https://chromewebstore.google.com/detail/my-circadian/femmajfmdpemdkkjdgooimlhbkchbhla)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/femmajfmdpemdkkjdgooimlhbkchbhla?label=Users&color=FF9B35)](https://chromewebstore.google.com/detail/my-circadian/femmajfmdpemdkkjdgooimlhbkchbhla)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)](https://developer.chrome.com/docs/extensions/mv3/intro/)

> Automatically shift your screen's brightness and color temperature throughout the day, following your natural circadian rhythm to reduce eye strain and improve sleep quality.

## Install

[**→ Add to Chrome**](https://chromewebstore.google.com/detail/my-circadian/femmajfmdpemdkkjdgooimlhbkchbhla)

## Features

- **Automatic daily schedule** — brightness and warmth adjust continuously based on your local time of day, no manual switching needed
- **Blue light reduction** — gradually applies an amber tint as evening approaches, easing your eyes into night mode before bed
- **Custom sleep time** — set your bedtime so the extension tailors its dimming schedule to your routine
- **Smooth transitions** — changes happen gradually so there is never a jarring shift
- **Zero-setup** — install, set your sleep time once, and forget about it
- **Privacy-first** — no data collected; all logic runs locally in your browser using the Alarms API

## How It Works

My Circadian runs a background service worker that wakes on a regular schedule. Based on the current time relative to your configured sleep time, it injects a CSS overlay into every open tab — warming the color temperature and dimming the display as night approaches, then resetting it in the morning when you wake up.

## Getting Started (Development)

```bash
git clone https://github.com/RANJITH1708/My-Circadian-Browser-Extension.git
```

1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked** and select the cloned folder
4. Click the My Circadian icon in the toolbar and set your preferred sleep time

## Project Structure

| File | Purpose |
|---|---|
| `manifest.json` | Extension config — permissions and service worker (Manifest V3) |
| `background.js` | Service worker — schedules alarms and applies brightness/warmth adjustments to all tabs |
| `popup.html` | Settings popup UI |
| `popup.css` | Popup styles |
| `popup.js` | Popup logic — reads and saves sleep time, shows current status |

## Contributing

Contributions are welcome — new schedule curves, per-site overrides, UI themes, and bug fixes are all great starting points.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

- **Bug reports** → [open an issue](https://github.com/RANJITH1708/My-Circadian-Browser-Extension/issues/new?template=bug_report.md)
- **Feature requests** → [open an issue](https://github.com/RANJITH1708/My-Circadian-Browser-Extension/issues/new?template=feature_request.md)
- **Pull requests** → fork the repo, create a branch, and submit a PR

## License

[MIT](LICENSE) © Ranjith Saila
