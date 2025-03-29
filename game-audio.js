// game-audio.js
// Bevat het audio systeem voor Dieren Redders

// Audio systeem
const sounds = {};
let soundEnabled = true;

// Houdt bij welke loopende geluiden actief zijn
const loopingSounds = {
    // Format: soundName: isPlaying
};

// Laad een geluidsbestand
function loadSound(name, path) {
    const sound = new Audio(path);
    sound.preload = 'auto';
    
    // Haal geluidsopties op als die er zijn (voor deze functie meegegeven door loadGameSounds)
    const soundInfo = window._soundLoadInfo && window._soundLoadInfo[name];
    
    // Stel loop in als dat nodig is
    if (soundInfo && soundInfo.loop) {
        sound.loop = true;
        // Initialiseer de status voor loopende geluiden
        loopingSounds[name] = false;
    }
    
    sounds[name] = sound;
    return new Promise((resolve, reject) => {
        sound.addEventListener('canplaythrough', () => resolve(name), { once: true });
        sound.addEventListener('error', reject);
    });
}

// Speel een gewoon (niet-looping) geluid af met optioneel volume (0.0 - 1.0)
function playSound(name, volume) {
    if (!soundEnabled || !sounds[name]) return;
    
    // Als het geluid al speelt, reset het en speel opnieuw
    const sound = sounds[name];
    sound.currentTime = 0;
    
    // Pas volume aan als opgegeven, anders gebruik standaardvolume
    if (volume !== undefined) {
        sound.volume = Math.max(0, Math.min(1, volume)); // Begrens tussen 0 en 1
    }
    
    sound.play().catch(err => console.log('Geluid afspelen mislukt:', err));
}

// Start een loopend geluid (bijv. onderwater of wind)
function playLoopingSound(name) {
    // Check of geluid bestaat en of het loop=true moet zijn
    if (!soundEnabled || !sounds[name] || !loopingSounds.hasOwnProperty(name)) return;
    
    // Als het geluid al speelt, hoeven we niets te doen
    if (loopingSounds[name]) return;
    
    const sound = sounds[name];
    if (sound.paused) {
        sound.currentTime = 0;
        sound.play().catch(err => console.log(`${name} geluid afspelen mislukt:`, err));
    }
    
    loopingSounds[name] = true;
}

// Stop een loopend geluid
function stopLoopingSound(name) {
    // Check of geluid bestaat en of het een loopend geluid is
    if (!sounds[name] || !loopingSounds.hasOwnProperty(name)) return;
    
    // Als het geluid niet speelt, hoeven we niets te doen
    if (!loopingSounds[name]) return;
    
    const sound = sounds[name];
    sound.pause();
    sound.currentTime = 0;
    loopingSounds[name] = false;
}

// Stop alle loopende geluiden
function stopAllLoopingSounds() {
    Object.keys(loopingSounds).forEach(name => {
        if (loopingSounds[name] && sounds[name]) {
            sounds[name].pause();
            sounds[name].currentTime = 0;
            loopingSounds[name] = false;
        }
    });
}

// Audio aan/uit zetten
function toggleSound() {
    soundEnabled = !soundEnabled;
    
    // Alle geluiden stoppen als geluid uit wordt gezet
    if (!soundEnabled) {
        // Stop alle spelende geluiden
        Object.values(sounds).forEach(sound => {
            if (!sound.paused) {
                sound.pause();
                sound.currentTime = 0;
            }
        });
        
        // Reset alle loopende geluiden
        Object.keys(loopingSounds).forEach(name => {
            loopingSounds[name] = false;
        });
    }
    
    return soundEnabled;
}

