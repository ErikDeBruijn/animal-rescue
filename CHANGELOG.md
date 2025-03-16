# Animal Rescue Game Changelog

## 2025-03-16: Code Restructuring

### Added
- New `game-characters.js` file containing all character rendering functions
  - Separated player, enemy and puppy rendering from `game-rendering.js`
  - More logical separation of concerns

### Modified
- `game-rendering.js` now focuses solely on environment rendering
  - Background, platforms, collectibles, etc.
- `game.js` updated to use the new character rendering functions
- Improved code organization and readability

### Removed
- Unused multiplayer code from `game-entities.js`
- Removed references to multiplayer functionality that wasn't actively used

### Kept
- Dragon fire breathing and all current gameplay functionality
- All existing animal types and their special abilities