// game-audio.js
// Bevat het audio systeem voor Dieren Redders

// Audio systeem
const sounds = {};
let soundEnabled = true;
let musicEnabled = true;
let currentMusic = null;

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
        { name: 'puppyCrying', file: 'puppy-crying.mp3', volume: 0.9 }, // Nieuw puppy janken geluid
        { name: 'claw', file: 'claw.mp3', volume: 0.5 },
        { name: 'dig', file: 'dig.mp3', volume: 0.6 },
        { name: 'bounce', file: 'bounce.mp3', volume: 0.7 },
        { name: 'fire', file: 'fire.mp3', volume: 0.5 },
        { name: 'gameOver', file: 'game-over.mp3', volume: 0.8 },
        { name: 'laserZap', file: 'laser-zap.mp3', volume: 1.0 }, // Maximaal volume voor laser zap
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

// Functies voor muziek
function loadMusic(path) {
    return new Promise((resolve, reject) => {
        // Als er al muziek speelt, stop deze
        if (currentMusic) {
            currentMusic.pause();
            currentMusic = null;
        }
        
        console.log('Muziek proberen te laden:', path);
        
        // Maak een nieuw audio object aan
        const audio = new Audio(path);
        audio.loop = true;
        audio.volume = 0.3; // Standaard volume voor muziek
        
        // Update volume slider als die bestaat
        const volumeSlider = document.getElementById('music-volume');
        if (volumeSlider) {
            volumeSlider.value = audio.volume * 100;
            volumeSlider.style.display = musicEnabled ? 'block' : 'none';
        }
        
        // Controleer of de knop goed staat
        const musicButton = document.getElementById('music-toggle');
        if (musicButton) {
            musicButton.textContent = musicEnabled ? '🎵' : '🔇';
        }
        
        audio.addEventListener('canplaythrough', () => {
            console.log('Muziek succesvol geladen:', path);
            currentMusic = audio;
            if (musicEnabled) {
                audio.play()
                    .then(() => console.log('Muziek afspelen gestart'))
                    .catch(err => console.error('Muziek afspelen mislukt:', err));
            } else {
                console.log('Muziek geladen maar niet gestart (muziek staat uit)');
            }
            resolve();
        }, { once: true });
        
        audio.addEventListener('error', (e) => {
            console.error('Fout bij laden van muziek:', path, e);
            reject(e);
        });
        
        // Stel een timeout in voor het geval dat het laden te lang duurt
        const timeout = setTimeout(() => {
            console.warn('Timeout bij laden van muziek:', path);
            reject(new Error('Timeout bij laden van muziek'));
        }, 10000); // 10 seconden timeout
        
        // Extra event listener om de timeout te annuleren als het laden lukt
        audio.addEventListener('canplaythrough', () => {
            clearTimeout(timeout);
        }, { once: true });
        
        // Begin met laden
        audio.load();
    });
}

// Toggle muziek aan/uit
function toggleMusic() {
    musicEnabled = !musicEnabled;
    
    if (currentMusic) {
        if (musicEnabled) {
            currentMusic.play().catch(err => console.log('Muziek hervatten mislukt:', err));
        } else {
            currentMusic.pause();
        }
    }
    
    return musicEnabled;
}

// Voeg een muziek aan/uit knop en volumeregelaar toe aan de UI
function addMusicControl() {
    // Container voor muziek controls (knop en volume)
    const musicControlContainer = document.createElement('div');
    musicControlContainer.id = 'music-control-container';
    musicControlContainer.style.position = 'absolute';
    musicControlContainer.style.top = '10px';
    musicControlContainer.style.left = '60px'; // Naast de geluidknop
    musicControlContainer.style.zIndex = '1000'; // Boven andere elementen
    musicControlContainer.style.display = 'flex';
    musicControlContainer.style.flexDirection = 'column';
    musicControlContainer.style.alignItems = 'center';
    
    // Muziek aan/uit knop
    const musicButton = document.createElement('button');
    musicButton.id = 'music-toggle';
    musicButton.textContent = '🎵';
    musicButton.style.width = '40px';
    musicButton.style.height = '40px';
    musicButton.style.fontSize = '20px';
    musicButton.style.background = 'rgba(0,0,0,0.5)';
    musicButton.style.color = 'white';
    musicButton.style.border = 'none';
    musicButton.style.borderRadius = '5px';
    musicButton.style.cursor = 'pointer';
    
    // Volume slider
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.id = 'music-volume';
    volumeSlider.min = '0';
    volumeSlider.max = '100';
    volumeSlider.value = '30'; // Default 30%
    volumeSlider.style.width = '40px';
    volumeSlider.style.marginTop = '5px';
    volumeSlider.style.accentColor = '#45882f'; // Groene kleur die bij de UI past
    volumeSlider.style.display = 'none'; // Begin verborgen, toon wanneer muziek speelt
    
    // Voeg elementen toe aan container
    musicControlContainer.appendChild(musicButton);
    musicControlContainer.appendChild(volumeSlider);
    
    // Music button event listener
    musicButton.addEventListener('click', () => {
        const musicEnabled = toggleMusic();
        musicButton.textContent = musicEnabled ? '🎵' : '🔇';
        volumeSlider.style.display = musicEnabled ? 'block' : 'none';
    });
    
    // Volume slider event listener
    volumeSlider.addEventListener('input', () => {
        if (currentMusic) {
            currentMusic.volume = volumeSlider.value / 100;
        }
    });
    
    // Voeg container toe aan de body
    document.body.appendChild(musicControlContainer);
    
    // Pas positie van fullscreen knop aan (indien die bestaat)
    const fullscreenButton = document.getElementById('fullscreen-button');
    if (fullscreenButton) {
        fullscreenButton.style.left = '110px'; // Naast de muziek controls
    }
}

