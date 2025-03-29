// game-audio.js
// Bevat het audio systeem voor Dieren Redders

// Audio systeem
const sounds = {};
let soundEnabled = true;
let musicEnabled = true;
let currentMusic = null;

// Default muziekvolume (wordt overschreven door localStorage indien beschikbaar)
let musicVolume = 0.3;

// Probeer opgeslagen volume te laden uit localStorage
try {
    const savedVolume = localStorage.getItem('musicVolume');
    if (savedVolume !== null) {
        musicVolume = parseFloat(savedVolume);
        console.log('Muziekvolume geladen uit localStorage:', musicVolume);
    }
} catch (e) {
    console.warn('Kon muziekvolume niet laden uit localStorage:', e);
}

// Probeer opgeslagen muziek aan/uit status te laden
try {
    const savedMusicEnabled = localStorage.getItem('musicEnabled');
    if (savedMusicEnabled !== null) {
        musicEnabled = savedMusicEnabled === 'true';
        console.log('Muziek aan/uit status geladen uit localStorage:', musicEnabled);
    }
} catch (e) {
    console.warn('Kon muziek aan/uit status niet laden uit localStorage:', e);
}

// Houdt bij welke loopende geluiden actief zijn
const loopingSounds = {
    // Format: soundName: isPlaying
};

// Houdt bij of de gebruiker al interactie heeft gehad met de pagina
// Dit is nodig omdat browsers muziekafspelen beperken zonder gebruikersinteractie
let userInteractionOccurred = false;

// Houdt bij welke muziek we willen afspelen zodra gebruikersinteractie heeft plaatsgevonden
let pendingMusicToPlay = null;

// Event listener voor het document om gebruikersinteractie te detecteren
document.addEventListener('DOMContentLoaded', () => {
    // We wachten tot de pagina volledig geladen is
    setupUserInteractionDetection();
});

// Laad een geluidsbestand
function loadSound(name, path) {
    console.log(`Bezig met laden van geluid: ${name} van pad: ${path}`);
    
    return new Promise((resolve, reject) => {
        // Soms is er een probleem met het laden van een geluidsbestand
        // We proberen het maximaal 3 keer met een kleine pauze ertussen
        let attemptCount = 0;
        const maxAttempts = 3;
        
        function attemptLoadSound() {
            attemptCount++;
            console.log(`Poging ${attemptCount} om geluid te laden: ${name}`);
            
            const sound = new Audio(path);
            sound.preload = 'auto';
            
            // Belangrijke fix voor sommige browsers: force preload van het geluid
            // door het kort af te spelen en dan te pauzeren (lost sommige laadblokkades op)
            sound.muted = true; // Zodat niemand het hoort
            
            // Haal geluidsopties op als die er zijn (voor deze functie meegegeven door loadGameSounds)
            const soundInfo = window._soundLoadInfo && window._soundLoadInfo[name];
            
            // Stel loop in als dat nodig is
            if (soundInfo && soundInfo.loop) {
                sound.loop = true;
                // Initialiseer de status voor loopende geluiden
                loopingSounds[name] = false;
            }
            
            // Stel volume in als opgegeven
            if (soundInfo && soundInfo.volume !== undefined) {
                sound.volume = soundInfo.volume;
            }
            
            // Luister naar het 'canplaythrough' event om te weten wanneer het geluid geladen is
            sound.addEventListener('canplaythrough', () => {
                console.log(`Geluid ${name} succesvol geladen`);
                sound.muted = false; // Herstel mute status
                sounds[name] = sound;
                resolve(name);
            }, { once: true });
            
            // Behandel fouten tijdens het laden
            sound.addEventListener('error', (err) => {
                console.warn(`Fout bij laden van geluid ${name} (poging ${attemptCount}):`, err);
                
                // Als we nog pogingen over hebben, probeer opnieuw na een korte pauze
                if (attemptCount < maxAttempts) {
                    console.log(`Volgende poging voor geluid ${name} over 500ms...`);
                    setTimeout(attemptLoadSound, 500);
                } else {
                    // Alle pogingen zijn mislukt
                    console.error(`Kon geluid ${name} niet laden na ${maxAttempts} pogingen`);
                    
                    // Toch maar een lege audio-instantie opslaan zodat de game niet crasht
                    // wanneer dit geluid wordt afgespeeld
                    const dummySound = new Audio();
                    dummySound.volume = 0; // Stil, voor het geval dat
                    sounds[name] = dummySound;
                    
                    // Technisch gezien is dit een fout, maar we willen de game niet laten crashen
                    // dus we markeren het als opgelost
                    resolve(name);
                }
            }, { once: true });
            
            // Begin met het laden van het geluid
            sound.load();
            
            // Fix voor sommige browsers: probeer kort af te spelen om preload te forceren
            try {
                if (attemptCount === 1) { // Alleen bij eerste poging
                    setTimeout(() => {
                        try {
                            sound.play().then(() => {
                                setTimeout(() => {
                                    sound.pause();
                                    sound.currentTime = 0;
                                    sound.muted = false;
                                }, 10);
                            }).catch(() => {
                                // Negeer fouten hier - we proberen alleen om preload te forceren
                                sound.muted = false;
                            });
                        } catch (e) {
                            // Negeer fouten - sommige browsers staan dit niet toe zonder gebruikersinteractie
                        }
                    }, 100);
                }
            } catch (e) {
                // Negeer fouten
            }
        }
        
        // Start de eerste poging
        attemptLoadSound();
    });
}

