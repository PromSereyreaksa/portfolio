/**
 * Game Configuration
 *
 * This file contains global game settings that can be easily modified.
 * Centralizing these values makes it easier to tweak game parameters.
 */

// Player settings
export const PLAYER_SETTINGS = {
  SPEED: 150, // Player movement speed
  SPRITE_WIDTH: 192,
  SPRITE_HEIGHT: 192,
  SPRITE_ROWS: 4, // Number of rows in the spritesheet
  SPRITE_COLS: 5, // Number of columns in the spritesheet
  SPRITE_SHEET: "/images/player.png", // Path to the player spritesheet
  SPRITE_SIZE: 16, // Size of each sprite in the spritesheet
  DEFAULT_SIZE: 15, // Default rendered size of player
  ANIMATION_SPEED: 0.15, // Frames per second for animation
}

// NPC settings
export const NPC_SETTINGS = {
  SPEED: 50, // NPC movement speed
  SPRITE_SIZE: 16, // Size of each sprite in the spritesheet
  DEFAULT_SIZE: 15, // Default rendered size of NPC
  ANIMATION_SPEED: 0.2, // Frames per second for animation
  INTERACTION_DISTANCE: 30, // Distance at which player can interact with NPCs
  PATROL_WAIT_TIME: 2, // Seconds to wait at each patrol point
}

// Game world settings
export const WORLD_SETTINGS = {
  TILE_SIZE: 16, // Size of each tile in pixels
  CANVAS_WIDTH: 1024, // Default canvas width
  CANVAS_HEIGHT: 576, // Default canvas height
}

// Asset paths
export const ASSET_PATHS = {
  PLAYER: "/images/player.png",
  CHARACTERS: "/images/characters.png",
  TERRAIN: "/images/terrain.png",
  DECORATIONS: "/images/decorations.png",
}

// Debug settings
export const DEBUG_SETTINGS = {
  SHOW_COLLISION_BOXES: true,
  SHOW_NPC_PATHS: false,
  LOG_LEVEL: "info", // "debug", "info", "warn", "error"
}

