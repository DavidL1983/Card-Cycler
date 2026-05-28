// Initial transparent image (1x1 transparent pixel, alpha=0)
const blankWhiteImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NgAAIAAAUAAR4f7BQAAAAASUVORK5CYII=';

// Transparent pixel for cleared state
const transparentImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NgAAIAAAUAAR4f7BQAAAAASUVORK5CYII=';

// 10 different color schemes to cycle through
const colorSchemes = [
    // 1. Classic RBYG (default)
    ['#d8422a', '#4d98ff', '#f2d34a', '#7ad14b'],
    // 2. Ocean Breeze
    ['#006d77', '#83c5be', '#edf6f9', '#ffddd2'],
    // 3. Sunset Vibes
    ['#f72585', '#7209b7', '#f4a261', '#e76f51'],
    // 4. Forest Earth
    ['#582f0e', '#7f4f24', '#936639', '#a68a64'],
    // 5. Candy Pop
    ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec'],
    // 6. Cool Pastels
    ['#a8dadc', '#457b9d', '#f1faee', '#e63946'],
    // 7. Neon Nights
    ['#06ffa5', '#00d9ff', '#ff00ff', '#ffff00'],
    // 8. Desert Sand
    ['#e63946', '#f77f00', '#fcbf49', '#eae2b7'],
    // 9. Purple Rain
    ['#3c096c', '#5a189a', '#9d4edd', '#c77dff'],
    // 10. Tropical
    ['#ff5400', '#ff6d00', '#ff8500', '#ff9e00']
];

let currentSchemeIndex = 0;

// Current color mapping (starts with first scheme)
let colorMap = {
    'red': colorSchemes[0][0],
    'blue': colorSchemes[0][1],
    'yellow': colorSchemes[0][2],
    'green': colorSchemes[0][3]
};

// Color scheme generator functionality
const colorSchemeButton = document.querySelector('.toolbar__btn--colors');

if (colorSchemeButton) {
    colorSchemeButton.addEventListener('click', () => {
        // Cycle to next color scheme
        currentSchemeIndex = (currentSchemeIndex + 1) % colorSchemes.length;
        const newColors = colorSchemes[currentSchemeIndex];
        
        // Update color map
        const colorKeys = ['red', 'blue', 'yellow', 'green'];
        colorKeys.forEach((key, index) => {
            colorMap[key] = newColors[index];
        });
        
        // Update all palette swatches across all cards
        updateAllPaletteColors();
        
        // Visual feedback
        console.log(`Color scheme ${currentSchemeIndex + 1} of ${colorSchemes.length} loaded`);
    });
}

// Update all palette swatch colors across all cards
function updateAllPaletteColors() {
    const allSwatches = document.querySelectorAll('.palette__swatch');
    
    allSwatches.forEach(swatch => {
        const colorName = swatch.dataset.color;
        if (colorName && colorMap[colorName]) {
            swatch.style.backgroundColor = colorMap[colorName];
        }
    });
}

// ========== MEASURE MANAGEMENT ==========

// Track visible measures
const measures = [
    document.querySelector('.measure-one'),
    document.querySelector('.measure-two'),
    document.querySelector('.measure-three'),
    document.querySelector('.measure-four')
];

let visibleMeasureCount = 1; // Start with only measure 1 visible

// Get add/remove buttons
const addButton = document.querySelector('.toolbar__btn--add');
const removeButton = document.querySelector('.toolbar__btn--remove');

// Function to update visible beat cards for metronome
function updateBeatCards() {
    beatCards = [];
    measures.forEach((measure, index) => {
        if (index < visibleMeasureCount && measure) {
            const cards = measure.querySelectorAll('.measure__card');
            beatCards.push(...Array.from(cards));
        }
    });
    
    // Re-initialize cards for interactive functionality
    beatCards.forEach(card => {
        // Check if already initialized (to avoid duplicate listeners)
        if (!card.dataset.initialized) {
            initializeCard(card);
            card.dataset.initialized = 'true';
        }
    });
}

// Add measure button handler
if (addButton) {
    addButton.addEventListener('click', () => {
        if (visibleMeasureCount < 4) {
            measures[visibleMeasureCount].style.display = 'flex';
            visibleMeasureCount++;
            updateBeatCards();
            
            // If metronome is playing, restart to update beat count
            if (isPlaying) {
                stopMetronome();
                startMetronome();
            }
        }
    });
}

// Remove measure button handler
if (removeButton) {
    removeButton.addEventListener('click', () => {
        if (visibleMeasureCount > 1) {
            visibleMeasureCount--;
            measures[visibleMeasureCount].style.display = 'none';
            updateBeatCards();
            
            // Reset beat index if it exceeds new card count
            if (currentBeatIndex >= beatCards.length) {
                currentBeatIndex = 0;
            }
            
            // If metronome is playing, restart to update beat count
            if (isPlaying) {
                stopMetronome();
                startMetronome();
            }
        }
    });
}

