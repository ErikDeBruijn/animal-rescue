// Dieren Redders - Level definities
// Dit bestand bevat alle level ontwerpen voor het spel

// Level ontwerpen - deze functie wordt aangeroepen nadat de canvas is gemaakt
function getLevels(GROUND_LEVEL) {    return [
        {
    name: "Trampoline Test",
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 300, y: 300, width: 100, height: 20, type: "TRAMPOLINE"},
        {x: 450, y: 200, width: 100, height: 20, type: "NORMAL"},
        {x: 600, y: 150, width: 100, height: 20, type: "CLOUD"},
        {x: 150, y: 200, width: 100, height: 20, type: "NORMAL"}
    ],
    traps: [],
    enemies: [],
    puppy: {
        x: 600, 
        y: 120, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 185, y: 170, width: 30, height: 30}
    ]
},
        {
    name: "Samen werken",
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 460, y: 375, width: 150, height: 20, type: "NORMAL"},
        {x: 389, y: 270, width: 150, height: 20, type: "NORMAL"},
        {x: 650, y: 376, width: 150, height: 20, type: "NORMAL"},
        {x: 613, y: 195, width: 30, height: 200, type: "TREE"},
        {x: 8, y: 357, width: 120, height: 40, type: "CLOUD"}
    ],
    traps: [
        {x: 496, y: 202, width: 115, height: 21, type: "SPIKES"},
        {x: 640, y: 198, width: 115, height: 21, type: "SPIKES"}
    ],
    enemies: [
        {x: 499, y: 150, width: 50, height: 40, type: "LION", patrolDistance: 257, speed: 1}
    ],
    puppy: {
        x: 651, 
        y: 349, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 32, y: 23, width: 30, height: 30}
    ]
},
        {
    name: "Klimmen en zwemmen",
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 699, y: 298, width: 100, height: 100, type: "CLIMB"},
        {x: 305, y: 172, width: 200, height: 40, type: "WATER"},
        {x: 109, y: 281, width: 150, height: 20, type: "NORMAL"},
        {x: 388, y: 216, width: 35, height: 180, type: "TREE"},
        {x: 219, y: 174, width: 80, height: 30, type: "CLOUD"},
        {x: 512, y: 176, width: 90, height: 35, type: "CLOUD"},
        {x: 351, y: 60, width: 100, height: 40, type: "CLOUD"}
    ],
    traps: [

    ],
    enemies: [
        {x: 482, y: 343, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 0.8}
    ],
    puppy: {
        x: 661, 
        y: 370, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 380, y: 8, width: 30, height: 30}
    ]
},
        {
    name: "Kat in het nauw",
    startPositions: [
        {x: 0, y: 0},
        {x: 0, y: 0}
    ],
    platforms: [
        {x: 383, y: 202, width: 100, height: 20, type: "NORMAL"},
        {x: 697, y: 202, width: 100, height: 20, type: "NORMAL"},
        {x: 590, y: 201, width: 100, height: 20, type: "NORMAL"},
        {x: 486, y: 200, width: 100, height: 20, type: "NORMAL"}
    ],
    traps: [
        {x: 582, y: 380, width: 40, height: 20, type: "SPIKES"},
        {x: 536, y: 379, width: 40, height: 20, type: "SPIKES"},
        {x: 401, y: 379, width: 40, height: 20, type: "SPIKES"},
        {x: 356, y: 379, width: 40, height: 20, type: "SPIKES"},
        {x: 221, y: 381, width: 40, height: 20, type: "SPIKES"},
        {x: 719, y: 380, width: 40, height: 20, type: "SPIKES"},
        {x: 761, y: 378, width: 40, height: 20, type: "SPIKES"},
        {x: 754, y: 178, width: 40, height: 20, type: "SPIKES"},
        {x: 646, y: 177, width: 40, height: 20, type: "SPIKES"},
        {x: 495, y: 178, width: 40, height: 20, type: "SPIKES"},
        {x: 178, y: 379, width: 40, height: 20, type: "SPIKES"}
    ],
    enemies: [
        {x: 388, y: 152, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1}
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
    name: "Kat in het nauw",
    startPositions: [
        {x: 0, y: 0},
        {x: 0, y: 0}
    ],
    platforms: [
        {x: 383, y: 202, width: 100, height: 20, type: "NORMAL"},
        {x: 697, y: 202, width: 100, height: 20, type: "NORMAL"},
        {x: 700, y: 282, width: 100, height: 20, type: "DRAGON"},
        {x: 590, y: 201, width: 100, height: 20, type: "NORMAL"},
        {x: 486, y: 200, width: 100, height: 20, type: "NORMAL"}
    ],
    traps: [
        {x: 582, y: 380, width: 40, height: 20, type: "SPIKES"},
        {x: 536, y: 379, width: 40, height: 20, type: "SPIKES"},
        {x: 401, y: 379, width: 40, height: 20, type: "SPIKES"},
        {x: 356, y: 379, width: 40, height: 20, type: "SPIKES"},
        {x: 221, y: 381, width: 40, height: 20, type: "SPIKES"},
        {x: 719, y: 380, width: 40, height: 20, type: "SPIKES"},
        {x: 761, y: 378, width: 40, height: 20, type: "SPIKES"},
        {x: 754, y: 178, width: 40, height: 20, type: "SPIKES"},
        {x: 646, y: 177, width: 40, height: 20, type: "SPIKES"},
        {x: 495, y: 178, width: 40, height: 20, type: "SPIKES"},
        {x: 178, y: 379, width: 40, height: 20, type: "SPIKES"}
    ],
    enemies: [
        {x: 388, y: 152, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 541, 
        y: 172, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 756, y: 332, width: 30, height: 30},
        {x: 758, y: 231, width: 30, height: 30}
    ]
},
        {
    name: "Test level",
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 551, y: 55, width: 100, height: 20, type: "DRAGON"},
        {x: 448, y: 102, width: 100, height: 20, type: "NORMAL"},
        {x: 358, y: 155, width: 100, height: 20, type: "NORMAL"},
        {x: 273, y: 216, width: 100, height: 20, type: "NORMAL"},
        {x: 169, y: 281, width: 100, height: 20, type: "NORMAL"},
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
        {x: 119, y: 339, width: 100, height: 20, type: "NORMAL"},
        {x: 279, y: 324, width: 100, height: 20, type: "NORMAL"},
        {x: 345, y: 277, width: 100, height: 20, type: "NORMAL"},
        {x: 399, y: 223, width: 100, height: 20, type: "NORMAL"},
        {x: 499, y: 152, width: 100, height: 20, type: "NORMAL"},
        {x: 203, y: 368, width: 100, height: 20, type: "NORMAL"},
        {x: 543, y: 212, width: 100, height: 20, type: "TREE"},
        {x: 354, y: 363, width: 100, height: 20, type: "NORMAL"},
        {x: 433, y: 317, width: 100, height: 20, type: "NORMAL"},
        {x: 479, y: 270, width: 100, height: 20, type: "NORMAL"},
        {x: 509, y: 365, width: 100, height: 20, type: "NORMAL"},
        {x: 574, y: 297, width: 100, height: 20, type: "TREE"}
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
        {x: 619, y: 19, width: 30, height: 30},
        {x: 581, y: 20, width: 30, height: 30},
        {x: 546, y: 16, width: 30, height: 30}
    ]
},
        {
    name: "Nieuw Level",
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
        x: 36, 
        y: 269, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 85, y: 266, width: 30, height: 30}
    ]
},
        {
    name: "Test level (Erik)",
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 297, y: 283, width: 310, height: 20, type: "NORMAL"},
        {x: 690, y: 73, width: 100, height: 20, type: "CLOUD"},
        {x: 310, y: 253, width: 100, height: 20, type: "WATER"},
        {x: 419, y: 254, width: 100, height: 20, type: "WATER"},
        {x: 527, y: 254, width: 100, height: 20, type: "WATER"},
        {x: 686, y: 97, width: 100, height: 20, type: "WATER"},
        {x: 311, y: 221, width: 100, height: 20, type: "WATER"},
        {x: 419, y: 225, width: 100, height: 20, type: "WATER"},
        {x: 525, y: 224, width: 100, height: 20, type: "WATER"},
        {x: 313, y: 188, width: 100, height: 20, type: "WATER"},
        {x: 421, y: 191, width: 100, height: 20, type: "WATER"},
        {x: 528, y: 191, width: 100, height: 20, type: "WATER"},
        {x: 313, y: 158, width: 100, height: 20, type: "WATER"},
        {x: 421, y: 156, width: 100, height: 20, type: "WATER"},
        {x: 527, y: 156, width: 100, height: 20, type: "WATER"},
        {x: 312, y: 126, width: 100, height: 20, type: "WATER"},
        {x: 419, y: 129, width: 100, height: 20, type: "WATER"},
        {x: 523, y: 127, width: 100, height: 20, type: "WATER"},
        {x: 306, y: 92, width: 100, height: 20, type: "WATER"},
        {x: 423, y: 95, width: 100, height: 20, type: "WATER"},
        {x: 521, y: 96, width: 100, height: 20, type: "CLOUD"},
        {x: 425, y: 32, width: 100, height: 20, type: "CLOUD"},
        {x: 520, y: 95, width: 100, height: 20, type: "WATER"},
        {x: 684, y: 158, width: 100, height: 20, type: "TREE"},
        {x: 687, y: 129, width: 100, height: 20, type: "NORMAL"},
        {x: 685, y: 191, width: 100, height: 20, type: "CLIMB"}
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
        {x: 467, y: 243, width: 30, height: 30}
    ]
},
        {
    name: "Nieuw Level",
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
    name: "Nieuw Level",
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 423, y: 167, width: 100, height: 20, type: "NORMAL"},
        {x: 316, y: 185, width: 100, height: 20, type: "NORMAL"},
        {x: 178, y: 361, width: 100, height: 20, type: "WATER"},
        {x: 280, y: 359, width: 100, height: 20, type: "WATER"},
        {x: 380, y: 355, width: 100, height: 20, type: "WATER"},
        {x: 483, y: 353, width: 100, height: 20, type: "WATER"},
        {x: 563, y: 347, width: 100, height: 20, type: "WATER"},
        {x: 628, y: 338, width: 100, height: 20, type: "WATER"},
        {x: 721, y: 336, width: 100, height: 20, type: "WATER"},
        {x: 550, y: 335, width: 100, height: 20, type: "WATER"},
        {x: 481, y: 334, width: 100, height: 20, type: "WATER"},
        {x: 418, y: 337, width: 100, height: 20, type: "WATER"},
        {x: 330, y: 341, width: 100, height: 20, type: "WATER"},
        {x: 262, y: 346, width: 100, height: 20, type: "WATER"},
        {x: 174, y: 341, width: 100, height: 20, type: "WATER"},
        {x: 171, y: 321, width: 100, height: 20, type: "WATER"},
        {x: 272, y: 320, width: 100, height: 20, type: "WATER"},
        {x: 261, y: 336, width: 100, height: 20, type: "WATER"},
        {x: 366, y: 323, width: 100, height: 20, type: "WATER"},
        {x: 467, y: 325, width: 100, height: 20, type: "WATER"},
        {x: 512, y: 325, width: 100, height: 20, type: "WATER"},
        {x: 619, y: 313, width: 100, height: 20, type: "WATER"},
        {x: 533, y: 313, width: 100, height: 20, type: "WATER"},
        {x: 441, y: 309, width: 100, height: 20, type: "WATER"},
        {x: 349, y: 309, width: 100, height: 20, type: "WATER"},
        {x: 285, y: 311, width: 100, height: 20, type: "WATER"},
        {x: 187, y: 309, width: 100, height: 20, type: "WATER"},
        {x: 163, y: 312, width: 100, height: 20, type: "WATER"},
        {x: 649, y: 330, width: 100, height: 20, type: "WATER"},
        {x: 605, y: 324, width: 100, height: 20, type: "WATER"},
        {x: 711, y: 311, width: 100, height: 20, type: "WATER"},
        {x: 730, y: 324, width: 100, height: 20, type: "WATER"},
        {x: 76, y: 381, width: 100, height: 20, type: "CLIMB"},
        {x: -18, y: 381, width: 100, height: 20, type: "CLIMB"},
        {x: 210, y: 185, width: 100, height: 20, type: "CLOUD"},
        {x: 98, y: 188, width: 100, height: 20, type: "CLOUD"},
        {x: -5, y: 191, width: 100, height: 20, type: "CLOUD"},
        {x: 424, y: 188, width: 100, height: 20, type: "CLOUD"},
        {x: 529, y: 190, width: 100, height: 20, type: "CLOUD"},
        {x: 635, y: 190, width: 100, height: 20, type: "CLOUD"},
        {x: 718, y: 189, width: 100, height: 20, type: "CLOUD"},
        {x: 572, y: 191, width: 100, height: 20, type: "CLOUD"},
        {x: 488, y: 189, width: 100, height: 20, type: "CLOUD"},
        {x: 168, y: 187, width: 100, height: 20, type: "CLOUD"},
        {x: 49, y: 191, width: 100, height: 20, type: "CLOUD"},
        {x: 128, y: 188, width: 100, height: 20, type: "CLOUD"},
        {x: 209, y: 191, width: 100, height: 20, type: "CLOUD"}
    ],
    traps: [
        {x: 175, y: 385, width: 40, height: 20, type: "SPIKES"},
        {x: 219, y: 383, width: 40, height: 20, type: "SPIKES"},
        {x: 263, y: 383, width: 40, height: 20, type: "SPIKES"},
        {x: 290, y: 380, width: 40, height: 20, type: "SPIKES"},
        {x: 338, y: 377, width: 40, height: 20, type: "SPIKES"},
        {x: 366, y: 377, width: 40, height: 20, type: "SPIKES"},
        {x: 403, y: 377, width: 40, height: 20, type: "SPIKES"},
        {x: 421, y: 377, width: 40, height: 20, type: "SPIKES"},
        {x: 312, y: 378, width: 40, height: 20, type: "SPIKES"},
        {x: 464, y: 378, width: 40, height: 20, type: "SPIKES"},
        {x: 493, y: 375, width: 40, height: 20, type: "SPIKES"},
        {x: 520, y: 372, width: 40, height: 20, type: "SPIKES"},
        {x: 552, y: 369, width: 40, height: 20, type: "SPIKES"},
        {x: 569, y: 384, width: 40, height: 20, type: "SPIKES"},
        {x: 612, y: 379, width: 40, height: 20, type: "SPIKES"},
        {x: 625, y: 359, width: 40, height: 20, type: "SPIKES"},
        {x: 660, y: 379, width: 40, height: 20, type: "SPIKES"},
        {x: 703, y: 381, width: 40, height: 20, type: "SPIKES"},
        {x: 755, y: 381, width: 40, height: 20, type: "SPIKES"},
        {x: 727, y: 378, width: 40, height: 20, type: "SPIKES"},
        {x: 631, y: 379, width: 40, height: 20, type: "SPIKES"},
        {x: 537, y: 378, width: 40, height: 20, type: "SPIKES"},
        {x: 498, y: 384, width: 40, height: 20, type: "SPIKES"},
        {x: 425, y: 379, width: 40, height: 20, type: "SPIKES"},
        {x: 380, y: 381, width: 40, height: 20, type: "SPIKES"},
        {x: 400, y: 380, width: 40, height: 20, type: "SPIKES"},
        {x: 342, y: 382, width: 40, height: 20, type: "SPIKES"},
        {x: 599, y: 383, width: 40, height: 20, type: "SPIKES"},
        {x: 585, y: 362, width: 40, height: 20, type: "SPIKES"},
        {x: 667, y: 358, width: 40, height: 20, type: "SPIKES"},
        {x: 690, y: 373, width: 40, height: 20, type: "SPIKES"},
        {x: 698, y: 353, width: 40, height: 20, type: "SPIKES"},
        {x: 685, y: 387, width: 40, height: 20, type: "SPIKES"},
        {x: 736, y: 357, width: 40, height: 20, type: "SPIKES"},
        {x: 765, y: 356, width: 40, height: 20, type: "SPIKES"},
        {x: 767, y: 379, width: 40, height: 20, type: "SPIKES"},
        {x: 238, y: 385, width: 40, height: 20, type: "SPIKES"},
        {x: 197, y: 383, width: 40, height: 20, type: "SPIKES"}
    ],
    enemies: [
        {x: 315, y: 120, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 456, 
        y: 133, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 457, y: 130, width: 30, height: 30}
    ]
},
        {
    name: "Nieuw Level",
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
        {x: 662, y: 378, width: 100, height: 20, type: "WATER"},
        {x: 700, y: 51, width: 100, height: 20, type: "WATER"},
        {x: 660, y: 26, width: 100, height: 20, type: "WATER"},
        {x: 652, y: 6, width: 100, height: 20, type: "WATER"},
        {x: 656, y: 41, width: 100, height: 20, type: "WATER"},
        {x: 649, y: 59, width: 100, height: 20, type: "WATER"},
        {x: 713, y: 64, width: 100, height: 20, type: "WATER"},
        {x: 645, y: 78, width: 100, height: 20, type: "WATER"},
        {x: 705, y: 83, width: 100, height: 20, type: "WATER"},
        {x: 636, y: 100, width: 100, height: 20, type: "WATER"},
        {x: 707, y: 103, width: 100, height: 20, type: "WATER"},
        {x: 631, y: 124, width: 100, height: 20, type: "WATER"},
        {x: 726, y: 125, width: 100, height: 20, type: "WATER"},
        {x: 628, y: 114, width: 100, height: 20, type: "WATER"},
        {x: 626, y: 88, width: 100, height: 20, type: "WATER"},
        {x: 626, y: 65, width: 100, height: 20, type: "WATER"},
        {x: 620, y: 42, width: 100, height: 20, type: "WATER"},
        {x: 622, y: 18, width: 100, height: 20, type: "WATER"},
        {x: 629, y: 3, width: 100, height: 20, type: "WATER"},
        {x: 637, y: 144, width: 100, height: 20, type: "WATER"},
        {x: 720, y: 144, width: 100, height: 20, type: "WATER"},
        {x: 631, y: 159, width: 100, height: 20, type: "WATER"},
        {x: 633, y: 188, width: 100, height: 20, type: "WATER"},
        {x: 633, y: 180, width: 100, height: 20, type: "WATER"},
        {x: 631, y: 203, width: 100, height: 20, type: "WATER"},
        {x: 629, y: 220, width: 100, height: 20, type: "WATER"},
        {x: 628, y: 238, width: 100, height: 20, type: "WATER"},
        {x: 625, y: 259, width: 100, height: 20, type: "WATER"},
        {x: 627, y: 277, width: 100, height: 20, type: "WATER"},
        {x: 624, y: 301, width: 100, height: 20, type: "WATER"},
        {x: 623, y: 326, width: 100, height: 20, type: "WATER"},
        {x: 623, y: 348, width: 100, height: 20, type: "WATER"},
        {x: 617, y: 362, width: 100, height: 20, type: "WATER"},
        {x: 717, y: 160, width: 100, height: 20, type: "WATER"},
        {x: 723, y: 185, width: 100, height: 20, type: "WATER"},
        {x: 723, y: 179, width: 100, height: 20, type: "WATER"},
        {x: 720, y: 197, width: 100, height: 20, type: "WATER"},
        {x: 718, y: 209, width: 100, height: 20, type: "WATER"},
        {x: 714, y: 231, width: 100, height: 20, type: "WATER"},
        {x: 713, y: 246, width: 100, height: 20, type: "WATER"},
        {x: 713, y: 266, width: 100, height: 20, type: "WATER"},
        {x: 710, y: 288, width: 100, height: 20, type: "WATER"},
        {x: 715, y: 312, width: 100, height: 20, type: "WATER"},
        {x: 713, y: 302, width: 100, height: 20, type: "WATER"},
        {x: 622, y: 316, width: 100, height: 20, type: "WATER"},
        {x: 624, y: 291, width: 100, height: 20, type: "WATER"},
        {x: 718, y: 328, width: 100, height: 20, type: "WATER"},
        {x: 719, y: 345, width: 100, height: 20, type: "WATER"},
        {x: 719, y: 357, width: 100, height: 20, type: "WATER"},
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
}
    ];
}