// Speel een gewoon (niet-looping) geluid af met optioneel volume (0.0 - 1.0)
function playSound(name, volume) {
    if (!soundEnabled) return;
    
    // Controleer of het geluid bestaat
    if (!sounds[name]) {
        console.warn(`Geluid "${name}" bestaat niet of is niet geladen.`);
        return;
    }
    
    try {
        // Sommige browsers vereisen een gebruikersinteractie voordat geluid kan worden afgespeeld
        // We maken daarom een nieuwe Audio instantie voor elk geluid om dit probleem te vermijden
        const sound = sounds[name].cloneNode();
        
        // Pas volume aan als opgegeven, anders gebruik standaardvolume
        if (volume !== undefined) {
            sound.volume = Math.max(0, Math.min(1, volume)); // Begrens tussen 0 en 1
        }
        
        // We gebruiken een Promise met timeout om beter met foutmeldingen om te gaan
        const playPromise = sound.play();
        
        // Alleen afhandelen als browser promises ondersteunt voor audio
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.log(`Geluid ${name} afspelen mislukt:`, err);
                
                // Als het niet lukt om de sound te spelen, proberen we het nogmaals
                // maar creëer eerst een nieuwe audio-instantie met dezelfde bron
                // Dit lost problemen op met sommige browsers waar NotSupportedError optreedt
                try {
                    // Maak een volledig nieuwe Audio instantie met dezelfde bron
                    const originalSource = sounds[name].src;
                    const newSound = new Audio(originalSource);
                    
                    // Pas volume aan
                    if (volume !== undefined) {
                        newSound.volume = Math.max(0, Math.min(1, volume));
                    } else if (sounds[name].volume) {
                        newSound.volume = sounds[name].volume;
                    }
                    
                    // Wacht een korte tijd en probeer nog een keer
                    setTimeout(() => {
                        newSound.play().catch(e => {
                            console.log(`Tweede poging voor geluid ${name} mislukt:`, e);
                            
                            // Als ook de tweede poging mislukt, probeer een derde keer met alternatieve aanpak
                            setTimeout(() => {
                                try {
                                    // Force autoplay policy workaround door een zeer kort geluid te maken
                                    // en dan snel te vervangen door het echte geluid
                                    const context = new (window.AudioContext || window.webkitAudioContext)();
                                    const source = context.createBufferSource();
                                    source.buffer = context.createBuffer(1, 1, 22050);
                                    source.connect(context.destination);
                                    source.start(0);
                                    
                                    // Nu probeer het echte geluid
                                    setTimeout(() => {
                                        newSound.play().catch(finalErr => {
                                            console.error(`Alle pogingen voor geluid ${name} mislukt:`, finalErr);
                                        });
                                    }, 50);
                                } catch (audioContextErr) {
                                    console.error(`AudioContext aanpak voor ${name} mislukt:`, audioContextErr);
                                }
                            }, 200);
                        });
                    }, 100);
                } catch (retryErr) {
                    console.error(`Fout bij maken van nieuwe audio instantie voor ${name}:`, retryErr);
                }
            });
        }
    } catch (e) {
        console.error(`Fout bij afspelen van geluid ${name}:`, e);
    }
}

