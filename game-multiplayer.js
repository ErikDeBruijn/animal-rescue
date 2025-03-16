// game-multiplayer.js
// Bevat alle functionaliteit voor multiplayer ondersteuning

// Multiplayer systeem
const gameMultiplayer = {
    // Socket.io verbinding
    socket: null,
    
    // Client en sessie informatie
    clientId: null,
    username: null,
    roomId: null,
    isHost: false,
    
    // Andere spelers in het spel
    otherPlayers: {},
    
    // UI elementen voor multiplayer
    ui: {
        // Containers
        lobbyContainer: null,
        roomListContainer: null,
        chatContainer: null,
        
        // Knoppen
        createRoomBtn: null,
        joinRoomBtn: null,
        leaveRoomBtn: null,
        readyBtn: null,
        
        // Invoervelden
        usernameInput: null,
        chatInput: null,
        
        // Weergave elementen
        playersList: null,
        roomInfoDisplay: null,
        chatMessages: null
    },
    
    // Initialisatie van de multiplayer mode
    init: function() {
        console.log("Initialiseren van multiplayer systeem");
        
        // Verbind met de server
        this.connectToServer();
        
        // Maak en toon de multiplayer UI
        this.createMultiplayerUI();
        
        // Luister naar toetsenbord events voor chat
        document.addEventListener('keydown', (e) => {
            // T toets om chat te openen
            if (e.key === 't' && this.roomId) {
                this.ui.chatInput.focus();
            }
            
            // Enter toets om klaar te zijn in de lobby
            if (e.key === 'Enter' && this.roomId && !gameCore.gameState.running) {
                this.setPlayerReady(true);
            }
        });
    },
    
    // Verbind met de server
    connectToServer: function() {
        // Haal de server URL op, gebruik het huidige domein als standaard
        const serverUrl = window.location.hostname;
        
        // Maak verbinding met de server
        this.socket = io.connect();
        
        // Luister naar server events
        this.setupSocketListeners();
        
        console.log("Verbinding maken met server:", serverUrl);
    },
    
    // Luisteraars instellen voor socket.io events
    setupSocketListeners: function() {
        // Verbinding gemaakt
        this.socket.on('welcome', (data) => {
            console.log("Verbonden met server, client ID:", data.client_id);
            this.clientId = data.client_id;
            
            // Update beschikbare kamers lijst
            if (data.active_rooms) {
                this.updateRoomsList(data.active_rooms);
            }
        });
        
        // Foutmeldingen
        this.socket.on('error', (data) => {
            console.error("Server fout:", data.message);
            alert("Fout: " + data.message);
        });
        
        // Lijst van beschikbare kamers ontvangen
        this.socket.on('room_list', (data) => {
            this.updateRoomsList(data.active_rooms);
        });
        
        // Update in de lijst van kamers
        this.socket.on('room_list_update', (data) => {
            this.updateRoomsList(data.active_rooms);
        });
        
        // Kamer aangemaakt
        this.socket.on('room_created', (data) => {
            console.log("Kamer aangemaakt:", data.room_id);
            this.roomId = data.room_id;
            this.isHost = true;
            
            // Update UI voor de kamer
            this.joinRoomUI(data.room_info);
        });
        
        // Bij een kamer aangesloten
        this.socket.on('room_joined', (data) => {
            console.log("Aangesloten bij kamer:", data.room_id);
            this.roomId = data.room_id;
            this.isHost = data.player_info.host;
            
            // Update UI voor de kamer
            this.joinRoomUI(data.room_info);
        });
        
        // Verlaten van een kamer
        this.socket.on('room_left', (data) => {
            console.log("Kamer verlaten:", data.room_id);
            this.roomId = null;
            this.isHost = false;
            this.otherPlayers = {};
            
            // Update UI voor de lobby
            this.showLobbyUI();
        });
        
        // Nieuwe speler toegetreden tot de kamer
        this.socket.on('player_joined', (data) => {
            console.log("Nieuwe speler in kamer:", data.player.username);
            
            // Voeg de speler toe aan de lijst met andere spelers
            this.otherPlayers[data.player.id] = {
                id: data.player.id,
                username: data.player.username,
                animalType: data.player.animal_type,
                ready: data.player.ready,
                position: data.player.position,
                velocity: data.player.velocity,
                playerObj: null // Het eigenlijke spelerobject wordt gemaakt bij gamestart
            };
            
            // Update de spelerslijst in de UI
            this.updatePlayersList();
            
            // Voeg een systeembericht toe aan de chat
            this.addChatMessage({
                sender_name: "Systeem",
                message: `${data.player.username} is bij het spel gekomen`,
                system: true
            });
        });
        
        // Speler heeft de kamer verlaten
        this.socket.on('player_left', (data) => {
            const playerId = data.player_id;
            const playerName = this.otherPlayers[playerId]?.username || "Onbekende speler";
            
            console.log("Speler verlaten:", playerName);
            
            // Verwijder de speler uit de lijst met andere spelers
            if (this.otherPlayers[playerId]) {
                // Als het spel bezig is, verwijder de speler entity
                if (gameCore.gameState.running && this.otherPlayers[playerId].playerObj) {
                    // Verwijder de speler uit het spel
                    // Dit moet later nog worden geïmplementeerd
                }
                
                // Verwijder de speler uit de lijst
                delete this.otherPlayers[playerId];
            }
            
            // Update de spelerslijst in de UI
            this.updatePlayersList();
            
            // Voeg een systeembericht toe aan de chat
            this.addChatMessage({
                sender_name: "Systeem",
                message: `${playerName} heeft het spel verlaten`,
                system: true
            });
        });
        
        // Speler status update (ready/not ready)
        this.socket.on('player_status_update', (data) => {
            console.log("Speler status update:", data.player_id, data.ready);
            
            // Update speler status
            if (this.otherPlayers[data.player_id]) {
                this.otherPlayers[data.player_id].ready = data.ready;
            }
            
            // Update de spelerslijst in de UI
            this.updatePlayersList();
        });
        
        // Alle spelers zijn klaar, spel start
        this.socket.on('game_starting', (data) => {
            console.log("Spel start over", data.countdown, "seconden");
            
            // Toon aftellen
            this.showCountdown(data.countdown);
            
            // Start het spel na het aftellen
            setTimeout(() => {
                this.startMultiplayerGame();
            }, data.countdown * 1000);
        });
        
        // Game state update
        this.socket.on('game_state_update', (data) => {
            console.log("Game state update:", data);
            
            // Update local game state
            if (!this.isHost) {
                if ('puppy_saved' in data) gameCore.gameState.puppySaved = data.puppy_saved;
                if ('game_over' in data) gameCore.gameState.gameOver = data.game_over;
                if ('level_completed' in data) gameCore.levelCompleted = data.level_completed;
                
                // Level verandering is complexer en vereist speciale behandeling
                if ('current_level' in data && data.current_level !== gameCore.currentLevel) {
                    if (typeof gameCore.nextLevel === 'function') {
                        // Gebruik de bestaande functie om van level te wisselen
                        gameCore.nextLevel();
                    }
                }
            }
        });
        
        // Speler positie/snelheid/dierstaat update
        this.socket.on('player_update', (data) => {
            // Vind de speler in onze otherPlayers lijst
            const player = this.otherPlayers[data.player_id];
            if (!player) return;
            
            // Update positie en snelheid
            if (data.position) player.position = data.position;
            if (data.velocity) player.velocity = data.velocity;
            if (data.animal_type) player.animalType = data.animal_type;
            
            // Als we een spelerobject hebben, update dat ook
            if (player.playerObj) {
                if (data.position) {
                    player.playerObj.x = data.position.x;
                    player.playerObj.y = data.position.y;
                }
                if (data.velocity) {
                    player.playerObj.velX = data.velocity.x;
                    player.playerObj.velY = data.velocity.y;
                }
                if (data.animal_type && data.animal_type !== player.playerObj.animalType) {
                    player.playerObj.animalType = data.animal_type;
                    player.playerObj.updateAnimalProperties();
                }
            }
        });
        
        // Nieuwe host aangewezen (als de oude host vertrok)
        this.socket.on('new_host', (data) => {
            console.log("Nieuwe host aangewezen:", data.host_id);
            
            // Check of wij de nieuwe host zijn
            if (data.host_id === this.clientId) {
                this.isHost = true;
                
                // Update UI voor host functionaliteit
                this.updateHostUI();
                
                // Informeer de gebruiker
                this.addChatMessage({
                    sender_name: "Systeem",
                    message: "Je bent nu de host van deze sessie",
                    system: true
                });
            }
        });
        
        // Chat bericht ontvangen
        this.socket.on('chat_message', (data) => {
            console.log("Chat bericht ontvangen:", data);
            
            // Toon het bericht in de chat
            this.addChatMessage(data);
        });
    },
    
    // Maak en toon de multiplayer UI
    createMultiplayerUI: function() {
        console.log("Maken van multiplayer UI");
        
        // Maak de main container voor de multiplayer UI
        const multiplayerContainer = document.createElement('div');
        multiplayerContainer.id = 'multiplayer-container';
        multiplayerContainer.style.position = 'fixed';
        multiplayerContainer.style.top = '0';
        multiplayerContainer.style.left = '0';
        multiplayerContainer.style.width = '100%';
        multiplayerContainer.style.height = '100%';
        multiplayerContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        multiplayerContainer.style.display = 'flex';
        multiplayerContainer.style.justifyContent = 'center';
        multiplayerContainer.style.alignItems = 'center';
        multiplayerContainer.style.zIndex = '1000';
        
        // Maak de lobby container
        this.ui.lobbyContainer = document.createElement('div');
        this.ui.lobbyContainer.id = 'lobby-container';
        this.ui.lobbyContainer.style.backgroundColor = 'white';
        this.ui.lobbyContainer.style.borderRadius = '10px';
        this.ui.lobbyContainer.style.padding = '20px';
        this.ui.lobbyContainer.style.maxWidth = '800px';
        this.ui.lobbyContainer.style.width = '90%';
        
        // Maak de titel
        const lobbyTitle = document.createElement('h1');
        lobbyTitle.textContent = 'Dieren Redders - Multiplayer';
        lobbyTitle.style.textAlign = 'center';
        lobbyTitle.style.color = '#45882f';
        this.ui.lobbyContainer.appendChild(lobbyTitle);
        
        // Maak de username input sectie
        const usernameSection = document.createElement('div');
        usernameSection.style.marginBottom = '20px';
        
        const usernameLabel = document.createElement('label');
        usernameLabel.textContent = 'Je naam:';
        usernameLabel.style.display = 'block';
        usernameLabel.style.marginBottom = '5px';
        usernameSection.appendChild(usernameLabel);
        
        this.ui.usernameInput = document.createElement('input');
        this.ui.usernameInput.type = 'text';
        this.ui.usernameInput.placeholder = 'Kies een naam...';
        this.ui.usernameInput.value = 'Speler_' + Math.floor(Math.random() * 1000);
        this.ui.usernameInput.style.width = '100%';
        this.ui.usernameInput.style.padding = '8px';
        this.ui.usernameInput.style.borderRadius = '5px';
        this.ui.usernameInput.style.border = '1px solid #ccc';
        usernameSection.appendChild(this.ui.usernameInput);
        
        this.ui.lobbyContainer.appendChild(usernameSection);
        
        // Maak de rooms sectie
        const roomsSection = document.createElement('div');
        roomsSection.style.display = 'flex';
        roomsSection.style.gap = '20px';
        
        // Linker sectie - kamers lijst
        const roomListSection = document.createElement('div');
        roomListSection.style.flex = '1';
        
        const roomsTitle = document.createElement('h2');
        roomsTitle.textContent = 'Beschikbare Kamers';
        roomsTitle.style.color = '#45882f';
        roomListSection.appendChild(roomsTitle);
        
        this.ui.roomListContainer = document.createElement('div');
        this.ui.roomListContainer.style.border = '1px solid #ccc';
        this.ui.roomListContainer.style.borderRadius = '5px';
        this.ui.roomListContainer.style.padding = '10px';
        this.ui.roomListContainer.style.maxHeight = '300px';
        this.ui.roomListContainer.style.overflowY = 'auto';
        this.ui.roomListContainer.innerHTML = '<p>Verbinden met server...</p>';
        roomListSection.appendChild(this.ui.roomListContainer);
        
        // Room controls
        const roomControls = document.createElement('div');
        roomControls.style.marginTop = '10px';
        roomControls.style.display = 'flex';
        roomControls.style.gap = '10px';
        
        this.ui.createRoomBtn = document.createElement('button');
        this.ui.createRoomBtn.textContent = 'Nieuwe Kamer';
        this.ui.createRoomBtn.style.backgroundColor = '#45882f';
        this.ui.createRoomBtn.style.color = 'white';
        this.ui.createRoomBtn.style.border = 'none';
        this.ui.createRoomBtn.style.borderRadius = '5px';
        this.ui.createRoomBtn.style.padding = '10px';
        this.ui.createRoomBtn.style.flex = '1';
        this.ui.createRoomBtn.style.cursor = 'pointer';
        this.ui.createRoomBtn.onclick = () => this.createRoom();
        roomControls.appendChild(this.ui.createRoomBtn);
        
        this.ui.joinRoomBtn = document.createElement('button');
        this.ui.joinRoomBtn.textContent = 'Vernieuwen';
        this.ui.joinRoomBtn.style.backgroundColor = '#45882f';
        this.ui.joinRoomBtn.style.color = 'white';
        this.ui.joinRoomBtn.style.border = 'none';
        this.ui.joinRoomBtn.style.borderRadius = '5px';
        this.ui.joinRoomBtn.style.padding = '10px';
        this.ui.joinRoomBtn.style.flex = '1';
        this.ui.joinRoomBtn.style.cursor = 'pointer';
        this.ui.joinRoomBtn.onclick = () => this.refreshRooms();
        roomControls.appendChild(this.ui.joinRoomBtn);
        
        roomListSection.appendChild(roomControls);
        
        // Rechter sectie - spelers in kamer en informatie
        const roomInfoSection = document.createElement('div');
        roomInfoSection.style.flex = '1';
        
        const roomInfoTitle = document.createElement('h2');
        roomInfoTitle.textContent = 'Kamer Informatie';
        roomInfoTitle.style.color = '#45882f';
        roomInfoSection.appendChild(roomInfoTitle);
        
        this.ui.roomInfoDisplay = document.createElement('div');
        this.ui.roomInfoDisplay.style.border = '1px solid #ccc';
        this.ui.roomInfoDisplay.style.borderRadius = '5px';
        this.ui.roomInfoDisplay.style.padding = '10px';
        this.ui.roomInfoDisplay.style.marginBottom = '10px';
        this.ui.roomInfoDisplay.innerHTML = '<p>Selecteer of maak een kamer...</p>';
        roomInfoSection.appendChild(this.ui.roomInfoDisplay);
        
        // Spelers in kamer
        const playersListTitle = document.createElement('h3');
        playersListTitle.textContent = 'Spelers';
        playersListTitle.style.color = '#45882f';
        roomInfoSection.appendChild(playersListTitle);
        
        this.ui.playersList = document.createElement('div');
        this.ui.playersList.style.border = '1px solid #ccc';
        this.ui.playersList.style.borderRadius = '5px';
        this.ui.playersList.style.padding = '10px';
        this.ui.playersList.style.maxHeight = '200px';
        this.ui.playersList.style.overflowY = 'auto';
        this.ui.playersList.innerHTML = '<p>Nog geen spelers...</p>';
        roomInfoSection.appendChild(this.ui.playersList);
        
        // Room action buttons
        const roomActionButtons = document.createElement('div');
        roomActionButtons.style.marginTop = '10px';
        roomActionButtons.style.display = 'flex';
        roomActionButtons.style.gap = '10px';
        
        this.ui.readyBtn = document.createElement('button');
        this.ui.readyBtn.textContent = 'Klaar!';
        this.ui.readyBtn.style.backgroundColor = '#45882f';
        this.ui.readyBtn.style.color = 'white';
        this.ui.readyBtn.style.border = 'none';
        this.ui.readyBtn.style.borderRadius = '5px';
        this.ui.readyBtn.style.padding = '10px';
        this.ui.readyBtn.style.flex = '1';
        this.ui.readyBtn.style.cursor = 'pointer';
        this.ui.readyBtn.disabled = true;
        this.ui.readyBtn.style.opacity = '0.5';
        this.ui.readyBtn.onclick = () => this.setPlayerReady(true);
        roomActionButtons.appendChild(this.ui.readyBtn);
        
        this.ui.leaveRoomBtn = document.createElement('button');
        this.ui.leaveRoomBtn.textContent = 'Verlaat Kamer';
        this.ui.leaveRoomBtn.style.backgroundColor = '#ff5252';
        this.ui.leaveRoomBtn.style.color = 'white';
        this.ui.leaveRoomBtn.style.border = 'none';
        this.ui.leaveRoomBtn.style.borderRadius = '5px';
        this.ui.leaveRoomBtn.style.padding = '10px';
        this.ui.leaveRoomBtn.style.flex = '1';
        this.ui.leaveRoomBtn.style.cursor = 'pointer';
        this.ui.leaveRoomBtn.disabled = true;
        this.ui.leaveRoomBtn.style.opacity = '0.5';
        this.ui.leaveRoomBtn.onclick = () => this.leaveRoom();
        roomActionButtons.appendChild(this.ui.leaveRoomBtn);
        
        roomInfoSection.appendChild(roomActionButtons);
        
        // Voeg de twee secties toe aan de roomsSection
        roomsSection.appendChild(roomListSection);
        roomsSection.appendChild(roomInfoSection);
        
        // Voeg de roomsSection toe aan de lobby container
        this.ui.lobbyContainer.appendChild(roomsSection);
        
        // Voeg de lobby container toe aan de multiplayer container
        multiplayerContainer.appendChild(this.ui.lobbyContainer);
        
        // Maak de in-game chat UI
        this.ui.chatContainer = document.createElement('div');
        this.ui.chatContainer.id = 'chat-container';
        this.ui.chatContainer.style.position = 'fixed';
        this.ui.chatContainer.style.bottom = '10px';
        this.ui.chatContainer.style.right = '10px';
        this.ui.chatContainer.style.width = '300px';
        this.ui.chatContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        this.ui.chatContainer.style.borderRadius = '5px';
        this.ui.chatContainer.style.padding = '5px';
        this.ui.chatContainer.style.zIndex = '100';
        this.ui.chatContainer.style.display = 'none';
        
        // Chat messages
        this.ui.chatMessages = document.createElement('div');
        this.ui.chatMessages.style.maxHeight = '150px';
        this.ui.chatMessages.style.overflowY = 'auto';
        this.ui.chatMessages.style.marginBottom = '5px';
        this.ui.chatMessages.style.padding = '5px';
        this.ui.chatContainer.appendChild(this.ui.chatMessages);
        
        // Chat input
        const chatInputContainer = document.createElement('div');
        chatInputContainer.style.display = 'flex';
        
        this.ui.chatInput = document.createElement('input');
        this.ui.chatInput.type = 'text';
        this.ui.chatInput.placeholder = 'Druk op T om te chatten...';
        this.ui.chatInput.style.flex = '1';
        this.ui.chatInput.style.padding = '5px';
        this.ui.chatInput.style.borderRadius = '3px';
        this.ui.chatInput.style.border = '1px solid #ccc';
        this.ui.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
                e.preventDefault();
            }
        });
        chatInputContainer.appendChild(this.ui.chatInput);
        
        const sendButton = document.createElement('button');
        sendButton.textContent = 'Send';
        sendButton.style.marginLeft = '5px';
        sendButton.style.padding = '5px 10px';
        sendButton.style.backgroundColor = '#45882f';
        sendButton.style.color = 'white';
        sendButton.style.border = 'none';
        sendButton.style.borderRadius = '3px';
        sendButton.style.cursor = 'pointer';
        sendButton.onclick = () => this.sendChatMessage();
        chatInputContainer.appendChild(sendButton);
        
        this.ui.chatContainer.appendChild(chatInputContainer);
        
        // Voeg de chat container toe aan de body
        document.body.appendChild(this.ui.chatContainer);
        
        // Voeg de multiplayer container toe aan de body
        document.body.appendChild(multiplayerContainer);
        
        // Voeg een 'multiplayer' knop toe aan de hoofdpagina
        const multiplayerButton = document.createElement('button');
        multiplayerButton.textContent = 'Multiplayer';
        multiplayerButton.style.position = 'fixed';
        multiplayerButton.style.top = '10px';
        multiplayerButton.style.left = '10px';
        multiplayerButton.style.padding = '10px 20px';
        multiplayerButton.style.backgroundColor = '#45882f';
        multiplayerButton.style.color = 'white';
        multiplayerButton.style.border = 'none';
        multiplayerButton.style.borderRadius = '5px';
        multiplayerButton.style.cursor = 'pointer';
        multiplayerButton.style.zIndex = '50';
        multiplayerButton.onclick = () => this.toggleLobby();
        document.body.appendChild(multiplayerButton);
    },
    
    // Toon of verberg de lobby
    toggleLobby: function() {
        const multiplayerContainer = document.getElementById('multiplayer-container');
        if (multiplayerContainer.style.display === 'none') {
            multiplayerContainer.style.display = 'flex';
            gameCore.gameState.running = false; // Pauzeer het spel
            this.refreshRooms(); // Ververs de kamerlijst
        } else {
            multiplayerContainer.style.display = 'none';
            if (this.roomId) {
                gameCore.gameState.running = true; // Hervat het spel
            }
        }
    },
    
    // Refresh de lijst met beschikbare kamers
    refreshRooms: function() {
        if (this.socket) {
            this.socket.emit('get_rooms');
        }
    },
    
    // Update de lijst met beschikbare kamers
    updateRoomsList: function(rooms) {
        if (!this.ui.roomListContainer) return;
        
        // Clear huidige lijst
        this.ui.roomListContainer.innerHTML = '';
        
        if (!rooms || rooms.length === 0) {
            this.ui.roomListContainer.innerHTML = '<p>Geen kamers beschikbaar. Maak een nieuwe kamer aan!</p>';
            return;
        }
        
        // Maak een lijst van kamers
        const ul = document.createElement('ul');
        ul.style.listStyleType = 'none';
        ul.style.padding = '0';
        ul.style.margin = '0';
        
        rooms.forEach(room => {
            const li = document.createElement('li');
            li.style.padding = '10px';
            li.style.borderBottom = '1px solid #eee';
            li.style.cursor = 'pointer';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            
            li.innerHTML = `
                <div>
                    <strong>${room.name}</strong><br>
                    <span>Level ${room.level + 1} - ${room.player_count}/${room.max_players} spelers</span>
                </div>
            `;
            
            const joinBtn = document.createElement('button');
            joinBtn.textContent = 'Deelnemen';
            joinBtn.style.backgroundColor = '#45882f';
            joinBtn.style.color = 'white';
            joinBtn.style.border = 'none';
            joinBtn.style.borderRadius = '3px';
            joinBtn.style.padding = '5px 10px';
            joinBtn.style.cursor = 'pointer';
            joinBtn.onclick = (e) => {
                e.stopPropagation();
                this.joinRoom(room.id);
            };
            li.appendChild(joinBtn);
            
            // Highlight de kamer als de muis erover gaat
            li.onmouseover = () => {
                li.style.backgroundColor = '#f0f0f0';
            };
            li.onmouseout = () => {
                li.style.backgroundColor = 'transparent';
            };
            
            ul.appendChild(li);
        });
        
        this.ui.roomListContainer.appendChild(ul);
    },
    
    // Maak een nieuwe kamer
    createRoom: function() {
        if (!this.socket) return;
        
        const username = this.ui.usernameInput.value.trim();
        if (!username) {
            alert("Voer eerst een gebruikersnaam in!");
            return;
        }
        
        this.username = username;
        
        // Haal het huidige level op
        const level = gameCore.currentLevel || 0;
        
        // Stuur een verzoek om een kamer aan te maken
        this.socket.emit('create_room', {
            username: username,
            level: level,
            max_players: 4,
            is_public: true
        });
        
        console.log("Aanmaken van kamer als:", username);
    },
    
    // Sluit aan bij een bestaande kamer
    joinRoom: function(roomId) {
        if (!this.socket) return;
        
        const username = this.ui.usernameInput.value.trim();
        if (!username) {
            alert("Voer eerst een gebruikersnaam in!");
            return;
        }
        
        this.username = username;
        
        // Stuur een verzoek om bij de kamer aan te sluiten
        this.socket.emit('join_room', {
            room_id: roomId,
            username: username
        });
        
        console.log("Aansluiten bij kamer:", roomId, "als:", username);
    },
    
    // Verlaat de huidige kamer
    leaveRoom: function() {
        if (!this.socket || !this.roomId) return;
        
        // Stuur een verzoek om de kamer te verlaten
        this.socket.emit('leave_room', {
            room_id: this.roomId
        });
        
        console.log("Verlaten van kamer:", this.roomId);
    },
    
    // Geef aan dat je klaar bent om te spelen
    setPlayerReady: function(ready) {
        if (!this.socket || !this.roomId) return;
        
        // Stuur een verzoek om je status aan te passen
        this.socket.emit('player_ready', {
            ready: ready
        });
        
        // Update UI
        if (ready) {
            this.ui.readyBtn.textContent = 'Wachten op anderen...';
            this.ui.readyBtn.style.backgroundColor = '#888';
        } else {
            this.ui.readyBtn.textContent = 'Klaar!';
            this.ui.readyBtn.style.backgroundColor = '#45882f';
        }
        
        console.log("Speler klaar status:", ready);
    },
    
    // Update de UI als je een kamer joined of maakt
    joinRoomUI: function(roomInfo) {
        if (!roomInfo) return;
        
        // Update je kamer id en host status
        this.roomId = roomInfo.id;
        this.isHost = roomInfo.host === this.clientId;
        
        // Activeer de kamer knoppen
        this.ui.readyBtn.disabled = false;
        this.ui.readyBtn.style.opacity = '1';
        this.ui.leaveRoomBtn.disabled = false;
        this.ui.leaveRoomBtn.style.opacity = '1';
        
        // Update de kamer info weergave
        this.ui.roomInfoDisplay.innerHTML = `
            <h3>${roomInfo.name}</h3>
            <p>Level: ${roomInfo.level + 1}</p>
            <p>Host: ${this.isHost ? 'Jij' : 'Iemand anders'}</p>
            <p>Spelers: ${Object.keys(roomInfo.players).length}/${roomInfo.max_players}</p>
            <p>Status: Wachten tot iedereen klaar is</p>
        `;
        
        // Update de spelerslijst in de kamer
        this.otherPlayers = {};
        Object.entries(roomInfo.players).forEach(([playerId, playerInfo]) => {
            if (playerId !== this.clientId) {
                this.otherPlayers[playerId] = {
                    id: playerId,
                    username: playerInfo.username,
                    animalType: playerInfo.animal_type,
                    ready: playerInfo.ready,
                    position: playerInfo.position,
                    velocity: playerInfo.velocity,
                    playerObj: null
                };
            }
        });
        
        // Update de spelerslijst UI
        this.updatePlayersList();
        
        // Toon de chat container
        this.ui.chatContainer.style.display = 'block';
        
        // Voeg een welkomstbericht toe
        this.addChatMessage({
            sender_name: "Systeem",
            message: `Welkom in de kamer "${roomInfo.name}"!`,
            system: true
        });
    },
    
    // Toon de lobby UI
    showLobbyUI: function() {
        // Reset kamer knoppen
        this.ui.readyBtn.disabled = true;
        this.ui.readyBtn.style.opacity = '0.5';
        this.ui.readyBtn.textContent = 'Klaar!';
        this.ui.readyBtn.style.backgroundColor = '#45882f';
        
        this.ui.leaveRoomBtn.disabled = true;
        this.ui.leaveRoomBtn.style.opacity = '0.5';
        
        // Reset kamer info
        this.ui.roomInfoDisplay.innerHTML = '<p>Selecteer of maak een kamer...</p>';
        
        // Reset spelerslijst
        this.ui.playersList.innerHTML = '<p>Nog geen spelers...</p>';
        
        // Verberg de chat container
        this.ui.chatContainer.style.display = 'none';
        
        // Ververs de kamerlijst
        this.refreshRooms();
    },
    
    // Update de UI voor de host functies
    updateHostUI: function() {
        // Als dit een update is naar host status, update de kamer info display
        if (this.roomId) {
            const roomInfoDisplay = document.querySelector('#room-info strong');
            if (roomInfoDisplay) {
                roomInfoDisplay.textContent = `Je bent nu de host van deze kamer!`;
            }
        }
    },
    
    // Update de spelerslijst in de UI
    updatePlayersList: function() {
        if (!this.ui.playersList) return;
        
        // Clear huidige lijst
        this.ui.playersList.innerHTML = '';
        
        // Voeg jezelf toe als eerste speler
        const playersList = document.createElement('ul');
        playersList.style.listStyleType = 'none';
        playersList.style.padding = '0';
        playersList.style.margin = '0';
        
        // Jezelf
        const selfLi = document.createElement('li');
        selfLi.style.padding = '5px';
        selfLi.style.borderBottom = '1px solid #eee';
        selfLi.style.display = 'flex';
        selfLi.style.justifyContent = 'space-between';
        selfLi.style.alignItems = 'center';
        
        // Bepaal het dieremoji op basis van de speler's eigen informatie
        let animalEmoji = '🐿️'; // Default is eekhoorn
        const playerAnimalType = this.socket && this.socket.animalType ? this.socket.animalType : undefined;
        
        switch (playerAnimalType) {
            case 'SQUIRREL': animalEmoji = '🐿️'; break;
            case 'TURTLE': animalEmoji = '🐢'; break;
            case 'UNICORN': animalEmoji = '🦄'; break;
        }
        
        selfLi.innerHTML = `
            <div>
                <strong>${this.username || 'Jij'}</strong> ${animalEmoji}
                ${this.isHost ? ' (Host)' : ''}
            </div>
            <span style="color: ${this.socket && this.socket.ready ? 'green' : 'orange'}">
                ${this.socket && this.socket.ready ? 'Klaar' : 'Niet klaar'}
            </span>
        `;
        
        playersList.appendChild(selfLi);
        
        // Andere spelers
        Object.values(this.otherPlayers).forEach(player => {
            const li = document.createElement('li');
            li.style.padding = '5px';
            li.style.borderBottom = '1px solid #eee';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            
            let animalEmoji = '🐿️';
            switch (player.animalType) {
                case 'SQUIRREL': animalEmoji = '🐿️'; break;
                case 'TURTLE': animalEmoji = '🐢'; break;
                case 'UNICORN': animalEmoji = '🦄'; break;
            }
            
            li.innerHTML = `
                <div>
                    <strong>${player.username}</strong> ${animalEmoji}
                    ${player.id === this.roomId ? ' (Host)' : ''}
                </div>
                <span style="color: ${player.ready ? 'green' : 'orange'}">
                    ${player.ready ? 'Klaar' : 'Niet klaar'}
                </span>
            `;
            
            playersList.appendChild(li);
        });
        
        this.ui.playersList.appendChild(playersList);
    },
    
    // Toon een countdown voor het starten van het spel
    showCountdown: function(seconds) {
        // Maak een overlay voor de countdown
        const countdownOverlay = document.createElement('div');
        countdownOverlay.id = 'countdown-overlay';
        countdownOverlay.style.position = 'fixed';
        countdownOverlay.style.top = '0';
        countdownOverlay.style.left = '0';
        countdownOverlay.style.width = '100%';
        countdownOverlay.style.height = '100%';
        countdownOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        countdownOverlay.style.display = 'flex';
        countdownOverlay.style.justifyContent = 'center';
        countdownOverlay.style.alignItems = 'center';
        countdownOverlay.style.color = 'white';
        countdownOverlay.style.fontSize = '80px';
        countdownOverlay.style.zIndex = '500';
        countdownOverlay.textContent = seconds.toString();
        
        document.body.appendChild(countdownOverlay);
        
        // Start de countdown
        let timeLeft = seconds;
        const countdownInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                document.body.removeChild(countdownOverlay);
                
                // Verberg ook de multiplayer container
                const multiplayerContainer = document.getElementById('multiplayer-container');
                if (multiplayerContainer) {
                    multiplayerContainer.style.display = 'none';
                }
            } else {
                countdownOverlay.textContent = timeLeft.toString();
            }
        }, 1000);
    },
    
    // Stuur positie updates naar de server
    sendPositionUpdate: function(player) {
        if (!this.socket || !this.roomId) return;
        
        // Stuur alleen updates als het spel gestart is
        if (!gameCore.gameState.running) return;
        
        // Stuur een update naar de server
        this.socket.emit('update_player', {
            position: { x: player.x, y: player.y },
            velocity: { x: player.velX, y: player.velY },
            animal_type: player.animalType
        });
    },
    
    // Verzend een chat bericht
    sendChatMessage: function() {
        if (!this.socket || !this.roomId) return;
        
        const message = this.ui.chatInput.value.trim();
        if (!message) return;
        
        // Stuur het bericht naar de server
        this.socket.emit('chat_message', {
            room_id: this.roomId,
            message: message
        });
        
        // Clear het input veld
        this.ui.chatInput.value = '';
    },
    
    // Voeg een bericht toe aan de chat
    addChatMessage: function(data) {
        if (!this.ui.chatMessages) return;
        
        const messageContainer = document.createElement('div');
        messageContainer.style.marginBottom = '5px';
        
        if (data.system) {
            // Systeembericht
            messageContainer.style.color = '#888';
            messageContainer.style.fontStyle = 'italic';
            messageContainer.textContent = `${data.message}`;
        } else {
            // Spelersbericht
            const senderName = document.createElement('strong');
            senderName.textContent = data.sender_name;
            senderName.style.color = data.sender_id === this.clientId ? '#45882f' : '#0066cc';
            
            messageContainer.appendChild(senderName);
            messageContainer.appendChild(document.createTextNode(': ' + data.message));
        }
        
        this.ui.chatMessages.appendChild(messageContainer);
        
        // Scroll naar beneden
        this.ui.chatMessages.scrollTop = this.ui.chatMessages.scrollHeight;
    },
    
    // Start het spel in multiplayer modus
    startMultiplayerGame: function() {
        console.log("Starten van multiplayer spel");
        
        // Zorg ervoor dat het huidige level overeenkomt met de kamer level
        if (this.roomId && window.active_rooms && window.active_rooms[this.roomId]) {
            const room = window.active_rooms[this.roomId];
            
            if (room.level !== undefined && room.level !== gameCore.currentLevel) {
                // Stel het level in op basis van de kamer instellingen
                gameCore.currentLevel = room.level;
                
                // Initialiseer het level
                // (dit zou moeten worden gedaan door de bestaande game code)
            }
        }
        
        // TODO: Maak spelerobjecten voor de andere spelers
        
        // TODO: Start de game loop voor multiplayer
        
        // Zet de game state op running
        gameCore.gameState.running = true;
    },
    
    // Update de game state en synchroniseer met andere spelers
    updateGameState: function() {
        if (!this.socket || !this.roomId) return;
        
        // Alleen de host mag de game state updaten
        if (!this.isHost) return;
        
        // Stuur een update over de huidige game state
        this.socket.emit('update_game_state', {
            puppy_saved: gameCore.gameState.puppySaved,
            game_over: gameCore.gameState.gameOver,
            level_completed: gameCore.levelCompleted,
            current_level: gameCore.currentLevel
        });
    }
};

// Deze functie wordt aangeroepen wanneer het spel wordt geladen
function initMultiplayer() {
    // Controleer of de socket.io client script geladen is
    if (typeof io !== 'undefined') {
        console.log("Socket.io client is beschikbaar");
        // Initialiseer de multiplayer modus
        gameMultiplayer.init();
    } else {
        console.error("Socket.io client niet geladen");
        alert("Er is een fout opgetreden bij het laden van multiplayer ondersteuning. Probeer de pagina te verversen.");
    }
}

// Exporteer de multiplayer functionaliteit
window.gameMultiplayer = gameMultiplayer;
window.initMultiplayer = initMultiplayer;