// ========== METRONOME FUNCTIONALITY ==========

// Metronome state
let metronomeInterval = null;
let isPlaying = false;
let bpm = 120;
let currentBeatIndex = 0;
let beatCards = [];

// Get metronome controls
const playButton = document.querySelector('.toolbar__btn--play');
const stopButton = document.querySelector('.toolbar__btn--stop');
const bpmSlider = document.querySelector('.bpm-slider');
const bpmDisplay = document.querySelector('.bpm-display');

// Initialize beat cards
updateBeatCards();

// Create audio context for metronome click
let audioContext;
let clickSound;

// Initialize audio (need user interaction first)
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Load the metronome click sound if available
        loadClickSound();
    }
}

// Load metronome click sound
function loadClickSound() {
    const clickPath = 'media/metronome_click.mp3';
    fetch(clickPath)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            clickSound = audioBuffer;
        })
        .catch(error => {
            console.log('Metronome click sound not found, using beep instead');
        });
}

// Play metronome click sound
function playClick() {
    if (!audioContext) return;
    
    // Highlight current beat card
    beatCards.forEach((card, index) => {
        if (index === currentBeatIndex) {
            card.classList.add('active-beat');
        } else {
            card.classList.remove('active-beat');
        }
    });
    
    // Move to next beat
    currentBeatIndex = (currentBeatIndex + 1) % beatCards.length;
    
    if (clickSound) {
        // Play loaded sound
        const source = audioContext.createBufferSource();
        source.buffer = clickSound;
        source.connect(audioContext.destination);
        source.start(0);
    } else {
        // Generate beep sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}

// Start metronome
function startMetronome() {
    if (isPlaying) return;
    
    initAudio();
    isPlaying = true;
    playButton.style.opacity = '0.5';
    
    // Calculate interval in milliseconds
    const interval = (60 / bpm) * 1000;
    
    // Play first click immediately
    playClick();
    
    // Set interval for subsequent clicks
    metronomeInterval = setInterval(() => {
        playClick();
    }, interval);
}

// Stop metronome
function stopMetronome() {
    if (!isPlaying) return;
    
    isPlaying = false;
    playButton.style.opacity = '1';
    
    if (metronomeInterval) {
        clearInterval(metronomeInterval);
        metronomeInterval = null;
    }
    
    // Clear all beat highlights
    beatCards.forEach(card => card.classList.remove('active-beat'));
    currentBeatIndex = 0;
}

// Update BPM
function updateBPM(newBPM) {
    bpm = parseInt(newBPM);
    bpmDisplay.textContent = `${bpm} BPM`;
    
    // If metronome is playing, restart with new tempo
    if (isPlaying) {
        stopMetronome();
        startMetronome();
    }
}

// Event listeners for metronome controls
if (playButton) {
    playButton.addEventListener('click', startMetronome);
}

if (stopButton) {
    stopButton.addEventListener('click', stopMetronome);
}

if (bpmSlider) {
    bpmSlider.addEventListener('input', (e) => {
        updateBPM(e.target.value);
    });
}

// Initialize BPM display
if (bpmDisplay) {
    bpmDisplay.textContent = `${bpm} BPM`;
}

// Function to initialize each card independently
function initializeCard(card) {
    // Get elements scoped to this specific card
    const rhythmButtons = card.querySelectorAll('.rhythm-picker__item');
    const previewImg = card.querySelector('.preview__img');
    const colorSwatches = card.querySelectorAll('.palette__swatch:not(.palette__swatch--clear)');
    const clearButton = card.querySelector('.palette__swatch--clear');
    
    // Set initial blank image for this card
    if (previewImg) {
        previewImg.src = blankWhiteImage;
    }
    
    // Add click event listener to each rhythm button in this card
    rhythmButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all rhythm buttons in this card only
            rhythmButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get the image from the clicked button
            const img = button.querySelector('img');
            if (img && previewImg) {
                previewImg.src = img.src;
                previewImg.alt = img.alt;
            }
        });
    });
    
    // Add click event listener to each color swatch in this card
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const colorName = swatch.dataset.color;
            const colorValue = colorMap[colorName];
            
            // Set background color on this card's preview only
            if (previewImg && colorValue) {
                previewImg.style.backgroundColor = colorValue;
            }
        });
    });
    
    // Add click event listener to clear button in this card
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            // Remove active class from all rhythm buttons in this card only
            rhythmButtons.forEach(btn => btn.classList.remove('active'));
            
            // Reset this card's preview image to transparent pixel
            if (previewImg) {
                previewImg.src = transparentImage;
                previewImg.style.backgroundColor = '';
            }
        });
    }
}