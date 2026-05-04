// --- Main logic function ---
async function updateAllTabs(options = {}) {
    const styles = await getCurrentStyle();
    if (options.transitionSpeed) {
        styles.transitionSpeed = options.transitionSpeed;
    }
    applyToAllTabs(styles);
}

// --- Helper function to apply styles ---
function applyToAllTabs(styles) {
    if (!styles) { return; }
    chrome.tabs.query({ url: ["http://*/*", "https://*/*"] }, (tabs) => {
        tabs.forEach(tab => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (brightness, warmth, speed) => {
                    document.documentElement.style.transition = `filter ${speed}s ease-out`;
                    document.documentElement.style.filter = `brightness(${brightness})`;
                    const overlayId = 'circadian-companion-overlay';
                    let overlay = document.getElementById(overlayId);
                    if (!overlay) {
                        overlay = document.createElement('div');
                        overlay.id = overlayId;
                        overlay.style.cssText = `
                            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                            pointer-events: none; z-index: 2147483647;
                            background-color: #ffaf4d; mix-blend-mode: multiply;
                        `;
                        (document.body || document.documentElement).appendChild(overlay);
                    }
                    overlay.style.transition = `opacity ${speed}s ease-out`;
                    overlay.style.opacity = warmth;
                },
                args: [styles.brightness, styles.sepia, styles.transitionSpeed || 0.5]
            }).catch(() => {});
        });
    });
}

// --- Helper to calculate the current style ---
async function getCurrentStyle() {
    const settings = await chrome.storage.sync.get([
        'isEnabled', 'nightShiftActive', 'manualBrightness', 'manualWarmth',
        'wakeTime', 'sleepTime', 'engageMinutes', 'pausedUntil',
        'dayBrightness', 'dayWarmth', 'nightBrightness', 'nightWarmth' // Get new settings
    ]);

    // Set defaults for custom schedule settings
    const dayBrightness = (settings.dayBrightness ?? 100) / 100;
    const dayWarmth = (settings.dayWarmth ?? 0) / 100;
    const nightBrightness = (settings.nightBrightness ?? 85) / 100;
    const nightWarmth = (settings.nightWarmth ?? 50) / 100;

    const RESET_STYLE = { brightness: dayBrightness, sepia: dayWarmth };
    // Fixed: When disabled or paused, always revert to neutral (no filters) instead of custom day settings
    const OFF_STYLE = { brightness: 1.0, sepia: 0.0 };

    if (settings.pausedUntil && Date.now() < settings.pausedUntil) {
        return OFF_STYLE;
    }

    if (settings.isEnabled === false) return OFF_STYLE;
    if (settings.nightShiftActive) return { brightness: nightBrightness, sepia: nightWarmth }; 
    if (settings.manualBrightness != null) {
        return {
            brightness: settings.manualBrightness / 100,
            sepia: settings.manualWarmth / 100
        };
    }
    
    const engageMinutes = settings.engageMinutes || 180;
    const wakeTime = settings.wakeTime || '07:00';
    const sleepTime = settings.sleepTime || '19:00';
    
    // Pass custom settings to the calculation function
    return calculateStyle(wakeTime, sleepTime, engageMinutes, {
        dayBrightness, dayWarmth, nightBrightness, nightWarmth
    });
}

// --- Style calculation function (UPDATED) ---
function calculateStyle(wakeTimeStr, sleepTimeStr, engageMinutes, customLevels) {
  const { dayBrightness, dayWarmth, nightBrightness, nightWarmth } = customLevels;
  const RESET_STYLE = { brightness: dayBrightness, sepia: dayWarmth };
  const SUNRISE_DURATION = 90;
  const SUNSET_DURATION = parseInt(engageMinutes, 10);


  if (!wakeTimeStr || !sleepTimeStr) return RESET_STYLE;
  
  const now = new Date();
  const [wakeH, wakeM] = wakeTimeStr.split(':').map(Number);
  const [sleepH, sleepM] = sleepTimeStr.split(':').map(Number);
  let wakeTime = new Date(); wakeTime.setHours(wakeH, wakeM, 0, 0);
  let sleepTime = new Date(); sleepTime.setHours(sleepH, sleepM, 0, 0);

  if (sleepTime.getTime() <= wakeTime.getTime()) {
    if (now.getTime() < wakeTime.getTime() && now.getTime() > sleepTime.getTime()) { 
        wakeTime.setDate(wakeTime.getDate() - 1); 
    } else {
        if(now.getTime() > sleepTime.getTime()) sleepTime.setDate(sleepTime.getDate() + 1);
        if(now.getTime() < wakeTime.getTime()) wakeTime.setDate(wakeTime.getDate() - 1);
    }
  }

  const sunriseEndTime = new Date(wakeTime.getTime() + SUNRISE_DURATION * 60000);
  const sunsetStartTime = new Date(sleepTime.getTime() - SUNSET_DURATION * 60000);
  
  if (now.getTime() < wakeTime.getTime() || now.getTime() >= sleepTime.getTime()) {
      return { brightness: nightBrightness, sepia: nightWarmth };
  }
  if (now.getTime() < sunriseEndTime.getTime()) {
    const progress = Math.min((now.getTime() - wakeTime.getTime()) / (SUNRISE_DURATION * 60000), 1);
    return { 
        brightness: nightBrightness + (dayBrightness - nightBrightness) * progress, 
        sepia: nightWarmth - (nightWarmth - dayWarmth) * progress 
    };
  }
  if (now.getTime() > sunsetStartTime.getTime()) {
    const progress = Math.min((now.getTime() - sunsetStartTime.getTime()) / (SUNSET_DURATION * 60000), 1);
    return { 
        brightness: dayBrightness - (dayBrightness - nightBrightness) * progress, 
        sepia: dayWarmth + (nightWarmth - dayWarmth) * progress 
    };
  }
  return RESET_STYLE;
}

// --- Event Listeners (Unchanged) ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "update-styles") {
        if (message.manualValues) {
            const styles = {
                brightness: message.manualValues.brightness / 100,
                sepia: message.manualValues.warmth / 100,
                transitionSpeed: 0.2
            };
            applyToAllTabs(styles);
        } else {
            updateAllTabs();
        }
    }
    if (message.command === "pause-extension") {
        const resumeTime = Date.now() + message.minutes * 60000;
        chrome.storage.sync.set({ pausedUntil: resumeTime });
        chrome.alarms.create('resume-extension', { when: resumeTime });
        updateAllTabs({ transitionSpeed: 0.2 });
    }
    if (message.command === "get-current-style") {
        getCurrentStyle().then(sendResponse);
        return true;
    }
});
chrome.runtime.onInstalled.addListener(() => updateAllTabs());
chrome.runtime.onStartup.addListener(() => updateAllTabs());
chrome.alarms.create('periodic-update', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'resume-extension') {
        chrome.storage.sync.remove('pausedUntil');
    }
    updateAllTabs();
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        getCurrentStyle().then(styles => {
             applyToAllTabs(styles);
        });
    }
});
