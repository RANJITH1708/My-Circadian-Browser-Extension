# Contributing to My Circadian

Thank you for your interest in contributing! Here is everything you need to get started.

## Ways to Contribute

- **Report a bug** — open an issue using the bug report template
- **Request a feature** — open an issue using the feature request template
- **Submit a fix or improvement** — fork, branch, and open a pull request

## Development Setup

```bash
git clone https://github.com/RANJITH1708/My-Circadian-Browser-Extension.git
cd My-Circadian-Browser-Extension
```

1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode**
3. Click **Load unpacked** → select the cloned folder
4. Click the refresh icon on the extension card after making changes

## Pull Request Guidelines

- Create a branch from `main` with a descriptive name (`fix/overlay-flicker`, `feat/manual-override`)
- Keep PRs focused — one change per PR
- Test across a few different websites and at different times of day (or mock the time in `background.js`)
- Describe what you changed and why in the PR description

## Reporting Bugs

Please include:
- Chrome version and OS
- Your configured sleep time
- A description of which sites are affected
- Steps to reproduce, and what you expected vs. what happened

## Code Style

- Plain JavaScript (no build step required)
- Match the formatting of the existing files
- Keep the background service worker as lightweight as possible — it runs continuously
