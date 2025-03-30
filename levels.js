// Huisdieren Redders - Level definities
// Dit bestand bevat alle level ontwerpen voor het spel
// Test update: 1

// Level ontwerpen - deze functie wordt aangeroepen nadat de canvas is gemaakt
function getLevels(GROUND_LEVEL) {    return [
        {
    name: "AA!!! Draak!!!",
    music: "retro-8bit-happy-videogame-music-243997.mp3",
    theme: "day",
    allowedAnimals: ["UNICORN","CAT","MOLE"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 582, y: 365, width: 140, height: 27, type: "TRAMPOLINE"},
        {x: 559, y: 73, width: 100, height: 20, type: "NORMAL"},
        {x: 423, y: 227, width: 100, height: 20, type: "TREADMILL", speed: -1},
        {x: 175, y: 354, width: 100, height: 20, type: "TRAMPOLINE"},
        {x: 420, y: 303, width: 100, height: 20, type: "TRAMPOLINE"},
        {x: 336, y: 155, width: 20, height: 244, type: "VERTICAL"},
        {x: 250, y: 155, width: 20, height: 244, type: "VERTICAL"}
    ],
    traps: [

    ],
    enemies: [
        {x: 586, y: 307, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 600, 
        y: 120, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 453, y: 266, width: 30, height: 30, type: "STAR"},
        {x: 210, y: 217, width: 30, height: 30, type: "PEPPER"},
        {x: 445, y: 189, width: 30, height: 30, type: "DOGFOOD"},
        {x: 597, y: 36, width: 30, height: 30, type: "DOGFOOD"},
        {x: 275, y: 130, width: 30, height: 30, type: "HOURGLASS"}
    ]
},
        {
    name: "Jippie!!! TRAMPOLINE!!!",
    music: "default2.mp3",
    theme: "night",
    allowedAnimals: ["SQUIRREL","TURTLE"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 460, y: 375, width: 150, height: 20, type: "NORMAL"},
        {x: 389, y: 270, width: 150, height: 20, type: "NORMAL"},
        {x: 650, y: 376, width: 150, height: 20, type: "NORMAL"},
        {x: 613, y: 195, width: 30, height: 200, type: "TREE"},
        {x: 692, y: 351, width: 100, height: 20, type: "TRAMPOLINE"},
        {x: 438, y: 197, width: 100, height: 20, type: "NORMAL"},
        {x: 315, y: 143, width: 100, height: 20, type: "NORMAL"},
        {x: 179, y: 107, width: 100, height: 20, type: "NORMAL"},
        {x: 28, y: 75, width: 100, height: 20, type: "NORMAL"}
    ],
    traps: [
        {x: 539, y: 204, width: 72, height: 20, type: "SPIKES"}
    ],
    enemies: [
        {x: 383, y: 220, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 715, 
        y: 173, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 32, y: 23, width: 30, height: 30, type: "STAR"},
        {x: 54, y: 284, width: 30, height: 30, type: "HOURGLASS"},
        {x: 467, y: 340, width: 30, height: 30, type: "DOGFOOD"}
    ]
},
        {
    name: "Wat is dat?",
    music: "level-vii-short-258782.mp3",
    theme: "night",
    allowedAnimals: ["TURTLE","UNICORN","CAT","MOLE"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 700, y: 297, width: 100, height: 100, type: "CLIMB"},
        {x: 305, y: 172, width: 200, height: 40, type: "WATER"},
        {x: 109, y: 281, width: 150, height: 20, type: "ICE"},
        {x: 388, y: 216, width: 35, height: 180, type: "TREE"},
        {x: 219, y: 174, width: 80, height: 30, type: "CLOUD"},
        {x: 512, y: 176, width: 90, height: 35, type: "CLOUD"},
        {x: 351, y: 60, width: 100, height: 40, type: "CLOUD"},
        {x: 678, y: 364, width: 16, height: 25, type: "TRAMPOLINE"}
    ],
    traps: [

    ],
    enemies: [
        {x: 424, y: 342, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 0.8}
    ],
    puppy: {
        x: 700, 
        y: 194, 
        width: 100, 
        height: 100, 
        saved: false
    },
    collectibles: [
        {x: 380, y: 8, width: 30, height: 30, type: "STAR"},
        {x: 154, y: 332, width: 30, height: 30, type: "HOURGLASS"}
    ]
},
        {
    name: "Irritante spikes!",
    music: "level-vii-short-258782.mp3",
    theme: "night",
    allowedAnimals: ["SQUIRREL","UNICORN","CAT"],
    startPositions: [
        {x: 0, y: 0},
        {x: 0, y: 0}
    ],
    platforms: [
        {x: 383, y: 202, width: 100, height: 20, type: "NORMAL"},
        {x: 697, y: 202, width: 100, height: 20, type: "NORMAL"},
        {x: 590, y: 201, width: 100, height: 20, type: "NORMAL"},
        {x: 486, y: 200, width: 100, height: 20, type: "NORMAL"},
        {x: -1, y: 380, width: 100, height: 20, type: "TRAMPOLINE"}
    ],
    traps: [
        {x: 582, y: 380, width: 40, height: 20, type: "SPIKES"},
        {x: 536, y: 379, width: 40, height: 20, type: "SPIKES"},
        {x: 320, y: 378, width: 83, height: 20, type: "FIRE"},
        {x: 719, y: 380, width: 40, height: 20, type: "SPIKES"},
        {x: 761, y: 378, width: 40, height: 20, type: "SPIKES"},
        {x: 754, y: 178, width: 40, height: 20, type: "SPIKES"},
        {x: 646, y: 177, width: 40, height: 20, type: "SPIKES"},
        {x: 495, y: 178, width: 40, height: 20, type: "SPIKES"},
        {x: 185, y: 379, width: 72, height: 20, type: "FIRE"}
    ],
    enemies: [
        {x: 626, y: 355, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 541, 
        y: 172, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 5, y: 1, width: 30, height: 30}
    ]
},
        {
    name: "Dit is leuk.",
    allowedAnimals: ["UNICORN", "CAT"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 11, y: 374, width: 100, height: 20, type: "NORMAL"},
        {x: 674, y: 265, width: 100, height: 20, type: "CLOUD"},
        {x: 207, y: 162, width: 100, height: 20, type: "CLOUD"},
        {x: 119, y: 220, width: 100, height: 20, type: "CLOUD"},
        {x: 20, y: 282, width: 100, height: 20, type: "CLOUD"},
        {x: 55, y: 152, width: 100, height: 20, type: "CLOUD"},
        {x: -26, y: 221, width: 100, height: 20, type: "CLOUD"},
        {x: -33, y: 86, width: 100, height: 20, type: "CLOUD"},
        {x: 38, y: 34, width: 100, height: 20, type: "CLOUD"},
        {x: 130, y: 85, width: 100, height: 20, type: "CLOUD"},
        {x: 210, y: 31, width: 100, height: 20, type: "CLOUD"},
        {x: 283, y: 92, width: 100, height: 20, type: "CLOUD"},
        {x: 371, y: 34, width: 100, height: 20, type: "CLOUD"},
        {x: 674, y: 244, width: 100, height: 20, type: "CLOUD"},
        {x: 676, y: 220, width: 100, height: 20, type: "CLOUD"},
        {x: 678, y: 198, width: 100, height: 20, type: "CLOUD"},
        {x: 678, y: 173, width: 100, height: 20, type: "CLOUD"},
        {x: 679, y: 151, width: 100, height: 20, type: "CLOUD"},
        {x: 679, y: 126, width: 100, height: 20, type: "CLOUD"},
        {x: 682, y: 103, width: 100, height: 20, type: "CLOUD"},
        {x: 680, y: 79, width: 100, height: 20, type: "CLOUD"},
        {x: 680, y: 55, width: 100, height: 20, type: "CLOUD"},
        {x: 681, y: 32, width: 100, height: 20, type: "CLOUD"},
        {x: 680, y: 6, width: 100, height: 20, type: "NORMAL"},
        {x: 559, y: 366, width: 100, height: 20, type: "TRAMPOLINE"}
    ],
    traps: [

    ],
    enemies: [

    ],
    puppy: {
        x: 767, 
        y: 370, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 625, y: 159, width: 30, height: 30},
        {x: 587, y: 159, width: 30, height: 30},
        {x: 549, y: 157, width: 30, height: 30}
    ]
},
        {
    name: "Spring samen!!!",
    music: "level-vii-short-258782.mp3",
    allowedAnimals: ["SQUIRREL","TURTLE","CAT"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [

    ],
    traps: [

    ],
    enemies: [

    ],
    puppy: {
        x: 35, 
        y: 255, 
        width: 30, 
        height: 27, 
        saved: false
    },
    collectibles: [
        {x: 85, y: 264, width: 30, height: 30}
    ]
},
        {
    name: "Spannend!!!",
    allowedAnimals: ["TURTLE","UNICORN","CAT"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 297, y: 283, width: 310, height: 20, type: "NORMAL"},
        {x: 690, y: 73, width: 100, height: 20, type: "CLOUD"},
        {x: 300, y: 130, width: 303, height: 151, type: "WATER"},
        {x: 686, y: 97, width: 100, height: 20, type: "WATER"},
        {x: 425, y: 32, width: 100, height: 20, type: "CLOUD"},
        {x: 684, y: 158, width: 100, height: 20, type: "TREE"},
        {x: 687, y: 129, width: 100, height: 20, type: "NORMAL"},
        {x: 685, y: 191, width: 100, height: 20, type: "CLIMB"},
        {x: 294, y: 308, width: 100, height: 20, type: "LASER"},
        {x: 398, y: 314, width: 100, height: 20, type: "LASER"},
        {x: 507, y: 303, width: 100, height: 20, type: "LASER"},
        {x: 294, y: 380, width: 100, height: 20, type: "ICE"},
        {x: 395, y: 383, width: 100, height: 20, type: "ICE"},
        {x: 491, y: 385, width: 100, height: 20, type: "ICE"},
        {x: 678, y: 372, width: 100, height: 20, type: "TRAMPOLINE"}
    ],
    traps: [

    ],
    enemies: [
        {x: 577, y: 349, width: 50, height: 40, type: "LION", patrolDistance: 218, speed: 1}
    ],
    puppy: {
        x: 689, 
        y: 47, 
        width: 100, 
        height: 20, 
        saved: false
    },
    collectibles: [
        {x: 448, y: 251, width: 30, height: 30},
        {x: 52, y: 356, width: 30, height: 30, type: "PEPPER"}
    ]
},
        {
    name: "Wordt niet gepakt!!!",
    theme: "night",
    allowedAnimals: ["UNICORN","CAT"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 18, y: 74, width: 100, height: 20, type: "NORMAL"},
        {x: 644, y: 90, width: 100, height: 20, type: "NORMAL"},
        {x: 248, y: 190, width: 100, height: 20, type: "NORMAL"},
        {x: 391, y: 91, width: 100, height: 20, type: "NORMAL"},
        {x: 389, y: 116, width: 100, height: 20, type: "WATER"},
        {x: 251, y: 213, width: 100, height: 20, type: "WATER"},
        {x: 19, y: 97, width: 100, height: 20, type: "WATER"},
        {x: 642, y: 118, width: 100, height: 20, type: "WATER"},
        {x: 560, y: 273, width: 100, height: 20, type: "NORMAL"},
        {x: 18, y: 119, width: 100, height: 20, type: "NORMAL"},
        {x: 250, y: 238, width: 100, height: 20, type: "NORMAL"},
        {x: 390, y: 141, width: 100, height: 20, type: "NORMAL"},
        {x: 648, y: 141, width: 100, height: 20, type: "NORMAL"},
        {x: 559, y: 295, width: 100, height: 20, type: "WATER"},
        {x: 562, y: 323, width: 100, height: 20, type: "NORMAL"},
        {x: 1, y: 378, width: 100, height: 20, type: "NORMAL"},
        {x: 106, y: 378, width: 100, height: 20, type: "NORMAL"}
    ],
    traps: [

    ],
    enemies: [
        {x: 18, y: 12, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 1},
        {x: 253, y: 352, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 1},
        {x: 644, y: 30, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 1},
        {x: 254, y: 134, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1},
        {x: 459, y: 361, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1},
        {x: 397, y: 41, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 560, 
        y: 248, 
        width: 100, 
        height: 20, 
        saved: false
    },
    collectibles: [
        {x: 50, y: 167, width: 30, height: 30}
    ]
},
        {
    name: "Raak de spikes niet aan!!!",
    allowedAnimals: ["TURTLE","UNICORN","CAT"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 423, y: 167, width: 100, height: 20, type: "NORMAL"},
        {x: 316, y: 185, width: 100, height: 20, type: "NORMAL"},
        {x: 76, y: 381, width: 100, height: 20, type: "CLIMB"},
        {x: -18, y: 381, width: 100, height: 20, type: "CLIMB"},
        {x: 210, y: 185, width: 100, height: 20, type: "CLOUD"},
        {x: 98, y: 188, width: 100, height: 20, type: "CLOUD"},
        {x: -5, y: 191, width: 100, height: 20, type: "CLOUD"},
        {x: 410, y: 180, width: 100, height: 20, type: "CLOUD"},
        {x: 529, y: 190, width: 100, height: 20, type: "CLOUD"},
        {x: 635, y: 190, width: 100, height: 20, type: "CLOUD"},
        {x: 718, y: 189, width: 100, height: 20, type: "CLOUD"},
        {x: 572, y: 191, width: 100, height: 20, type: "CLOUD"},
        {x: 490, y: 186, width: 100, height: 20, type: "CLOUD"},
        {x: 168, y: 187, width: 100, height: 20, type: "CLOUD"},
        {x: 49, y: 191, width: 100, height: 20, type: "CLOUD"},
        {x: 128, y: 188, width: 100, height: 20, type: "CLOUD"},
        {x: 209, y: 191, width: 100, height: 20, type: "CLOUD"},
        {x: 180, y: 314, width: 619, height: 85, type: "WATER"}
    ],
    traps: [
        {x: 178, y: 381, width: 622, height: 20, type: "SPIKES"}
    ],
    enemies: [
        {x: 341, y: 306, width: 60, height: 50, type: "PIRANHA", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 457, 
        y: 140, 
        width: 44, 
        height: 29, 
        saved: false
    },
    collectibles: [
        {x: 475, y: 314, width: 30, height: 30}
    ]
},
        {
    name: "Pak de sterren!!!",
    allowedAnimals: ["SQUIRREL","TURTLE","UNICORN","CAT"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 225, y: 379, width: 100, height: 20, type: "WATER"},
        {x: 265, y: 378, width: 100, height: 20, type: "WATER"},
        {x: 408, y: 381, width: 100, height: 20, type: "WATER"},
        {x: 443, y: 380, width: 100, height: 20, type: "WATER"},
        {x: 587, y: 380, width: 100, height: 20, type: "WATER"},
        {x: 649, y: 33, width: 151, height: 363, type: "WATER"},
        {x: 50, y: 85, width: 100, height: 20, type: "CLOUD"},
        {x: 225, y: 82, width: 100, height: 20, type: "CLOUD"},
        {x: 414, y: 84, width: 100, height: 20, type: "CLOUD"},
        {x: 42, y: 195, width: 100, height: 20, type: "CLOUD"},
        {x: 236, y: 188, width: 100, height: 20, type: "CLOUD"},
        {x: 440, y: 185, width: 100, height: 20, type: "CLOUD"},
        {x: 31, y: 294, width: 100, height: 20, type: "CLOUD"},
        {x: 245, y: 294, width: 100, height: 20, type: "CLOUD"},
        {x: 442, y: 279, width: 100, height: 20, type: "CLOUD"},
        {x: 136, y: 142, width: 100, height: 20, type: "CLOUD"},
        {x: 143, y: 251, width: 100, height: 20, type: "CLOUD"},
        {x: 340, y: 239, width: 100, height: 20, type: "CLOUD"},
        {x: 332, y: 140, width: 100, height: 20, type: "CLOUD"},
        {x: 325, y: 23, width: 100, height: 20, type: "CLOUD"},
        {x: 137, y: 30, width: 100, height: 20, type: "CLOUD"},
        {x: 520, y: 130, width: 100, height: 20, type: "CLOUD"},
        {x: 510, y: 25, width: 100, height: 20, type: "CLOUD"},
        {x: 521, y: 234, width: 100, height: 20, type: "CLOUD"},
        {x: -46, y: 248, width: 100, height: 20, type: "CLOUD"},
        {x: -26, y: 138, width: 100, height: 20, type: "CLOUD"},
        {x: -23, y: 33, width: 100, height: 20, type: "CLOUD"},
        {x: -23, y: 164, width: 100, height: 20, type: "TREE"},
        {x: 50, y: 98, width: 100, height: 20, type: "TREE"},
        {x: 133, y: 162, width: 100, height: 20, type: "TREE"},
        {x: 43, y: 213, width: 100, height: 20, type: "TREE"},
        {x: -43, y: 267, width: 100, height: 20, type: "TREE"},
        {x: 29, y: 316, width: 100, height: 20, type: "TREE"},
        {x: 138, y: 274, width: 100, height: 20, type: "TREE"},
        {x: 242, y: 315, width: 100, height: 20, type: "TREE"},
        {x: 339, y: 256, width: 100, height: 20, type: "TREE"},
        {x: 438, y: 301, width: 100, height: 20, type: "TREE"},
        {x: 523, y: 258, width: 100, height: 20, type: "TREE"},
        {x: 439, y: 207, width: 100, height: 20, type: "TREE"},
        {x: 521, y: 148, width: 100, height: 20, type: "TREE"},
        {x: 418, y: 107, width: 100, height: 20, type: "TREE"},
        {x: 333, y: 164, width: 100, height: 20, type: "TREE"},
        {x: 234, y: 204, width: 100, height: 20, type: "TREE"},
        {x: 231, y: 100, width: 100, height: 20, type: "TREE"},
        {x: 513, y: 47, width: 100, height: 20, type: "TREE"},
        {x: 329, y: 41, width: 100, height: 20, type: "TREE"},
        {x: 140, y: 49, width: 100, height: 20, type: "TREE"},
        {x: -24, y: 53, width: 100, height: 20, type: "TREE"}
    ],
    traps: [
        {x: 183, y: 379, width: 40, height: 20, type: "SPIKES"},
        {x: 365, y: 380, width: 40, height: 20, type: "SPIKES"},
        {x: 548, y: 382, width: 40, height: 20, type: "SPIKES"},
        {x: 761, y: 377, width: 40, height: 20, type: "SPIKES"}
    ],
    enemies: [

    ],
    puppy: {
        x: 762, 
        y: 25, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 763, y: 20, width: 30, height: 30},
        {x: 94, y: 38, width: 30, height: 30},
        {x: 268, y: 34, width: 30, height: 30},
        {x: 453, y: 32, width: 30, height: 30},
        {x: 556, y: 82, width: 30, height: 30},
        {x: 373, y: 97, width: 30, height: 30},
        {x: 275, y: 136, width: 30, height: 30},
        {x: 172, y: 100, width: 30, height: 30},
        {x: 92, y: 141, width: 30, height: 30},
        {x: 10, y: 98, width: 30, height: 30},
        {x: 79, y: 242, width: 30, height: 30},
        {x: 8, y: 211, width: 30, height: 30},
        {x: 165, y: 204, width: 30, height: 30},
        {x: 267, y: 241, width: 30, height: 30},
        {x: 354, y: 190, width: 30, height: 30},
        {x: 468, y: 241, width: 30, height: 30},
        {x: 562, y: 294, width: 30, height: 30},
        {x: 569, y: 188, width: 30, height: 30},
        {x: 463, y: 147, width: 30, height: 30},
        {x: 161, y: 320, width: 30, height: 30}
    ]
},
        {
    name: "Zwemmen!!!",
    music: "pixel-fight-8-bit-arcade-music-background-music-for-video-208775.mp3",
    allowedAnimals: ["TURTLE","UNICORN","CAT"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 26, y: 25, width: 100, height: 20, type: "CLOUD"},
        {x: 31, y: 98, width: 100, height: 20, type: "CLOUD"},
        {x: 32, y: 168, width: 100, height: 20, type: "CLOUD"},
        {x: 28, y: 253, width: 100, height: 20, type: "CLOUD"},
        {x: 175, y: 96, width: 625, height: 354, type: "WATER"}
    ],
    traps: [
        {x: 407, y: 209, width: 40, height: 20, type: "SPIKES"},
        {x: 288, y: 212, width: 40, height: 20, type: "SPIKES"},
        {x: 515, y: 53, width: 40, height: 20, type: "SPIKES"},
        {x: 290, y: 24, width: 40, height: 20, type: "SPIKES"},
        {x: 526, y: 360, width: 40, height: 20, type: "SPIKES"},
        {x: 734, y: 360, width: 40, height: 20, type: "SPIKES"},
        {x: 185, y: 312, width: 40, height: 20, type: "SPIKES"},
        {x: 224, y: 156, width: 40, height: 20, type: "SPIKES"},
        {x: 725, y: 214, width: 40, height: 20, type: "SPIKES"}
    ],
    enemies: [
        {x: 589, y: 146, width: 50, height: 40, type: "PIRANHA", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 350, 
        y: 375, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 757, y: 80, width: 30, height: 30}
    ]
},
        {
    name: "Spring maar naar boven!!!",
    theme: "night",
    allowedAnimals: ["TURTLE","CAT"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 309, y: 369, width: 100, height: 20, type: "TRAMPOLINE"},
        {x: 309, y: 157, width: 100, height: 20, type: "LASER"},
        {x: 162, y: 300, width: 44, height: 30, type: "NUMBER", numberValue: 9},
        {x: 205, y: 300, width: 44, height: 30, type: "NUMBER", numberValue: 5},
        {x: 115, y: 300, width: 44, height: 30, type: "NUMBER", numberValue: 2}
    ],
    traps: [

    ],
    enemies: [
        {x: 661, y: 344, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 0.8}
    ],
    puppy: {
        x: 347, 
        y: 232, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 343, y: 184, width: 30, height: 30, type: "STAR"}
    ],
    mathProblems: [
        {
            equation: "5 x 5 =",
            answer: "25",
            userAnswer: ""
        },
        {
            equation: "80 + 12 =",
            answer: "92",
            userAnswer: ""
        },
        {
            equation: "11 x 5 =",
            answer: "55",
            userAnswer: ""
        }
    ]
},
        {
    name: "Wat veel sterren!!!",
    allowedAnimals: ["TURTLE","UNICORN","CAT"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 238, y: 365, width: 553, height: 26, type: "TRAMPOLINE"},
        {x: 296, y: 189, width: 100, height: 20, type: "LASER"}
    ],
    traps: [

    ],
    enemies: [

    ],
    puppy: {
        x: 447, 
        y: 188, 
        width: 100, 
        height: 20, 
        saved: false
    },
    collectibles: [
        {x: 273, y: 149, width: 30, height: 30},
        {x: 340, y: 142, width: 30, height: 30},
        {x: 401, y: 138, width: 30, height: 30},
        {x: 467, y: 135, width: 30, height: 30},
        {x: 535, y: 143, width: 30, height: 30},
        {x: 597, y: 144, width: 30, height: 30},
        {x: 661, y: 144, width: 30, height: 30},
        {x: 270, y: 233, width: 30, height: 30},
        {x: 322, y: 231, width: 30, height: 30},
        {x: 379, y: 228, width: 30, height: 30},
        {x: 433, y: 220, width: 30, height: 30},
        {x: 496, y: 224, width: 30, height: 30},
        {x: 552, y: 225, width: 30, height: 30},
        {x: 623, y: 218, width: 30, height: 30},
        {x: 695, y: 218, width: 30, height: 30},
        {x: 715, y: 153, width: 30, height: 30},
        {x: 742, y: 215, width: 30, height: 30}
    ]
},
        {
    name: "Nieuw Level",
    allowedAnimals: ["SQUIRREL","TURTLE","UNICORN","CAT"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 703, y: 90, width: 100, height: 20, type: "WATER"},
        {x: 704, y: 154, width: 100, height: 20, type: "WATER"},
        {x: 703, y: 217, width: 100, height: 20, type: "WATER"},
        {x: 695, y: 286, width: 100, height: 20, type: "WATER"}
    ],
    traps: [
        {x: 151, y: 378, width: 161, height: 20, type: "FIRE"}
    ],
    enemies: [
        {x: 444, y: 355, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1},
        {x: 606, y: 359, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1},
        {x: 235, y: 5, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1},
        {x: 420, y: 1, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1},
        {x: 639, y: 4, width: 50, height: 40, type: "DRAGON", patrolDistance: 100, speed: 1},
        {x: 314, y: -7, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 1},
        {x: 330, y: 351, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 1},
        {x: 505, y: 348, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 1},
        {x: 659, y: 348, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 763, 
        y: 370, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 770, y: 119, width: 30, height: 30, type: "STAR"}
    ]
},
        {
    name: "Lopende banden",
    music: "retro-8bit-happy-videogame-music-243997.mp3",
    allowedAnimals: ["UNICORN","CAT"],
    startPositions: [
        {x: 223, y: 54},
        {x: 625, y: 58}
    ],
    platforms: [
        {x: 201, y: 92, width: 100, height: 20, type: "TREADMILL", speed: 2},
        {x: 309, y: 153, width: 100, height: 20, type: "TREADMILL", speed: 4},
        {x: 617, y: 98, width: 100, height: 20, type: "TREADMILL", speed: -2},
        {x: 514, y: 154, width: 100, height: 20, type: "TREADMILL", speed: -2}
    ],
    traps: [

    ],
    enemies: [

    ],
    puppy: {
        x: 350, 
        y: 375, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 650, y: 150, width: 30, height: 30, type: "STAR"}
    ]
},
        {
    name: "Trampoline park",
    music: "best-game-console-301284.mp3",
    theme: "day",
    allowedAnimals: ["SQUIRREL","TURTLE"],
    startPositions: [
        {x: 35, y: 372},
        {x: 97, y: 372}
    ],
    platforms: [
        {x: 207, y: 177, width: 121, height: 221, type: "CLIMB"},
        {x: 212, y: 157, width: 100, height: 20, type: "TRAMPOLINE"},
        {x: 128, y: 369, width: 100, height: 20, type: "TRAMPOLINE"},
        {x: 464, y: 133, width: 219, height: 101, type: "WATER"},
        {x: 87, y: 327, width: 25, height: 20, type: "NUMBER", numberValue: 81},
        {x: 32, y: 329, width: 25, height: 20, type: "NUMBER", numberValue: 70}
    ],
    traps: [

    ],
    enemies: [

    ],
    puppy: {
        x: 350, 
        y: 375, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 650, y: 150, width: 30, height: 30, type: "STAR"}
    ],
    mathProblems: [
        {
            equation: "9x9=",
            answer: "81",
            userAnswer: ""
        },
        {
            equation: "10x7=",
            answer: "70",
            userAnswer: ""
        }
    ]
},
        {
    name: "Fireball!!!",
    music: "level-vii-short-258782.mp3",
    theme: "night",
    allowedAnimals: ["SQUIRREL","TURTLE","UNICORN","CAT","MOLE"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 694, y: 104, width: 100, height: 20, type: "CLOUD"},
        {x: 430, y: 300, width: 20, height: 100, type: "TREE"},
        {x: 431, y: 196, width: 20, height: 100, type: "TREE"},
        {x: 723, y: 298, width: 20, height: 100, type: "TREE"},
        {x: 729, y: 192, width: 20, height: 100, type: "TREE"},
        {x: 205, y: 187, width: 20, height: 100, type: "TREE"},
        {x: 228, y: 198, width: 200, height: 200, type: "WATER"},
        {x: 205, y: 294, width: 20, height: 100, type: "TREE"}
    ],
    traps: [
        {x: 679, y: 374, width: 40, height: 20, type: "FIRE"},
        {x: 635, y: 374, width: 40, height: 20, type: "FIRE"},
        {x: 745, y: 375, width: 40, height: 20, type: "FIRE"},
        {x: 681, y: 351, width: 40, height: 20, type: "SPIKES"},
        {x: 637, y: 357, width: 40, height: 20, type: "SPIKES"},
        {x: 744, y: 350, width: 40, height: 20, type: "SPIKES"}
    ],
    enemies: [
        {x: 308, y: 356, width: 40, height: 35, type: "PIRANHA", patrolDistance: 100, speed: 1},
        {x: 453, y: 355, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 696, 
        y: 79, 
        width: 100, 
        height: 20, 
        saved: false
    },
    collectibles: [
        {x: 767, y: 42, width: 30, height: 30, type: "STAR"},
        {x: 724, y: 43, width: 30, height: 30, type: "STAR"},
        {x: 689, y: 42, width: 30, height: 30, type: "STAR"},
        {x: 15, y: 20, width: 30, height: 30, type: "STAR"},
        {x: 722, y: 157, width: 30, height: 30, type: "HOURGLASS"},
        {x: 427, y: 144, width: 30, height: 30, type: "PEPPER"},
        {x: 205, y: 138, width: 30, height: 30, type: "DOGFOOD"},
        {x: 329, y: 335, width: 30, height: 30, type: "STAR"},
        {x: 751, y: 306, width: 30, height: 30, type: "STAR"}
    ]
},
        {
    name: "Gellukkig!!!",
    music: "retro-8bit-happy-videogame-music-243997.mp3",
    theme: "night",
    allowedAnimals: ["SQUIRREL","TURTLE","MOLE"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 402, y: 370, width: 100, height: 20, type: "TRAMPOLINE"},
        {x: 570, y: 313, width: 25, height: 20, type: "NUMBER", numberValue: 1},
        {x: 601, y: 313, width: 25, height: 20, type: "NUMBER", numberValue: 2},
        {x: 632, y: 313, width: 25, height: 20, type: "NUMBER", numberValue: 8}
    ],
    traps: [

    ],
    enemies: [
        {x: 201, y: 360, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 770, 
        y: 374, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 33, y: 365, width: 30, height: 30, type: "PEPPER"},
        {x: 78, y: 365, width: 30, height: 30, type: "PEPPER"},
        {x: 439, y: 215, width: 30, height: 30, type: "STAR"}
    ],
    mathProblems: [
        {
            equation: "2x14=",
            answer: "28",
            userAnswer: ""
        },
        {
            equation: "4+14=",
            answer: "18",
            userAnswer: ""
        }
    ]
},
        {
    name: "Reken uit...",
    music: "default.mp3",
    theme: "night",
    allowedAnimals: ["UNICORN","CAT"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 38, y: 305, width: 25, height: 20, type: "NUMBER", numberValue: 4},
        {x: 97, y: 306, width: 25, height: 20, type: "NUMBER", numberValue: 8}
    ],
    traps: [

    ],
    enemies: [
        {x: 512, y: 345, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 765, 
        y: 372, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 650, y: 150, width: 30, height: 30, type: "STAR"}
    ]
},
        {
    name: "Druk op spatie!!!",
    music: "level-vii-short-258782.mp3",
    theme: "night",
    allowedAnimals: ["SQUIRREL","TURTLE","UNICORN","CAT","MOLE"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 337, y: 144, width: 100, height: 20, type: "CLOUD"},
        {x: 91, y: 305, width: 25, height: 20, type: "NUMBER", numberValue: 12},
        {x: 39, y: 305, width: 25, height: 20, type: "NUMBER", numberValue: 10}
    ],
    traps: [

    ],
    enemies: [
        {x: 643, y: 354, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1},
        {x: 478, y: 352, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1},
        {x: 247, y: 357, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1},
        {x: 340, y: 353, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 1},
        {x: 546, y: 350, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 1},
        {x: 145, y: 349, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 729, 
        y: 374, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 82, y: 368, width: 30, height: 30, type: "PEPPER"},
        {x: 29, y: 368, width: 30, height: 30, type: "PEPPER"},
        {x: 376, y: 98, width: 30, height: 30, type: "STAR"}
    ],
    mathProblem: {
        equation: "6+6=",
        answer: "12",
        userAnswer: ""
    }
},
        {
    name: "Nieuw Level",
    music: "default.mp3",
    theme: "night",
    allowedAnimals: ["CAT","MOLE"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 355, y: 370, width: 100, height: 20, type: "TRAMPOLINE"},
        {x: 281, y: 198, width: 25, height: 200, type: "VERTICAL"},
        {x: 421, y: 236, width: 25, height: 20, type: "NUMBER", numberValue: 3},
        {x: 355, y: 235, width: 25, height: 20, type: "NUMBER", numberValue: 2},
        {x: 452, y: 236, width: 25, height: 20, type: "NUMBER", numberValue: 7},
        {x: 323, y: 235, width: 25, height: 20, type: "NUMBER", numberValue: 1}
    ],
    traps: [

    ],
    enemies: [
        {x: 500, y: 353, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 766, 
        y: 368, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 391, y: 188, width: 30, height: 30, type: "STAR"}
    ],
    mathProblems: [
        {
            equation: "3x9=",
            answer: "27",
            userAnswer: ""
        }
    ]
}
    ];
}