// Laad muziek voor een specifiek level
function loadLevelMusic(levelIndex) {
    // Stop huidige muziek als die speelt
    if (currentMusic) {
        currentMusic.pause();
        currentMusic = null;
    }
    
    // Check of het level muziek specificeert
    const levels = window.levels;
    if (!levels || !levels[levelIndex]) {
        console.warn('Level niet gevonden voor muziek laden');
        return;
    }
    
    const level = levels[levelIndex];
    
    // Haal eerst beschikbare muziekbestanden op om te controleren wat er beschikbaar is
    fetch('/api/music')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.music_files && data.music_files.length > 0) {
                // We hebben een lijst met beschikbare muziekbestanden
                console.log('Beschikbare muziekbestanden:', data.music_files);
                
                // Als het level een muziekbestand heeft, controleer of het beschikbaar is
                if (level.music && data.music_files.includes(level.music)) {
                    console.log(`Laden van muziek voor level ${levelIndex + 1}: ${level.music}`);
                    loadMusic(`music/${level.music}`).catch(err => {
                        fallbackToDefaultMusic(data.music_files, err);
                    });
                } else {
                    // Anders kies een standaard muziekbestand uit de beschikbare bestanden
                    fallbackToDefaultMusic(data.music_files);
                }
            } else {
                console.warn('Geen muziekbestanden gevonden');
            }
        })
        .catch(err => {
            console.error('Fout bij ophalen muziekbestanden:', err);
            // Probeer direct een standaard muziekbestand te laden als fallback
            tryLoadDefaultMusic();
        });
    
    // Functie om een standaard muziekbestand te kiezen uit beschikbare bestanden
    function fallbackToDefaultMusic(availableFiles, error) {
        if (error) {
            console.warn('Kon opgegeven muziek niet laden:', error);
        }
        
        // Probeer eerst default.mp3 als die bestaat
        if (availableFiles.includes('default.mp3') && 
            // Check of het bestand meer dan 0 bytes is (ter voorkoming van lege bestanden)
            availableFiles.some(file => file === 'default.mp3')) {
            
            console.log('Laden van standaard muziek: default.mp3');
            loadMusic('music/default.mp3').catch(e => {
                console.error('Kon standaard muziek niet laden, probeer een ander bestand');
                tryAnotherMusicFile(availableFiles);
            });
        } else {
            // Als default.mp3 niet bestaat, kies een willekeurig muziekbestand
            tryAnotherMusicFile(availableFiles);
        }
    }
    
    // Functie om een willekeurig muziekbestand te proberen
    function tryAnotherMusicFile(availableFiles) {
        if (availableFiles && availableFiles.length > 0) {
            // Filter out empty files (default.mp3 might be empty)
            const nonEmptyFiles = availableFiles.filter(file => file !== 'default.mp3');
            
            if (nonEmptyFiles.length > 0) {
                // Kies een willekeurig bestand
                const randomFile = nonEmptyFiles[Math.floor(Math.random() * nonEmptyFiles.length)];
                console.log('Probeer alternatieve muziek:', randomFile);
                loadMusic(`music/${randomFile}`).catch(e => {
                    console.error('Kon geen enkel muziekbestand laden:', e);
                });
            } else {
                console.warn('Geen geschikte muziekbestanden gevonden');
            }
        }
    }
    
    // Probeer direct een paar standaard muziekbestanden als laatste optie
    function tryLoadDefaultMusic() {
        // Lijst van mogelijke standaard bestanden om te proberen
        const defaultOptions = [
            'best-game-console-301284.mp3',
            'pixel-fight-8-bit-arcade-music-background-music-for-video-208775.mp3',
            'default2.mp3'
        ];
        
        // Probeer elk bestand totdat er één werkt
        let index = 0;
        
        function tryNextFile() {
            if (index >= defaultOptions.length) {
                console.error('Alle standaard muziekbestanden faalden');
                return;
            }
            
            const file = defaultOptions[index++];
            console.log(`Directe poging met standaard muziek: ${file}`);
            
            loadMusic(`music/${file}`).catch(e => {
                console.warn(`Kon ${file} niet laden:`, e);
                tryNextFile(); // Probeer het volgende bestand
            });
        }
        
        tryNextFile();
    }
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
    addSoundControl,
    
    // Music functions
    loadMusic,
    toggleMusic,
    addMusicControl,
    loadLevelMusic
};
