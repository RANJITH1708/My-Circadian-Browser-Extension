document.addEventListener('DOMContentLoaded', () => {
    // --- Get Elements ---
    const flipper = document.querySelector('.flipper');
    const statusText = document.getElementById('status-text');
    const brightnessSlider = document.getElementById('brightnessSlider');
    const warmthSlider = document.getElementById('warmthSlider');
    const brightnessValue = document.getElementById('brightnessValue');
    const warmthValue = document.getElementById('warmthValue');

    // Buttons & Popups
    const powerButton = document.getElementById('powerButton');
    const themeToggleButton = document.getElementById('themeToggleButton');
    const nightOwlButton = document.getElementById('nightOwlButton');
    const resetToAutoButton = document.getElementById('resetToAutoButton');
    const saveButton = document.getElementById('saveButton');
    const pauseDropdownContainer = document.getElementById('pauseDropdownContainer');
    const pauseButton = document.getElementById('pauseButton');
    const pauseDropdownMenu = document.getElementById('pauseDropdownMenu');

    // Navigation Buttons
    const goToScheduleButton = document.getElementById('goToScheduleButton');
    const backToMainBtn = document.getElementById('back-to-main-btn');
    const goToHelpButton = document.getElementById('goToHelpButton');
    const backToMainFromHelpBtn = document.getElementById('back-to-main-from-help-btn');
    const goToSettingsButton = document.getElementById('goToSettingsButton');
    const backToScheduleButton = document.getElementById('backToScheduleButton');
    const resetAppearanceButton = document.getElementById('resetAppearanceButton');

    // Custom Select Elements
    const wakeTimeSelect = document.getElementById('wakeTimeSelect');
    const sleepTimeSelect = document.getElementById('sleepTimeSelect');
    const engageMinutesSelect = document.getElementById('engageMinutesSelect');
    const characterSelect = document.getElementById('characterSelect');
    const petSelect = document.getElementById('petSelect');
    const relaxingActivitySelect = document.getElementById('relaxingActivitySelect');

    // Schedule Setting Sliders
    const dayBrightnessSlider = document.getElementById('dayBrightnessSlider');
    const dayWarmthSlider = document.getElementById('dayWarmthSlider');
    const nightBrightnessSlider = document.getElementById('nightBrightnessSlider');
    const nightWarmthSlider = document.getElementById('nightWarmthSlider');
    const dayBrightnessValue = document.getElementById('dayBrightnessValue');
    const dayWarmthValue = document.getElementById('dayWarmthValue');
    const nightBrightnessValue = document.getElementById('nightBrightnessValue');
    const nightWarmthValue = document.getElementById('nightWarmthValue');

    // Status Bar Elements
    const statusBar = document.getElementById('statusBar');
    const animationContainer = document.getElementById('animationContainer');
    const celestialObject = document.getElementById('celestialObject');
    const wakeTimeDisplay = document.getElementById('wakeTimeDisplay');
    const sleepTimeDisplay = document.getElementById('sleepTimeDisplay');
    
    // --- Character & Pet Data ---
    const characterData = {
        walker: { emoji: '🚶', needsFlip: true },
        runner: { emoji: '🏃', needsFlip: true },
        woman: { emoji: '🚶‍♀️', needsFlip: true },
        man: { emoji: '🚶‍♂️', needsFlip: true },
        robot: { emoji: '🤖', needsFlip: false }
    };

    const petData = {
        poodle: { emoji: '🐩', needsFlip: true },
        dog: { emoji: '🐕', needsFlip: true },
        cat: { emoji: '🐈', needsFlip: true },
        fox: { emoji: '🦊', needsFlip: true },
        turtle: { emoji: '🐢', needsFlip: true }
    };

    const relaxingActivityData = {
        meditating: { primary: '🧘', secondary: null },
        reading: { primary: '📖', secondary: null },
        gaming: { primary: '🎮', secondary: null },
        music: { primary: '🎵', secondary: null }
    };

    // --- Helper Functions ---
    function formatTimeForDisplay(timeStr) { if (!timeStr) return ''; const [hours, minutes] = timeStr.split(':'); const h = parseInt(hours, 10); const ampm = h >= 12 ? 'PM' : 'AM'; const displayHours = h % 12 || 12; return `${displayHours}:${minutes} ${ampm}`; }
    function formatMinutesForDisplay(minutesStr) { const minutes = parseInt(minutesStr, 10); if (minutes < 60) return `${minutes} minutes before sleep`; const hours = minutes / 60; const hourText = hours % 1 === 0 ? hours : hours.toFixed(1); return `${hourText} hour${hours > 1 ? 's' : ''} before sleep`; }
    function populateTimeSelect(panelElement) { if (!panelElement) return; for (let h = 0; h < 24; h++) { for (let m = 0; m < 60; m += 30) { const hourStr = h.toString().padStart(2, '0'); const minuteStr = m.toString().padStart(2, '0'); const timeValue = `${hourStr}:${minuteStr}`; const option = document.createElement('div'); option.className = 'select-option'; option.dataset.value = timeValue; option.textContent = formatTimeForDisplay(timeValue); panelElement.appendChild(option); } } }
    
    // --- High-Precision Status Bar Logic ---
    function updateStatusBar(settings) {
        const { wakeTimeStr, sleepTimeStr, engageMinutes, characterChoice, petChoice, relaxingActivity } = settings;
        const now = new Date();
        const nowMs = now.getTime();

        const [wakeH, wakeM] = wakeTimeStr.split(':').map(Number);
        const [sleepH, sleepM] = sleepTimeStr.split(':').map(Number);

        const timePoints = [-1, 0, 1].map(dayOffset => {
            const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
            const wakeTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), wakeH, wakeM);
            const sleepTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), sleepH, sleepM);
            return { wakeTime, sleepTime };
        });

        const allEvents = timePoints.flatMap(p => [p.wakeTime, p.sleepTime]);
        const pastEvents = allEvents.filter(t => t.getTime() <= nowMs);
        const futureEvents = allEvents.filter(t => t.getTime() > nowMs);

        if (pastEvents.length === 0 || futureEvents.length === 0) return;

        const lastEvent = new Date(Math.max(...pastEvents.map(t => t.getTime())));
        const nextEvent = new Date(Math.min(...futureEvents.map(t => t.getTime())));

        let startTime = lastEvent;
        let endTime = nextEvent;
        let currentState, displayStartLabel, displayEndLabel;

        const wasLastEventWake = lastEvent.getHours() === wakeH && lastEvent.getMinutes() === wakeM;

        if (wasLastEventWake) {
            const engageTime = new Date(endTime.getTime() - engageMinutes * 60000);
            currentState = (nowMs < engageTime.getTime()) ? 'day' : 'evening';
            displayStartLabel = formatTimeForDisplay(wakeTimeStr);
            displayEndLabel = formatTimeForDisplay(sleepTimeStr);
        } else {
            currentState = 'night';
            displayStartLabel = formatTimeForDisplay(sleepTimeStr);
            displayEndLabel = formatTimeForDisplay(wakeTimeStr);
        }

        const totalDuration = endTime.getTime() - startTime.getTime();
        const elapsedDuration = nowMs - startTime.getTime();
        let progress = totalDuration > 0 ? (elapsedDuration / totalDuration) * 100 : 0;
        progress = Math.max(0, Math.min(100, progress));

        if (animationContainer) animationContainer.style.left = `${progress}%`;

        if (statusBar) {
            statusBar.className = 'status-bar-container';
            statusBar.classList.add(`state-${currentState}`);
            if (currentState === 'day') {
                celestialObject.textContent = '☀️';
                statusBar.style.backgroundColor = 'var(--day-sky-color)';
            } else if (currentState === 'evening') {
                celestialObject.textContent = '🌅';
                statusBar.style.backgroundColor = 'var(--evening-sky-color)';
            } else {
                celestialObject.textContent = '🌙';
                statusBar.style.backgroundColor = 'var(--night-sky-color)';
            }
        }
        
        // Update Character Display & Animation
        const personWalking = document.querySelector('.person-walking');
        const pet = document.querySelector('.pet');
        const personRelaxing = document.querySelector('.person-relaxing');
        const beverage = document.querySelector('.beverage');

        if(personWalking && pet && personRelaxing && beverage) {
            // Set character emoji and animation
            personWalking.textContent = characterData[characterChoice].emoji;
            personWalking.style.animationName = characterData[characterChoice].needsFlip 
                ? 'walk-bob-person-flipped' : 'walk-bob-person-normal';

            // Set pet emoji and animation
            pet.textContent = petData[petChoice].emoji;
            pet.style.animationName = petData[petChoice].needsFlip
                ? 'walk-bob-pet-flipped' : 'walk-bob-pet-normal';
            
            // Set relaxing emoji
            const activity = relaxingActivityData[relaxingActivity];
            personRelaxing.textContent = activity.primary;
            beverage.textContent = activity.secondary;
            beverage.style.display = activity.secondary ? 'block' : 'none';
        }

        if (wakeTimeDisplay) wakeTimeDisplay.textContent = displayStartLabel;
        if (sleepTimeDisplay) sleepTimeDisplay.textContent = displayEndLabel;
    }

    // --- State Loading and UI Update ---
    async function loadStateAndUpdateUI() {
        const settings = await chrome.storage.sync.get([
            'isEnabled', 'nightShiftActive', 'manualBrightness', 'manualWarmth',
            'wakeTime', 'sleepTime', 'engageMinutes', 'pausedUntil', 'currentTheme',
            'dayBrightness', 'dayWarmth', 'nightBrightness', 'nightWarmth',
            'characterChoice', 'petChoice', 'relaxingActivity'
        ]);

        const isEnabled = settings.isEnabled !== false;
        const isPaused = settings.pausedUntil && Date.now() < settings.pausedUntil;
        const currentTheme = settings.currentTheme || 'dark-theme';
        document.body.className = currentTheme;
        if(themeToggleButton) themeToggleButton.textContent = currentTheme === 'dark-theme' ? '☀️' : '🌙';
        if(powerButton) {
            powerButton.textContent = isEnabled ? 'ON' : 'OFF';
            powerButton.classList.toggle('active', isEnabled);
            powerButton.classList.toggle('off-state', !isEnabled);
        }
        if (statusText) {
            if (!isEnabled) { statusText.textContent = "Extension is OFF."; } 
            else if (isPaused) { const remaining = Math.round((settings.pausedUntil - Date.now()) / 60000); statusText.textContent = `Paused. Resuming in ${remaining} min.`; }
            else if (settings.nightShiftActive) { statusText.textContent = "Night Owl Mode Active."; }
            else if (settings.manualBrightness != null) { statusText.textContent = "Manual Override."; }
            else if (settings.wakeTime && settings.sleepTime) { statusText.textContent = "Automatic (Custom Schedule)."; }
            else { statusText.textContent = "Automatic (Default Schedule)."; }
        }
        if(nightOwlButton) nightOwlButton.classList.toggle('active', !!settings.nightShiftActive);

        const wakeTime = settings.wakeTime || '07:00';
        const sleepTime = settings.sleepTime || '19:00';
        const engageMinutes = settings.engageMinutes || 180;
        const characterChoice = settings.characterChoice || 'walker';
        const petChoice = settings.petChoice || 'poodle';
        const relaxingActivity = settings.relaxingActivity || 'meditating';
        
        if(wakeTimeSelect) {
            wakeTimeSelect.dataset.value = wakeTime;
            wakeTimeSelect.querySelector('.select-value').textContent = formatTimeForDisplay(wakeTime);
        }
        if(sleepTimeSelect){
            sleepTimeSelect.dataset.value = sleepTime;
            sleepTimeSelect.querySelector('.select-value').textContent = formatTimeForDisplay(sleepTime);
        }
        if(engageMinutesSelect){
            engageMinutesSelect.dataset.value = engageMinutes;
            engageMinutesSelect.querySelector('.select-value').textContent = formatMinutesForDisplay(engageMinutes);
        }
        if(characterSelect){
            characterSelect.dataset.value = characterChoice;
            characterSelect.querySelector('.select-value').textContent = characterSelect.querySelector(`.select-option[data-value="${characterChoice}"]`).textContent;
        }
        if(petSelect){
            petSelect.dataset.value = petChoice;
            petSelect.querySelector('.select-value').textContent = petSelect.querySelector(`.select-option[data-value="${petChoice}"]`).textContent;
        }
        if(relaxingActivitySelect){
            relaxingActivitySelect.dataset.value = relaxingActivity;
            relaxingActivitySelect.querySelector('.select-value').textContent = relaxingActivitySelect.querySelector(`.select-option[data-value="${relaxingActivity}"]`).textContent;
        }
        
        updateStatusBar({ wakeTimeStr: wakeTime, sleepTimeStr: sleepTime, engageMinutes, characterChoice, petChoice, relaxingActivity });

        if(dayBrightnessSlider) dayBrightnessSlider.value = settings.dayBrightness ?? 100;
        if(dayWarmthSlider) dayWarmthSlider.value = settings.dayWarmth ?? 0;
        if(nightBrightnessSlider) nightBrightnessSlider.value = settings.nightBrightness ?? 85;
        if(nightWarmthSlider) nightWarmthSlider.value = settings.nightWarmth ?? 50;

        if(dayBrightnessValue) dayBrightnessValue.textContent = dayBrightnessSlider.value;
        if(dayWarmthValue) dayWarmthValue.textContent = dayWarmthSlider.value;
        if(nightBrightnessValue) nightBrightnessValue.textContent = nightBrightnessSlider.value;
        if(nightWarmthValue) nightWarmthValue.textContent = nightWarmthSlider.value;

        if(dayBrightnessSlider) updateSliderFill(dayBrightnessSlider);
        if(dayWarmthSlider) updateSliderFill(dayWarmthSlider);
        if(nightBrightnessSlider) updateSliderFill(nightBrightnessSlider);
        if(nightWarmthSlider) updateSliderFill(nightWarmthSlider);

        chrome.runtime.sendMessage({ command: "get-current-style" }, (style) => {
            if (chrome.runtime.lastError || !style) return;
            const b = Math.round(style.brightness * 100);
            const w = Math.round(style.sepia * 100);
            if(brightnessSlider) brightnessSlider.value = b;
            if(warmthSlider) warmthSlider.value = w;
            if(brightnessValue) brightnessValue.textContent = b;
            if(warmthValue) warmthValue.textContent = w;
            if(brightnessSlider) updateSliderFill(brightnessSlider);
            if(warmthSlider) updateSliderFill(warmthSlider);
        });
    }

    // --- Popups & Navigation Logic ---
    function closeAllPopups(exceptThisOne) {
        document.querySelectorAll('.custom-select.open').forEach(select => {
            if (select !== exceptThisOne) select.classList.remove('open');
        });
        if (pauseDropdownContainer && pauseDropdownContainer !== exceptThisOne && pauseDropdownContainer.classList.contains('open')) {
            pauseDropdownContainer.classList.remove('open');
        }
    }
    const showMainView = () => flipper.className = 'flipper';
    const showAdvancedView = () => flipper.className = 'flipper show-advanced';
    const showSettingsView = () => flipper.className = 'flipper show-settings';
    const showHelpView = () => flipper.className = 'flipper show-help';
    
    if (goToScheduleButton) goToScheduleButton.addEventListener('click', showAdvancedView);
    if (goToHelpButton) goToHelpButton.addEventListener('click', showHelpView);
    if (backToMainBtn) backToMainBtn.addEventListener('click', showMainView);
    if (backToMainFromHelpBtn) backToMainFromHelpBtn.addEventListener('click', showMainView);
    if (goToSettingsButton) goToSettingsButton.addEventListener('click', showSettingsView);
    if (backToScheduleButton) backToScheduleButton.addEventListener('click', showAdvancedView);

    // --- Event Listeners ---
    if (powerButton) powerButton.addEventListener('click', async () => { const { isEnabled = true } = await chrome.storage.sync.get('isEnabled'); await chrome.storage.sync.set({ isEnabled: !isEnabled }); chrome.runtime.sendMessage({ command: "update-styles" }); loadStateAndUpdateUI(); });
    if (themeToggleButton) themeToggleButton.addEventListener('click', async () => { const { currentTheme = 'dark-theme' } = await chrome.storage.sync.get('currentTheme'); const newTheme = currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme'; await chrome.storage.sync.set({ currentTheme: newTheme }); loadStateAndUpdateUI(); });
    if (nightOwlButton) nightOwlButton.addEventListener('click', async () => { const { nightShiftActive = false } = await chrome.storage.sync.get('nightShiftActive'); await chrome.storage.sync.set({ nightShiftActive: !nightShiftActive, manualBrightness: null, manualWarmth: null, pausedUntil: null }); chrome.runtime.sendMessage({ command: "update-styles" }); loadStateAndUpdateUI(); });
    if (resetToAutoButton) resetToAutoButton.addEventListener('click', async () => { await chrome.storage.sync.set({ manualBrightness: null, manualWarmth: null, nightShiftActive: false, pausedUntil: null }); chrome.runtime.sendMessage({ command: "update-styles" }); loadStateAndUpdateUI(); });
    if (pauseButton) pauseButton.addEventListener('click', (e) => { e.stopPropagation(); closeAllPopups(pauseDropdownContainer); pauseDropdownContainer.classList.toggle('open'); });
    if (pauseDropdownMenu) pauseDropdownMenu.addEventListener('click', (e) => { if (e.target.tagName === 'A') { const minutes = parseInt(e.target.dataset.minutes, 10); if (minutes) { chrome.runtime.sendMessage({ command: "pause-extension", minutes: minutes }); window.close(); } } });
    
    document.querySelectorAll('.custom-select').forEach(select => {
        const button = select.querySelector('.select-button');
        if (button) { button.addEventListener('click', (e) => { e.stopPropagation(); closeAllPopups(select); select.classList.toggle('open'); }); }
        const panel = select.querySelector('.select-panel');
        if (panel) { panel.addEventListener('click', async (e) => { if (e.target.classList.contains('select-option')) { const value = e.target.dataset.value; select.dataset.value = value; select.querySelector('.select-value').textContent = e.target.textContent; panel.querySelector('.select-option.selected')?.classList.remove('selected'); e.target.classList.add('selected'); closeAllPopups(); if (select.id === 'characterSelect') { await chrome.storage.sync.set({ characterChoice: value }); } else if (select.id === 'petSelect') { await chrome.storage.sync.set({ petChoice: value }); } else if (select.id === 'relaxingActivitySelect') { await chrome.storage.sync.set({ relaxingActivity: value }); } } }); }
    });

    window.addEventListener('click', () => closeAllPopups());

    if (saveButton) saveButton.addEventListener('click', async () => {
        await chrome.storage.sync.set({
            wakeTime: (wakeTimeSelect.dataset.value === '07:00' && sleepTimeSelect.dataset.value === '19:00') ? '' : wakeTimeSelect.dataset.value,
            sleepTime: (wakeTimeSelect.dataset.value === '07:00' && sleepTimeSelect.dataset.value === '19:00') ? '' : sleepTimeSelect.dataset.value,
            engageMinutes: engageMinutesSelect.dataset.value,
            characterChoice: characterSelect.dataset.value,
            petChoice: petSelect.dataset.value,
            relaxingActivity: relaxingActivitySelect.dataset.value,
            dayBrightness: dayBrightnessSlider.value,
            dayWarmth: dayWarmthSlider.value,
            nightBrightness: nightBrightnessSlider.value,
            nightWarmth: nightWarmthSlider.value,
            manualBrightness: null, manualWarmth: null, nightShiftActive: false, pausedUntil: null
        });
        chrome.runtime.sendMessage({ command: "update-styles" });
        loadStateAndUpdateUI();
        showMainView();
    });

    // Listeners for schedule sliders
    if(dayBrightnessSlider) dayBrightnessSlider.addEventListener('input', () => { dayBrightnessValue.textContent = dayBrightnessSlider.value; updateSliderFill(dayBrightnessSlider); });
    if(dayWarmthSlider) dayWarmthSlider.addEventListener('input', () => { dayWarmthValue.textContent = dayWarmthSlider.value; updateSliderFill(dayWarmthSlider); });
    if(nightBrightnessSlider) nightBrightnessSlider.addEventListener('input', () => { nightBrightnessValue.textContent = nightBrightnessSlider.value; updateSliderFill(nightBrightnessSlider); });
    if(nightWarmthSlider) nightWarmthSlider.addEventListener('input', () => { nightWarmthValue.textContent = nightWarmthSlider.value; updateSliderFill(nightWarmthSlider); });

    if(dayBrightnessSlider) dayBrightnessSlider.addEventListener('change', async () => { await chrome.storage.sync.set({ dayBrightness: dayBrightnessSlider.value, manualBrightness: null, manualWarmth: null, nightShiftActive: false, pausedUntil: null }); chrome.runtime.sendMessage({ command: "update-styles" }); });
    if(dayWarmthSlider) dayWarmthSlider.addEventListener('change', async () => { await chrome.storage.sync.set({ dayWarmth: dayWarmthSlider.value, manualBrightness: null, manualWarmth: null, nightShiftActive: false, pausedUntil: null }); chrome.runtime.sendMessage({ command: "update-styles" }); });
    if(nightBrightnessSlider) nightBrightnessSlider.addEventListener('change', async () => { await chrome.storage.sync.set({ nightBrightness: nightBrightnessSlider.value, manualBrightness: null, manualWarmth: null, nightShiftActive: false, pausedUntil: null }); chrome.runtime.sendMessage({ command: "update-styles" }); });
    if(nightWarmthSlider) nightWarmthSlider.addEventListener('change', async () => { await chrome.storage.sync.set({ nightWarmth: nightWarmthSlider.value, manualBrightness: null, manualWarmth: null, nightShiftActive: false, pausedUntil: null }); chrome.runtime.sendMessage({ command: "update-styles" }); });
    
    if (resetAppearanceButton) {
        resetAppearanceButton.addEventListener('click', () => {
            const defaults = { dayB: 100, dayW: 0, nightB: 85, nightW: 50 };
            dayBrightnessSlider.value = defaults.dayB; dayBrightnessValue.textContent = defaults.dayB; updateSliderFill(dayBrightnessSlider);
            dayWarmthSlider.value = defaults.dayW; dayWarmthValue.textContent = defaults.dayW; updateSliderFill(dayWarmthSlider);
            nightBrightnessSlider.value = defaults.nightB; nightBrightnessValue.textContent = defaults.nightB; updateSliderFill(nightBrightnessSlider);
            nightWarmthSlider.value = defaults.nightW; nightWarmthValue.textContent = defaults.nightW; updateSliderFill(nightWarmthSlider);
        });
    }

    // Main Slider Logic
    function updateSliderFill(slider) { if(!slider) return; const min = slider.min || 0; const max = slider.max || 100; const value = slider.value; const percentage = (value - min) / (max - min) * 100; slider.style.setProperty('--fill-percent', `${percentage}%`); }
    function updateSliderLive(e) { const brightness = brightnessSlider.value; const warmth = warmthSlider.value; if(brightnessValue) brightnessValue.textContent = brightness; if(warmthValue) warmthValue.textContent = warmth; updateSliderFill(e.target); chrome.runtime.sendMessage({ command: "update-styles", manualValues: { brightness, warmth } }); if(statusText) statusText.textContent = "Manual Override."; }
    async function saveSliderState() { if(brightnessSlider && warmthSlider) { await chrome.storage.sync.set({ manualBrightness: brightnessSlider.value, manualWarmth: warmthSlider.value, nightShiftActive: false, pausedUntil: null }); console.log("Slider state saved."); } }
    if(brightnessSlider) brightnessSlider.addEventListener('input', updateSliderLive);
    if(warmthSlider) warmthSlider.addEventListener('input', updateSliderLive);
    if(brightnessSlider) brightnessSlider.addEventListener('change', saveSliderState);
    if(warmthSlider) warmthSlider.addEventListener('change', saveSliderState);
    
    // --- Initial Load ---
    populateTimeSelect(document.getElementById('wakeTimePanel'));
    populateTimeSelect(document.getElementById('sleepTimePanel'));
    loadStateAndUpdateUI();
});
