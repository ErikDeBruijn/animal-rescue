// game-simple-mp.js
// Vereenvoudigde multiplayer implementatie met minimale complexiteit
// Deze implementatie vervangt de complexe game-multiplayer.js met een veel eenvoudiger versie

// Globale simpele multiplayer controller
const simpleMultiplayer = {
    // Verbinding informatie
    socket: null,
    clientId: null,
    username: null,
    roomId: null,
    isHost: false,
    
    // UI elementen (minimaal gehouden)
    ui: {
        lobbyContainer: null,
        usernameInput: null,
        createRoomBtn: null,
        joinRoomInput: null,
        joinRoomBtn: null,
        statusMsg: null,
        readyBtn: null,
        mpToggleBtn: null
    },
    
    // Initialisatie functie
    init: function() {
        console.log("Initialiseren van versimpelde multiplayer systeem");
        
        // Probeer gebruikersnaam uit localStorage te laden
        try {
            const savedUsername = localStorage.getItem('animalRescue_username');
            if (savedUsername) {
                this.username = savedUsername;
                console.log("Gebruikersnaam geladen uit localStorage:", this.username);
            } else {
                // Standaard gebruikersnaam
                this.username = "Speler_" + Math.floor(Math.random() * 1000);
            }
        } catch (e) {
            console.warn("Kon gebruikersvoorkeuren niet laden:", e);
            this.username = "Speler_" + Math.floor(Math.random() * 1000);
        }
        
        // Maak verbinding met de server
        this.connectToServer();
        
        // Maak simpele UI
        this.createUI();
    },
    
    // Maak verbinding met de server
    connectToServer: function() {
        // Maak verbinding met de server
        this.socket = io.connect();
        
        // Eventhandlers instellen
        this.setupSocketListeners();
        
        console.log("Verbinding maken met server");
    },
    
    // Eventhandlers voor socket.io
    setupSocketListeners: function() {
        // Verbinding gemaakt
        this.socket.on('welcome', (data) => {
            console.log("Verbonden met server, client ID:", data.client_id);
            this.clientId = data.client_id;
            
            // Update beschikbare kamers lijst als die worden meegestuurd
            if (data.active_rooms) {
                this.updateRoomsList(data.active_rooms);
            }
            
            this.updateStatusMessage("Verbonden met server. Maak een kamer aan of join een kamer.");
        });
        
        // Foutmeldingen
        this.socket.on('error', (data) => {
            console.error("Server fout:", data.message);
            alert("Fout: " + data.message);
        });
        
        // Lijst van beschikbare kamers ontvangen
        this.socket.on('room_list', (data) => {
            console.log("Kamerlijst ontvangen:", data.active_rooms);
            this.updateRoomsList(data.active_rooms);
        });
        
        // Update in de lijst van kamers
        this.socket.on('room_list_update', (data) => {
            console.log("Kamerlijst update ontvangen");
            this.updateRoomsList(data.active_rooms);
        });
        
        // Kamer aangemaakt
        this.socket.on('room_created', (data) => {
            console.log("Kamer aangemaakt:", data.room_id);
            this.roomId = data.room_id;
            this.isHost = true;
            
            // Toon een bericht met de kamer-ID die anderen kunnen gebruiken om te joinen
            this.updateStatusMessage(`Kamer aangemaakt! Je bent de HOST. Je kamer ID is: ${data.room_id}. Deel dit met je vriend om samen te spelen!`);
            
            // Maak de kamer-ID duidelijk zichtbaar
            this.showRoomIdBanner(data.room_id);
            
            // Toon de klaar-knop
            if (this.ui.readyBtn) {
                this.ui.readyBtn.style.display = 'block';
            }
        });
        
        // Bij een kamer aangesloten
        this.socket.on('room_joined', (data) => {
            console.log("Aangesloten bij kamer:", data.room_id);
            this.roomId = data.room_id;
            this.isHost = data.player_info.host;
            
            // Update status message met duidelijke rol
            this.updateStatusMessage(this.isHost ? 
                `Aangesloten bij kamer ${data.room_id}. Je bent de HOST (Speler 1).` : 
                `Aangesloten bij kamer ${data.room_id}. Je bent de CLIENT (Speler 2).`);
            
            // Toon de klaar-knop
            if (this.ui.readyBtn) {
                this.ui.readyBtn.style.display = 'block';
            }
        });
        
        // Nieuwe speler toegetreden tot de kamer
        this.socket.on('player_joined', (data) => {
            console.log("Nieuwe speler in kamer:", data.player.username);
            
            // Maak een tijdelijke banner met de melding
            this.showNotificationBanner(`Speler ${data.player.username} is bij het spel gekomen!`, 5000);
            
            // Update de status message
            this.updateStatusMessage(`Speler ${data.player.username} is bij het spel gekomen! Druk op "Klaar om te spelen" als je wilt beginnen.`);
            
            // Speel een geluid af als dat beschikbaar is
            if (window.Audio) {
                try {
                    const joinSound = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==");
                    joinSound.play();
                } catch (e) {
                    console.log("Kon geen geluid afspelen");
                }
            }
        });
        
        // Speler status update (ready/not ready)
        this.socket.on('player_status_update', (data) => {
            console.log("Speler status update:", data.player_id, data.ready);
            
            // Toon een notificatie als iemand klaar is
            if (data.ready) {
                // Vind de gebruikersnaam van de speler
                let playerName = "Een andere speler";
                
                // Als de server de gebruikersnaam meegeeft, gebruik die
                if (data.username) {
                    playerName = data.username;
                }
                
                // Toon een notificatie
                this.showNotificationBanner(`${playerName} is klaar om te spelen!`);
            }
        });
        
        // Speler heeft de kamer verlaten
        this.socket.on('player_left', (data) => {
            const playerName = data.username || "Een speler";
            console.log(`Speler verlaten: ${playerName}`);
            
            // Toon een notificatie
            this.showNotificationBanner(`${playerName} heeft het spel verlaten`, 5000);
            
            // Update de status message
            this.updateStatusMessage(`${playerName} heeft het spel verlaten. Wachten op een nieuwe speler...`);
        });
        
        // Alle spelers zijn klaar, spel start
        this.socket.on('game_starting', (data) => {
            console.log("Spel start over", data.countdown, "seconden");
            this.updateStatusMessage(`Spel start over ${data.countdown} seconden...`);
            
            // Start het spel na het aftellen
            setTimeout(() => {
                this.startGame();
            }, data.countdown * 1000);
        });
        
        // Ontvang player input updates
        this.socket.on('remote_player_input', (data) => {
            if (!this.isHost) return; // Alleen de host verwerkt remote inputs
            
            const playerKeys = data.keys;
            
            // Direct toepassen op de inputs voor player2
            if (window.gameControls && window.gameControls.forceSetInputState) {
                console.log("Host ontving input van client:", playerKeys);
                
                // BELANGRIJK: Als host, direct de inputs uit de client kopieren
                // naar de lokale inputstate
                window.gameControls.forceSetInputState(playerKeys);
            }
        });
        
        // Speler positie updates
        this.socket.on('player_update', (data) => {
            // Als we de host zijn, negeren we positie-updates
            if (this.isHost) return;
            
            // Client krijgt updates van player1 positie
            if (data.player_index === 0 && window.player1) {
                // Update positie van host-speler
                player1.x = data.position.x;
                player1.y = data.position.y;
                player1.velX = data.velocity.x;
                player1.velY = data.velocity.y;
            }
        });
        
        // Game state update
        this.socket.on('game_state_update', (data) => {
            // Update gamestate voor client
            if (!this.isHost && window.gameCore) {
                if ('current_level' in data) {
                    console.log("Level update ontvangen:", data.current_level);
                    window.gameCore.currentLevel = data.current_level;
                }
                
                if ('puppy_saved' in data) {
                    window.gameCore.gameState.puppySaved = data.puppy_saved;
                }
                
                if ('game_over' in data) {
                    window.gameCore.gameState.gameOver = data.game_over;
                }
                
                if ('level_completed' in data) {
                    window.gameCore.levelCompleted = data.level_completed;
                }
            }
        });
    },
    
    // Maak een simpele UI voor de multiplayer interface
    createUI: function() {
        // Hoofdcontainer voor de lobby
        this.ui.lobbyContainer = document.createElement('div');
        this.ui.lobbyContainer.id = 'simple-mp-container';
        this.ui.lobbyContainer.style.position = 'fixed';
        this.ui.lobbyContainer.style.top = '50%';
        this.ui.lobbyContainer.style.left = '50%';
        this.ui.lobbyContainer.style.transform = 'translate(-50%, -50%)';
        this.ui.lobbyContainer.style.backgroundColor = 'white';
        this.ui.lobbyContainer.style.padding = '20px';
        this.ui.lobbyContainer.style.borderRadius = '10px';
        this.ui.lobbyContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        this.ui.lobbyContainer.style.zIndex = '1000';
        this.ui.lobbyContainer.style.width = '450px';
        this.ui.lobbyContainer.style.maxHeight = '80vh';
        this.ui.lobbyContainer.style.overflowY = 'auto';
        this.ui.lobbyContainer.style.display = 'none'; // Standaard verborgen
        
        // Titel
        const title = document.createElement('h2');
        title.textContent = 'Dieren Redders - Multiplayer';
        title.style.textAlign = 'center';
        title.style.color = '#45882f';
        this.ui.lobbyContainer.appendChild(title);
        
        // Gebruikersnaam invoer
        const usernameLabel = document.createElement('label');
        usernameLabel.textContent = 'Je naam:';
        usernameLabel.style.display = 'block';
        usernameLabel.style.marginTop = '15px';
        this.ui.lobbyContainer.appendChild(usernameLabel);
        
        this.ui.usernameInput = document.createElement('input');
        this.ui.usernameInput.type = 'text';
        this.ui.usernameInput.value = this.username;
        this.ui.usernameInput.style.width = '100%';
        this.ui.usernameInput.style.marginBottom = '15px';
        this.ui.usernameInput.style.padding = '5px';
        this.ui.lobbyContainer.appendChild(this.ui.usernameInput);
        
        // Update gebruikersnaam bij wijziging
        this.ui.usernameInput.addEventListener('change', () => {
            this.username = this.ui.usernameInput.value;
            try {
                localStorage.setItem('animalRescue_username', this.username);
            } catch (e) {
                console.warn("Kon gebruikersnaam niet opslaan:", e);
            }
        });
        
        // Maak kamer knop
        this.ui.createRoomBtn = document.createElement('button');
        this.ui.createRoomBtn.textContent = 'Nieuwe Kamer Maken';
        this.ui.createRoomBtn.style.width = '100%';
        this.ui.createRoomBtn.style.padding = '10px';
        this.ui.createRoomBtn.style.marginBottom = '10px';
        this.ui.createRoomBtn.style.backgroundColor = '#45882f';
        this.ui.createRoomBtn.style.color = 'white';
        this.ui.createRoomBtn.style.border = 'none';
        this.ui.createRoomBtn.style.borderRadius = '5px';
        this.ui.createRoomBtn.style.cursor = 'pointer';
        this.ui.createRoomBtn.onclick = () => this.createRoom();
        this.ui.lobbyContainer.appendChild(this.ui.createRoomBtn);
        
        // Divider
        const divider = document.createElement('div');
        divider.style.margin = '20px 0';
        divider.style.borderBottom = '1px solid #ccc';
        this.ui.lobbyContainer.appendChild(divider);
        
        // Actieve kamers sectie
        const roomsTitle = document.createElement('h3');
        roomsTitle.textContent = 'Actieve Kamers:';
        roomsTitle.style.marginBottom = '10px';
        this.ui.lobbyContainer.appendChild(roomsTitle);
        
        // Container voor de lijst met kamers
        this.ui.roomsListContainer = document.createElement('div');
        this.ui.roomsListContainer.style.border = '1px solid #ccc';
        this.ui.roomsListContainer.style.borderRadius = '5px';
        this.ui.roomsListContainer.style.padding = '10px';
        this.ui.roomsListContainer.style.marginBottom = '20px';
        this.ui.roomsListContainer.style.maxHeight = '150px';
        this.ui.roomsListContainer.style.overflowY = 'auto';
        this.ui.roomsListContainer.style.backgroundColor = '#f9f9f9';
        this.ui.roomsListContainer.innerHTML = '<p>Zoeken naar actieve kamers...</p>';
        this.ui.lobbyContainer.appendChild(this.ui.roomsListContainer);
        
        // Ververs knop
        const refreshRoomsBtn = document.createElement('button');
        refreshRoomsBtn.textContent = 'Vernieuwen';
        refreshRoomsBtn.style.width = '100%';
        refreshRoomsBtn.style.padding = '8px';
        refreshRoomsBtn.style.marginBottom = '20px';
        refreshRoomsBtn.style.backgroundColor = '#0099cc';
        refreshRoomsBtn.style.color = 'white';
        refreshRoomsBtn.style.border = 'none';
        refreshRoomsBtn.style.borderRadius = '5px';
        refreshRoomsBtn.style.cursor = 'pointer';
        refreshRoomsBtn.onclick = () => this.refreshRooms();
        this.ui.lobbyContainer.appendChild(refreshRoomsBtn);
        
        // Nog een divider
        const divider2 = document.createElement('div');
        divider2.style.margin = '20px 0';
        divider2.style.borderBottom = '1px solid #ccc';
        this.ui.lobbyContainer.appendChild(divider2);
        
        // Join kamer sectie
        const joinLabel = document.createElement('label');
        joinLabel.textContent = 'OF voer direct een kamer ID in:';
        joinLabel.style.display = 'block';
        this.ui.lobbyContainer.appendChild(joinLabel);
        
        const joinContainer = document.createElement('div');
        joinContainer.style.display = 'flex';
        joinContainer.style.marginBottom = '20px';
        
        this.ui.joinRoomInput = document.createElement('input');
        this.ui.joinRoomInput.type = 'text';
        this.ui.joinRoomInput.placeholder = 'Kamer ID';
        this.ui.joinRoomInput.style.flex = '1';
        this.ui.joinRoomInput.style.padding = '5px';
        this.ui.joinRoomInput.style.marginRight = '10px';
        joinContainer.appendChild(this.ui.joinRoomInput);
        
        this.ui.joinRoomBtn = document.createElement('button');
        this.ui.joinRoomBtn.textContent = 'Join';
        this.ui.joinRoomBtn.style.padding = '5px 15px';
        this.ui.joinRoomBtn.style.backgroundColor = '#45882f';
        this.ui.joinRoomBtn.style.color = 'white';
        this.ui.joinRoomBtn.style.border = 'none';
        this.ui.joinRoomBtn.style.borderRadius = '5px';
        this.ui.joinRoomBtn.style.cursor = 'pointer';
        this.ui.joinRoomBtn.onclick = () => this.joinRoom();
        joinContainer.appendChild(this.ui.joinRoomBtn);
        
        this.ui.lobbyContainer.appendChild(joinContainer);
        
        // Status message
        this.ui.statusMsg = document.createElement('div');
        this.ui.statusMsg.style.padding = '10px';
        this.ui.statusMsg.style.backgroundColor = '#f8f8f8';
        this.ui.statusMsg.style.borderRadius = '5px';
        this.ui.statusMsg.style.marginBottom = '20px';
        this.ui.statusMsg.style.minHeight = '50px';
        this.ui.statusMsg.textContent = 'Verbinden met server...';
        this.ui.lobbyContainer.appendChild(this.ui.statusMsg);
        
        // Klaar knop (verborgen tot je in een kamer zit)
        this.ui.readyBtn = document.createElement('button');
        this.ui.readyBtn.textContent = 'Klaar om te spelen!';
        this.ui.readyBtn.style.width = '100%';
        this.ui.readyBtn.style.padding = '10px';
        this.ui.readyBtn.style.backgroundColor = '#ff9900';
        this.ui.readyBtn.style.color = 'white';
        this.ui.readyBtn.style.border = 'none';
        this.ui.readyBtn.style.borderRadius = '5px';
        this.ui.readyBtn.style.cursor = 'pointer';
        this.ui.readyBtn.style.display = 'none';
        this.ui.readyBtn.onclick = () => this.setPlayerReady();
        this.ui.lobbyContainer.appendChild(this.ui.readyBtn);
        
        // Voeg de lobby container toe aan de pagina
        document.body.appendChild(this.ui.lobbyContainer);
        
        // Multiplayer knop in de game
        this.ui.mpToggleBtn = document.createElement('button');
        this.ui.mpToggleBtn.textContent = 'Multiplayer';
        this.ui.mpToggleBtn.style.position = 'fixed';
        this.ui.mpToggleBtn.style.top = '10px';
        this.ui.mpToggleBtn.style.left = '10px';
        this.ui.mpToggleBtn.style.padding = '10px';
        this.ui.mpToggleBtn.style.backgroundColor = '#45882f';
        this.ui.mpToggleBtn.style.color = 'white';
        this.ui.mpToggleBtn.style.border = 'none';
        this.ui.mpToggleBtn.style.borderRadius = '5px';
        this.ui.mpToggleBtn.style.cursor = 'pointer';
        this.ui.mpToggleBtn.style.zIndex = '10';
        this.ui.mpToggleBtn.onclick = () => this.toggleLobby();
        document.body.appendChild(this.ui.mpToggleBtn);
    },
    
    // Toggle lobby weergave
    toggleLobby: function() {
        if (this.ui.lobbyContainer.style.display === 'none') {
            this.ui.lobbyContainer.style.display = 'block';
            if (window.gameCore) {
                gameCore.gameState.running = false; // Pauzeer het spel
            }
        } else {
            this.ui.lobbyContainer.style.display = 'none';
            if (window.gameCore && this.roomId) {
                gameCore.gameState.running = true; // Hervat het spel
            }
        }
    },
    
    // Update status message
    updateStatusMessage: function(message) {
        if (this.ui.statusMsg) {
            this.ui.statusMsg.textContent = message;
        }
    },
    
    // Maak een nieuwe kamer
    createRoom: function() {
        if (!this.socket) {
            this.updateStatusMessage("Niet verbonden met server!");
            return;
        }
        
        this.username = this.ui.usernameInput.value.trim();
        if (!this.username) {
            this.updateStatusMessage("Voer eerst een gebruikersnaam in!");
            return;
        }
        
        // Haal het huidige level op
        const level = window.gameCore ? gameCore.currentLevel || 0 : 0;
        
        // Stuur een verzoek om een kamer aan te maken
        this.socket.emit('create_room', {
            username: this.username,
            level: level,
            max_players: 2,
            is_public: true
        });
        
        this.updateStatusMessage("Kamer aanmaken...");
    },
    
    // Join een bestaande kamer
    joinRoom: function(roomId) {
        if (!this.socket) {
            this.updateStatusMessage("Niet verbonden met server!");
            return;
        }
        
        this.username = this.ui.usernameInput.value.trim();
        if (!this.username) {
            this.updateStatusMessage("Voer eerst een gebruikersnaam in!");
            return;
        }
        
        // Als geen roomId is meegegeven als parameter, gebruik de input veld waarde
        if (!roomId) {
            roomId = this.ui.joinRoomInput.value.trim();
            if (!roomId) {
                this.updateStatusMessage("Voer een kamer ID in of kies een kamer uit de lijst!");
                return;
            }
        }
        
        // Sla gebruikersnaam op in localStorage
        try {
            localStorage.setItem('animalRescue_username', this.username);
        } catch (e) {
            console.warn("Kon gebruikersnaam niet opslaan:", e);
        }
        
        // Stuur een verzoek om bij een kamer aan te sluiten
        this.socket.emit('join_room', {
            room_id: roomId,
            username: this.username
        });
        
        this.updateStatusMessage(`Aansluiten bij kamer ${roomId}...`);
    },
    
    // Zet speler op klaar
    setPlayerReady: function() {
        if (!this.socket || !this.roomId) {
            this.updateStatusMessage("Niet in een kamer!");
            return;
        }
        
        // Stuur een verzoek om je status aan te passen
        this.socket.emit('player_ready', {
            ready: true
        });
        
        this.ui.readyBtn.textContent = "Wachten op andere speler...";
        this.ui.readyBtn.style.backgroundColor = '#999';
        this.ui.readyBtn.disabled = true;
        
        this.updateStatusMessage("Klaar om te spelen! Wachten op andere speler...");
    },
    
    // Start het spel
    startGame: function() {
        console.log("Multiplayer game start!");
        
        // Verberg de lobby
        this.ui.lobbyContainer.style.display = 'none';
        
        // Reset spelers naar de juiste posities
        if (window.player1 && window.player2 && window.levels && window.gameCore) {
            // Reset naar startposities
            const currentLevelData = window.levels[gameCore.currentLevel];
            
            if (currentLevelData && currentLevelData.startPositions) {
                console.log("RESET spelers naar startposities");
                
                player1.x = currentLevelData.startPositions[0].x;
                player1.y = currentLevelData.startPositions[0].y;
                player1.velX = 0;
                player1.velY = 0;
                
                player2.x = currentLevelData.startPositions[1].x;
                player2.y = currentLevelData.startPositions[1].y;
                player2.velX = 0;
                player2.velY = 0;
                
                player1.animalType = "SQUIRREL";
                player1.updateAnimalProperties();
                
                player2.animalType = "TURTLE";
                player2.updateAnimalProperties();
            }
        }
        
        // Start het spel
        if (window.gameCore) {
            gameCore.gameState.running = true;
        }
        
        // Start het verzenden van updates en input
        this.startNetworkUpdates();
    },
    
    // Start het verzenden van updates en input
    startNetworkUpdates: function() {
        if (this.isHost) {
            // HOST: stuur regelmatig positie-updates
            this.updateInterval = setInterval(() => {
                if (window.player1) {
                    // Stuur de positie, snelheid en animal type van player1 naar de client
                    this.sendPositionUpdate(player1);
                    
                    // Stuur ook de gamestate
                    this.updateGameState();
                }
            }, 50); // 20 updates per seconde
        } else {
            // CLIENT: stuur regelmatig input-updates
            this.inputInterval = setInterval(() => {
                if (window.player2 && window.gameControls) {
                    // Stuur de input van player2 naar de host
                    this.sendPlayerInput(player2, gameControls.keys);
                }
            }, 33); // 30 updates per seconde
        }
    },
    
    // Stuur positie-update (alleen host)
    sendPositionUpdate: function(player) {
        if (!this.socket || !this.roomId || !this.isHost) return;
        
        // Stuur informatie over de positie en snelheid van de eigen speler
        this.socket.emit('update_player', {
            player_index: 0, // Player 1 (host)
            position: { x: player.x, y: player.y },
            velocity: { x: player.velX, y: player.velY },
            animal_type: player.animalType
        });
    },
    
    // Stuur input (alleen client)
    sendPlayerInput: function(player, keys) {
        if (!this.socket || !this.roomId || this.isHost) return;
        
        // Controleer of we direct de pijltjestoetsen kunnen uitlezen
        const leftInput = keys['ArrowLeft'] === true;
        const rightInput = keys['ArrowRight'] === true;
        const upInput = keys['ArrowUp'] === true;
        const downInput = keys['ArrowDown'] === true;
        const switchInput = keys['Shift'] === true || keys['ShiftLeft'] === true || keys['ShiftRight'] === true;
        
        // Maak een simpel inputobject
        const inputData = {
            player_id: this.clientId,
            player_index: 1, // Player 2 (client)
            keys: {
                left: leftInput,
                right: rightInput,
                up: upInput,
                down: downInput,
                switch: switchInput
            }
        };
        
        // Stuur naar de server
        this.socket.emit('player_input', inputData);
    },
    
    // Update de game state (alleen host)
    updateGameState: function() {
        if (!this.socket || !this.roomId || !this.isHost || !window.gameCore) return;
        
        // Minimale gamestate, alleen kritieke informatie
        const gameStateUpdate = {
            current_level: gameCore.currentLevel,
            puppy_saved: gameCore.gameState.puppySaved,
            game_over: gameCore.gameState.gameOver,
            level_completed: gameCore.levelCompleted
        };
        
        // Stuur naar de server
        this.socket.emit('update_game_state', gameStateUpdate);
    },
    
    // Update de lijst met beschikbare kamers
    updateRoomsList: function(rooms) {
        if (!this.ui.roomsListContainer) return;
        
        // Als er geen kamers zijn, toon een bericht
        if (!rooms || Object.keys(rooms).length === 0) {
            this.ui.roomsListContainer.innerHTML = '<p>Geen actieve kamers gevonden. Maak een nieuwe kamer!</p>';
            return;
        }
        
        // Maak een lijst met kamers
        let html = '<ul style="list-style-type: none; padding: 0; margin: 0;">';
        
        for (const roomId in rooms) {
            const room = rooms[roomId];
            // Alleen tonen als de kamer niet al vol is (max spelers bereikt)
            if (room.player_count < room.max_players) {
                html += `
                    <li style="padding: 10px; margin-bottom: 8px; background-color: white; border-radius: 5px; border: 1px solid #ddd;">
                        <div style="margin-bottom: 8px;">
                            <strong style="color: #45882f;">Kamer: ${room.name || roomId}</strong>
                            <br>
                            <small>Level ${room.level + 1} - ${room.player_count}/${room.max_players} spelers</small>
                        </div>
                        <button 
                            onclick="simpleMultiplayer.joinRoom('${roomId}')"
                            style="background-color: #45882f; color: white; border: none; border-radius: 3px; padding: 5px 10px; cursor: pointer; width: 100%;">
                            Deelnemen
                        </button>
                    </li>
                `;
            }
        }
        
        html += '</ul>';
        this.ui.roomsListContainer.innerHTML = html;
    },
    
    // Ververs de lijst met kamers
    refreshRooms: function() {
        if (!this.socket) return;
        
        this.ui.roomsListContainer.innerHTML = '<p>Kamers ophalen...</p>';
        this.socket.emit('get_rooms');
    },
    
    // Toon een melding of banner
    showNotificationBanner: function(message, duration = 3000) {
        // Maak een banner element
        const banner = document.createElement('div');
        banner.textContent = message;
        banner.style.position = 'fixed';
        banner.style.top = '50px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.backgroundColor = '#45882f';
        banner.style.color = 'white';
        banner.style.padding = '10px 20px';
        banner.style.borderRadius = '5px';
        banner.style.zIndex = '2000';
        banner.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        banner.style.fontWeight = 'bold';
        
        // Voeg toe aan de pagina
        document.body.appendChild(banner);
        
        // Verwijder na een bepaalde tijd
        setTimeout(() => {
            document.body.removeChild(banner);
        }, duration);
    },
    
    // Toon een banner met de kamer ID
    showRoomIdBanner: function(roomId) {
        // Maak een banner met de kamer ID
        const banner = document.createElement('div');
        banner.innerHTML = `
            <div style="margin-bottom: 8px; font-weight: bold;">Je kamer ID is:</div>
            <div style="font-size: 24px; background-color: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 10px;">${roomId}</div>
            <div style="font-size: 12px;">Deel deze code met je vriend om samen te spelen</div>
        `;
        banner.style.position = 'fixed';
        banner.style.top = '60px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.backgroundColor = 'white';
        banner.style.color = 'black';
        banner.style.padding = '15px 25px';
        banner.style.borderRadius = '5px';
        banner.style.zIndex = '2000';
        banner.style.boxShadow = '0 2px 15px rgba(0,0,0,0.3)';
        banner.style.textAlign = 'center';
        
        // Voeg een sluit knop toe
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '5px';
        closeBtn.style.right = '5px';
        closeBtn.style.border = 'none';
        closeBtn.style.background = 'none';
        closeBtn.style.fontSize = '20px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => document.body.removeChild(banner);
        banner.appendChild(closeBtn);
        
        // Voeg toe aan de pagina
        document.body.appendChild(banner);
        
        // Schakel de banner uit na 20 seconden
        setTimeout(() => {
            try {
                document.body.removeChild(banner);
            } catch (e) {
                // Banner al verwijderd
            }
        }, 20000);
    }
};

// Exporteer de multiplayer controller
window.simpleMultiplayer = simpleMultiplayer;

// Functie om de versimpelde multiplayer te initialiseren
function initSimpleMultiplayer() {
    // Controleer of de socket.io client script geladen is
    if (typeof io !== 'undefined') {
        console.log("Socket.io client is beschikbaar, start versimpelde multiplayer");
        // Initialiseer de multiplayer modus
        simpleMultiplayer.init();
    } else {
        console.error("Socket.io client niet geladen");
        alert("Er is een fout opgetreden bij het laden van multiplayer ondersteuning. Probeer de pagina te verversen.");
    }
}

// Exporteer de initializer
window.initSimpleMultiplayer = initSimpleMultiplayer;