// Start een loopend geluid (bijv. onderwater of wind)
function playLoopingSound(name) {
    // Check of geluid is ingeschakeld
    if (!soundEnabled) return;
    
    // Controleer of het geluid bestaat en of het een loopend geluid is
    if (!sounds[name]) {
        console.warn(`Loopend geluid "${name}" bestaat niet of is niet geladen.`);
        return;
    }
    
    if (!loopingSounds.hasOwnProperty(name)) {
        console.warn(`Geluid "${name}" is niet gemarkeerd als loopend geluid.`);
        return;
    }
    
    // Als het geluid al speelt, hoeven we niets te doen
    if (loopingSounds[name]) return;
    
    const sound = sounds[name];
    if (sound.paused) {
        sound.currentTime = 0;
        
        // Speel het geluid af met verbeterde foutafhandeling
        sound.play().catch(err => {
            console.log(`Loopend geluid ${name} afspelen mislukt:`, err);
            
            // Als het niet lukt, probeer een nieuwe audio-instantie
            try {
                // Maak een volledig nieuwe Audio instantie met dezelfde bron
                const originalSource = sound.src;
                const newLoopingSound = new Audio(originalSource);
                newLoopingSound.loop = true;
                newLoopingSound.volume = sound.volume || 0.7;
                
                // Bewaar de nieuwe instantie zodat we die later kunnen pauzeren
                sounds[name] = newLoopingSound;
                
                // Wacht een korte tijd en probeer nog een keer
                setTimeout(() => {
                    newLoopingSound.play().catch(e => {
                        console.log(`Tweede poging voor loopend geluid ${name} mislukt:`, e);
                        loopingSounds[name] = false; // Reset de status als het mislukt
                    });
                }, 100);
            } catch (retryErr) {
                console.error(`Fout bij maken van nieuwe audio instantie voor loopend geluid ${name}:`, retryErr);
                loopingSounds[name] = false; // Reset de status als het mislukt
            }
        });
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
        { name: 'jump', file: 'jump.mp3', volume: 0.3 },
        { name: 'splash', file: 'splash.mp3', volume: 0.6 },
        { name: 'collect', file: 'level-up-8-bit.mp3', volume: 0.8 },
        { name: 'puppy', file: 'puppy.mp3', volume: 0.9 },
        // Speciale prioriteit voor puppyCrying geluid met meerdere alternatieven
        { name: 'puppyCrying', file: 'puppy-crying.mp3', volume: 0.9, alternatives: ['dog-whine.mp3', 'puppy-whine.mp3'] },
        { name: 'claw', file: 'claw.mp3', volume: 0.5 },
        { name: 'dig', file: 'dig.mp3', volume: 0.6 },
        { name: 'bounce', file: 'bounce.mp3', volume: 0.7 },
        { name: 'fire', file: 'fire.mp3', volume: 0.5 },
        { name: 'laserZap', file: 'laser-zap.mp3', volume: 1.0 }, // Maximaal volume voor laser zap
        { name: 'underwater', file: 'under-water.mp3', volume: 0.4, loop: true },
        { name: 'wind', file: 'wind.mp3', volume: 0.5, loop: true },
        { name: 'collectPuppy', file: 'tatatataa.mp3', volume: 1.0 },
        { name: 'puppyBark', file: 'puppy-bark.mp3', volume: 1.0 },
        { name: 'bubblePop', file: 'bubble-pop.mp3', volume: 1.0 },
        { name: 'lose-life', file: 'lose-life.mp3', volume: 0.8 },
        { name: 'gameOver', file: 'game-over.mp3', volume: 0.9 }
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
            loop: sound.loop,
            alternatives: sound.alternatives
        };
    });
    
    // Bijhouden van laadstatussen en mislukte geluiden
    let loadedSounds = 0;
    const totalSounds = soundsToLoad.length;
    const failedSounds = [];
    
    // Update de laadstatus in de UI
    function updateLoadingStatus() {
        const percentage = Math.floor((loadedSounds / totalSounds) * 100);
        loadingIndicator.textContent = `Geluiden laden... ${percentage}%`;
        
        // Toon mislukte geluiden in rood als er zijn
        if (failedSounds.length > 0) {
            loadingIndicator.innerHTML += `<br><span style="color: #ffcccc">Problemen met ${failedSounds.length} geluiden</span>`;
        }
    }
    
    // Verbeterde functie om geluid te laden met alternatieve bestanden
    const loadSoundWithAlternatives = (sound) => {
        // Maak een lijst van bestandsformaten en alternatieven om te proberen
        const audioFormats = ['.mp3', '.m4a', '.wav'];
        const alternatives = sound.alternatives || [];
        
        // Functie om een geluid te laden en alternatieven te proberen bij mislukking
        const tryLoadSoundWithFallbacks = async (primaryFile) => {
            try {
                // Probeer eerst het opgegeven bestand
                const filePath = soundsPath + primaryFile;
                console.log(`Poging om ${sound.name} te laden van: ${filePath}`);
                
                const name = await loadSound(sound.name, filePath);
                
                // Stel het standaardvolume in als dat is opgegeven
                if (sound.volume !== undefined && sounds[name]) {
                    sounds[name].volume = sound.volume;
                }
                
                // Bijwerken van laadstatus
                loadedSounds++;
                updateLoadingStatus();
                
                return name;
            } catch (err) {
                console.warn(`Kon geluid ${primaryFile} niet laden: ${err.message}`);
                
                // Probeer alternatieven als die er zijn
                if (alternatives && alternatives.length > 0) {
                    const altFile = alternatives.shift(); // Haal het eerste alternatief
                    console.log(`Probeer alternatief bestand voor ${sound.name}: ${altFile}`);
                    return tryLoadSoundWithFallbacks(altFile);
                }
                
                // Probeer verschillende formaten als er geen alternatieven meer zijn
                for (let i = 0; i < audioFormats.length; i++) {
                    const format = audioFormats[i];
                    // Sla over als het al een mp3/m4a/wav bestand was
                    if (primaryFile.endsWith(format)) continue;
                    
                    const formatFile = sound.name + format;
                    console.log(`Probeer ander formaat voor ${sound.name}: ${formatFile}`);
                    
                    try {
                        const filePath = soundsPath + formatFile;
                        const name = await loadSound(sound.name, filePath);
                        
                        // Stel het standaardvolume in als dat is opgegeven
                        if (sound.volume !== undefined && sounds[name]) {
                            sounds[name].volume = sound.volume;
                        }
                        
                        // Bijwerken van laadstatus
                        loadedSounds++;
                        updateLoadingStatus();
                        
                        return name;
                    } catch (formatErr) {
                        console.warn(`Kon geluid ${formatFile} niet laden: ${formatErr.message}`);
                    }
                }
                
                // Als alle pogingen zijn mislukt, voeg toe aan de failedSounds lijst
                failedSounds.push(sound.name);
                
                // Toch maar doorgaan om te zorgen dat de Promise.all niet vastloopt
                loadedSounds++;
                updateLoadingStatus();
                
                // Maak een lege audio als fallback zodat de game niet crasht
                sounds[sound.name] = new Audio();
                sounds[sound.name].volume = 0; // Stil, voor het geval dat
                
                return sound.name;
            }
        };
        
        // Begin met het primaire bestand
        const primaryFile = sound.file || (sound.name + '.mp3');
        return tryLoadSoundWithFallbacks(primaryFile);
    };
    
    // Start alle geluid laadpogingen parallel
    return Promise.all(soundsToLoad.map(sound => loadSoundWithAlternatives(sound)))
        .then(() => {
            // Alle geluiden zijn geladen (of mislukt maar we gaan door)
            console.log('Geluidlaadproces voltooid');
            
            if (failedSounds.length > 0) {
                loadingIndicator.textContent = `${failedSounds.length} geluid(en) niet geladen`;
                loadingIndicator.style.backgroundColor = "rgba(150,0,0,0.7)";
                console.warn('Niet-geladen geluiden:', failedSounds.join(', '));
            } else {
                loadingIndicator.textContent = 'Alle geluiden geladen!';
                loadingIndicator.style.backgroundColor = "rgba(0,100,0,0.7)";
            }
            
            setTimeout(() => {
                loadingIndicator.remove();
            }, 2000);
            
            // Controleer of het puppyCrying geluid correct is geladen, en zo niet, probeer een kopie te maken van puppy geluid
            if ((failedSounds.includes('puppyCrying') || !sounds['puppyCrying']) && sounds['puppy']) {
                console.log('Kopie maken van puppy geluid als vervanger voor puppyCrying');
                // Maak een kopie van het normale puppy geluid als het jankgeluid niet kon worden geladen
                sounds['puppyCrying'] = sounds['puppy'].cloneNode();
                sounds['puppyCrying'].volume = 0.9;
                
                // Verwijder uit faliedSounds als het er in zat
                const index = failedSounds.indexOf('puppyCrying');
                if (index > -1) {
                    failedSounds.splice(index, 1);
                }
            }
        })
        .catch(err => {
            console.error('Onverwachte fout bij laden van geluiden:', err);
            loadingIndicator.textContent = 'Probleem bij laden van geluiden';
            loadingIndicator.style.backgroundColor = "rgba(150,0,0,0.7)";
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
        audio.volume = musicVolume; // Gebruik opgeslagen volume
        
        // Update volume slider als die bestaat
        const volumeSlider = document.getElementById('music-volume');
        if (volumeSlider) {
            volumeSlider.value = audio.volume * 100;
            volumeSlider.style.display = musicEnabled ? 'block' : 'none';
        }
        
        // Controleer of de knop goed staat
        const musicButton = document.getElementById('music-toggle');
        if (musicButton) {
            musicButton.textContent = musicEnabled ? '🎶' : '🎵';
        }
        
        audio.addEventListener('canplaythrough', () => {
            console.log('Muziek succesvol geladen:', path);
            currentMusic = audio;
            
            if (musicEnabled) {
                // Controleer of er al gebruikersinteractie is geweest
                if (userInteractionOccurred) {
                    // Als er al interactie is geweest, speel de muziek meteen af
                    audio.play()
                        .then(() => console.log('Muziek afspelen gestart'))
                        .catch(err => console.error('Muziek afspelen mislukt:', err));
                } else {
                    // Als er nog geen interactie is geweest, sla de muziek op voor later
                    console.log('Muziek geladen maar uitgesteld tot gebruikersinteractie');
                    pendingMusicToPlay = audio;
                    
                    // Toon een hint voor gebruiker dat interactie nodig is voor muziek
                    showMusicInteractionHint();
                }
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

// Toon een hint over besturing (beweeg met WASD of pijltjes)
function showMusicInteractionHint() {
    // Controleer of de hint al bestaat
    if (document.getElementById('music-interaction-hint')) return;
    
    // Maak een hint-element
    const hintElement = document.createElement('div');
    hintElement.id = 'music-interaction-hint';
    hintElement.innerHTML = 'Beweeg met:<br>W,A,S,D (speler 1) of pijltjestoetsen (speler 2)';
    hintElement.style.position = 'fixed';
    hintElement.style.bottom = '50px';
    hintElement.style.left = '50%';
    hintElement.style.transform = 'translateX(-50%)';
    hintElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    hintElement.style.color = 'white';
    hintElement.style.padding = '8px 15px';
    hintElement.style.borderRadius = '20px';
    hintElement.style.fontSize = '14px';
    hintElement.style.zIndex = '1000';
    hintElement.style.animation = 'fadeInOut 2s infinite';
    hintElement.style.textAlign = 'center';
    
    // Voeg CSS-animatie toe
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
        }
    `;
    document.head.appendChild(styleElement);
    
    // Voeg hint toe aan de pagina
    document.body.appendChild(hintElement);
    
    // Verwijder de hint na 10 seconden
    setTimeout(() => {
        if (hintElement.parentNode) {
            hintElement.parentNode.removeChild(hintElement);
        }
    }, 10000);
}

// Toggle muziek aan/uit
function toggleMusic() {
    musicEnabled = !musicEnabled;
    
    // Opslaan in localStorage
    try {
        localStorage.setItem('musicEnabled', musicEnabled.toString());
    } catch (e) {
        console.warn('Kon muziek status niet opslaan in localStorage:', e);
    }
    
    if (currentMusic) {
        if (musicEnabled) {
            // Alleen afspelen als er gebruikersinteractie is geweest
            if (userInteractionOccurred) {
                currentMusic.play().catch(err => console.log('Muziek hervatten mislukt:', err));
            } else {
                // Anders bewaren we het voor later
                pendingMusicToPlay = currentMusic;
                showMusicInteractionHint();
            }
        } else {
            currentMusic.pause();
            // Als er muziek in de wachtrij stond, wissen we die ook
            if (pendingMusicToPlay === currentMusic) {
                pendingMusicToPlay = null;
            }
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
    musicButton.textContent = musicEnabled ? '🎶' : '🎵'; // Gebruik juiste icoon op basis van opgeslagen status
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
    volumeSlider.value = Math.round(musicVolume * 100).toString(); // Gebruik opgeslagen volume uit localStorage
    volumeSlider.style.width = '40px';
    volumeSlider.style.marginTop = '5px';
    volumeSlider.style.accentColor = '#45882f'; // Groene kleur die bij de UI past
    volumeSlider.style.display = musicEnabled ? 'block' : 'none'; // Toon alleen als muziek aan staat
    
    // Voeg elementen toe aan container
    musicControlContainer.appendChild(musicButton);
    musicControlContainer.appendChild(volumeSlider);
    
    // Music button event listener - deze triggert ook gebruikersinteractie
    musicButton.addEventListener('click', () => {
        // Markeer dat gebruikersinteractie heeft plaatsgevonden
        userInteractionOccurred = true;
        
        // Verwijder eventuele hint
        const hint = document.getElementById('music-interaction-hint');
        if (hint && hint.parentNode) {
            hint.parentNode.removeChild(hint);
        }
        
        // Muziek aan/uit zetten
        const musicEnabled = toggleMusic();
        musicButton.textContent = musicEnabled ? '🎶' : '🎵'; // Gebruik 🎵 voor muziek uit
        volumeSlider.style.display = musicEnabled ? 'block' : 'none';
        
        // Als we muziek willen afspelen maar het nog niet hebben kunnen starten
        // en we hebben nu gebruikersinteractie, speel dan alsnog af
        if (musicEnabled && pendingMusicToPlay && pendingMusicToPlay === currentMusic) {
            pendingMusicToPlay.play()
                .then(() => console.log('Muziek afspelen gestart na gebruikersinteractie'))
                .catch(err => console.error('Muziek afspelen mislukt na gebruikersinteractie:', err));
            pendingMusicToPlay = null;
        }
    });
    
    // Volume slider event listener
    volumeSlider.addEventListener('input', () => {
        // Update the volume variable
        musicVolume = volumeSlider.value / 100;
        
        // Update current music if playing
        if (currentMusic) {
            currentMusic.volume = musicVolume;
        }
        
        // Save to localStorage
        try {
            localStorage.setItem('musicVolume', musicVolume.toString());
            console.log('Muziekvolume opgeslagen in localStorage:', musicVolume);
        } catch (e) {
            console.warn('Kon muziekvolume niet opslaan in localStorage:', e);
        }
    });
    
    // Voeg container toe aan de body
    document.body.appendChild(musicControlContainer);
    
    // Pas positie van fullscreen knop aan (indien die bestaat)
    const fullscreenButton = document.getElementById('fullscreen-button');
    if (fullscreenButton) {
        fullscreenButton.style.left = '110px'; // Naast de muziek controls
    }
    
    // Voeg een globale event listener toe om gebruikersinteractie te detecteren
    setupUserInteractionDetection();
}

// Functie om gebruikersinteractie te detecteren en muziek te starten indien nodig
function setupUserInteractionDetection() {
    // Als al gedetecteerd, doe niets
    if (userInteractionOccurred) return;
    
    // Lijst van events die worden beschouwd als gebruikersinteractie
    const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
    
    // Functie die wordt uitgevoerd bij gebruikersinteractie
    const handleUserInteraction = () => {
        // Voorkom herhaalde uitvoering
        if (userInteractionOccurred) return;
        
        console.log('Gebruikersinteractie gedetecteerd, audio kan nu worden afgespeeld');
        userInteractionOccurred = true;
        
        // Verwijder alle event listeners
        interactionEvents.forEach(eventType => {
            document.removeEventListener(eventType, handleUserInteraction);
        });
        
        // Verwijder eventuele hint
        const hint = document.getElementById('music-interaction-hint');
        if (hint && hint.parentNode) {
            hint.parentNode.removeChild(hint);
        }
        
        // Als er muziek klaarstaat om af te spelen, speel deze af
        if (musicEnabled && pendingMusicToPlay) {
            console.log('Start muziek die in wachtrij stond');
            pendingMusicToPlay.play()
                .then(() => console.log('Muziek afspelen gestart na gebruikersinteractie'))
                .catch(err => console.error('Muziek afspelen mislukt na gebruikersinteractie:', err));
            pendingMusicToPlay = null;
        }
    };
    
    // Voeg event listeners toe
    interactionEvents.forEach(eventType => {
        document.addEventListener(eventType, handleUserInteraction, { once: false });
    });
    
    console.log('Event listeners voor gebruikersinteractie toegevoegd');
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
                
                // Controleer of het level een muziekbestand heeft dat beschikbaar is
                if (level.music && data.music_files.includes(level.music)) {
                    console.log(`Laden van muziek voor level ${levelIndex + 1}: ${level.music}`);
                    loadMusic(`music/${level.music}`).catch(err => {
                        console.error(`Kon muziek voor level niet laden: ${err}`);
                        fallbackToDefaultMusic(data.music_files, err);
                    });
                } else {
                    // Anders kies een standaard muziekbestand uit de beschikbare bestanden
                    console.log('Geen specifieke muziek voor dit level, gebruik standaard muziek');
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