// Laad alle geluidseffecten voor het spel
function loadGameSounds(soundsPath = 'sounds/') {
    // Speel geluiden met standaard volumes
    const soundsToLoad = [
        { name: 'jump', file: 'jump.mp3', volume: 0.7 },
        { name: 'splash', file: 'splash.mp3', volume: 0.6 },
        { name: 'collect', file: 'collect.mp3', volume: 0.8 },
        { name: 'puppy', file: 'puppy.mp3', volume: 0.9 },
        { name: 'claw', file: 'claw.mp3', volume: 0.5, loop: true },
        { name: 'dig', file: 'dig.mp3', volume: 0.6 },
        { name: 'bounce', file: 'bounce.mp3', volume: 0.7 },
        { name: 'fire', file: 'fire.mp3', volume: 0.5 },
        { name: 'gameOver', file: 'game-over.mp3', volume: 0.8 },
        { name: 'underwater', file: 'under-water.mp3', volume: 0.4, loop: true },
        { name: 'wind', file: 'wind.mp3', volume: 0.5, loop: true }
    ];
    
    // Maak een visuele indicator tijdens het laden
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'sound-loading';
    loadingIndicator.textContent = 'Geluiden laden...';
    loadingIndicator.style.position = 'absolute';
    loadingIndicator.style.bottom = '10px';
    loadingIndicator.style.right = '10px';
    loadingIndicator.style.background = 'rgba(0,0,0,0.5)';
    loadingIndicator.style.color = 'white';
    loadingIndicator.style.padding = '5px 10px';
    loadingIndicator.style.borderRadius = '5px';
    document.body.appendChild(loadingIndicator);
    
    // Sla de geluidsinfo op in een global object zodat loadSound er bij kan
    window._soundLoadInfo = {};
    soundsToLoad.forEach(sound => {
        window._soundLoadInfo[sound.name] = {
            volume: sound.volume,
            loop: sound.loop
        };
    });
    
    // Probeer eerst .mp3 en .m4a bestanden te vinden
    return Promise.all(soundsToLoad.map(sound => {
        // Maak een lijst van bestandsformaten om te proberen (eerst mp3, dan m4a)
        const audioFormats = ['.mp3', '.m4a']; 
        
        // Functie om geluid te laden met een specifiek formaat
        const tryLoadSound = (format, index) => {
            // Bepaal pad op basis van of we een custom bestandsnaam hebben
            const filename = sound.file || (sound.name + format);
            const filePath = soundsPath + filename;
            
            return loadSound(sound.name, filePath)
                .then(name => {
                    // Stel het standaardvolume in als dat is opgegeven
                    if (sound.volume !== undefined && sounds[name]) {
                        sounds[name].volume = sound.volume;
                    }
                    return name;
                })
                .catch(err => {
                    // Als dit formaat niet werkte en er zijn nog formaten over, probeer de volgende
                    if (index < audioFormats.length - 1) {
                        return tryLoadSound(audioFormats[index + 1], index + 1);
                    } else {
                        // Alle formaten zijn mislukt, log een waarschuwing
                        console.warn(`Kon geluid ${sound.name} niet laden: ${err.message}`);
                        return null; // Return null voor mislukte geluiden zodat Promise.all doorgaat
                    }
                });
        };
        
        // Start met het eerste bestandsformaat
        return tryLoadSound(audioFormats[0], 0);
    }))
    .then(() => {
        // Alle geluiden zijn geladen
        console.log('Alle geluiden geladen');
        loadingIndicator.textContent = 'Geluiden geladen!';
        setTimeout(() => {
            loadingIndicator.remove();
        }, 2000);
    })
    .catch(err => {
        console.error('Fout bij laden van geluiden:', err);
        loadingIndicator.textContent = 'Enkele geluiden niet geladen';
        setTimeout(() => {
            loadingIndicator.remove();
        }, 2000);
    });
}

// Voeg een geluid aan/uit knop toe aan de UI
function addSoundControl() {
    const soundButton = document.createElement('button');
    soundButton.id = 'sound-toggle';
    soundButton.textContent = '🔊';
    soundButton.style.position = 'absolute';
    soundButton.style.top = '10px';
    soundButton.style.left = '10px'; // Links bovenin
    soundButton.style.width = '40px';
    soundButton.style.height = '40px';
    soundButton.style.fontSize = '20px';
    soundButton.style.background = 'rgba(0,0,0,0.5)';
    soundButton.style.color = 'white';
    soundButton.style.border = 'none';
    soundButton.style.borderRadius = '5px';
    soundButton.style.cursor = 'pointer';
    soundButton.style.zIndex = '1000'; // Boven andere elementen
    
    soundButton.addEventListener('click', () => {
        const soundEnabled = toggleSound();
        soundButton.textContent = soundEnabled ? '🔊' : '🔇';
    });
    
    document.body.appendChild(soundButton);
}

// Legacy functies voor backwards compatibiliteit
// Deze roepen de nieuwe generieke functies aan

// Speel onderwater geluid af (legacy functie)
function playUnderwaterSound() {
    playLoopingSound('underwater');
}

// Stop onderwater geluid (legacy functie)
function stopUnderwaterSound() {
    stopLoopingSound('underwater');
}

// Speel wind geluid af (legacy functie)
function playWindSound() {
    playLoopingSound('wind');
}

// Stop wind geluid (legacy functie)
function stopWindSound() {
    stopLoopingSound('wind');
}

// Exporteer geluidsfuncties
window.gameAudio = {
    // Game sound management
    sounds,
    loadSound,
    playSound,
    toggleSound,
    
    // Nieuwe generieke functies voor loopende geluiden
    playLoopingSound,
    stopLoopingSound,
    stopAllLoopingSounds,
    
    // Legacy functies voor backwards compatibiliteit
    playUnderwaterSound,
    stopUnderwaterSound,
    playWindSound,
    stopWindSound,
    
    // Sound initialization
    loadGameSounds,
    addSoundControl
};
