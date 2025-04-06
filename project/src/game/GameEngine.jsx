/**
 * GameEngine Class
 *
 * Central game engine that coordinates all game systems
 */

import { GameMap } from "./GameMap.jsx"
import { InputHandler } from "./InputHandler.jsx"
import { CollisionSystem } from "./CollisionSystem.jsx"
import { Player } from "./Player.jsx"
import { NPC } from "./NPC.jsx"
import { WORLD_SETTINGS, PLAYER_SETTINGS, ASSET_PATHS } from "../game-config.jsx"
import { loadImage } from "../utils/gameUtils.jsx"
import logger from "../utils/logger.jsx"

export class GameEngine {
  constructor(canvasRef, onInteraction) {
    this.canvasRef = canvasRef
    this.onInteraction = onInteraction
    this.ctx = null
    this.dpr = window.devicePixelRatio || 1

    // Game systems
    this.inputHandler = new InputHandler()
    this.collisionSystem = new CollisionSystem()
    this.gameMap = null

    // Game entities
    this.player = null
    this.npcs = []

    // Game state
    this.isInitialized = false
    this.isPaused = false
    this.lastTime = 0
    this.interactionDistance = 30
  }

  async init(mapData, tilesets, progressCallback) {
    logger.info("GameEngine", "Initializing game engine")

    // Set up canvas
    const canvas = this.canvasRef.current
    if (!canvas) {
      logger.error("GameEngine", "Canvas reference is null")
      return false
    }

    this.ctx = canvas.getContext("2d", { alpha: false })

    // Set canvas dimensions properly
    const displayWidth = WORLD_SETTINGS.CANVAS_WIDTH
    const displayHeight = WORLD_SETTINGS.CANVAS_HEIGHT
    canvas.width = displayWidth * this.dpr
    canvas.height = displayHeight * this.dpr
    canvas.style.width = `${displayWidth}px`
    canvas.style.height = `${displayHeight}px`
    this.ctx.scale(this.dpr, this.dpr)

    try {
      // Load assets first
      const playerSprite = await this.loadAsset(ASSET_PATHS.CHARACTERS, "Player sprite")
      if (!playerSprite) return false

      progressCallback(10) // Update progress after loading player sprite

      // Initialize map
      this.gameMap = new GameMap(mapData, tilesets)
      await this.gameMap.renderToCanvas(displayWidth, displayHeight, (progress) => {
        // Scale progress to be between 10-90%
        progressCallback(10 + Math.floor(progress * 0.8))
      })

      // Set collision map
      this.collisionSystem.setCollisionMap(this.gameMap.getCollisionMap())

      // Create player
      this.player = new Player({
        x: 200,
        y: 200,
        size: PLAYER_SETTINGS.DEFAULT_SIZE,
        spritesheet: playerSprite,
      })
      this.collisionSystem.registerEntity(this.player)

      // Create NPCs
      await this.createNPCs()
      progressCallback(100) // Complete progress

      // Draw initial frame
      this.render()

      this.isInitialized = true
      logger.info("GameEngine", "Game engine initialized successfully")
      return true
    } catch (error) {
      logger.error("GameEngine", "Failed to initialize game engine", error)
      return false
    }
  }

  // Helper method to load assets with error handling
  async loadAsset(src, name) {
    try {
      logger.info("GameEngine", `Loading asset: ${name} from ${src}`)
      return await loadImage(src)
    } catch (error) {
      logger.error("GameEngine", `Failed to load asset: ${name}`, error)
      // Create a fallback colored rectangle as placeholder
      const canvas = document.createElement("canvas")
      canvas.width = 64
      canvas.height = 64
      const ctx = canvas.getContext("2d")
      ctx.fillStyle = "magenta" // Visible error color
      ctx.fillRect(0, 0, 64, 64)

      const img = new Image()
      img.src = canvas.toDataURL()
      return img
    }
  }

  async createNPCs() {
    const characterSprite = await loadImage(ASSET_PATHS.CHARACTERS)

    const npcConfigs = [
      {
        id: 1,
        x: 300,
        y: 150,
        spriteRow: 1,
        name: "Village Elder",
        dialog: [
          "Welcome to our village, traveler!",
          "Feel free to explore and talk to the locals.",
          "If you need any help, just ask around.",
        ],
      },
      {
        id: 2,
        x: 500,
        y: 300,
        spriteRow: 2,
        name: "Merchant",
        dialog: [
          "Hello there! Looking to trade?",
          "I have the finest goods in the region!",
          "Come back when you have something to sell.",
        ],
        movementPattern: "patrol",
        patrolPoints: [
          { x: 500, y: 300 },
          { x: 550, y: 300 },
          { x: 550, y: 350 },
          { x: 500, y: 350 },
        ],
      },
      {
        id: 3,
        x: 150,
        y: 400,
        spriteRow: 3,
        name: "Farmer",
        dialog: [
          "The crops are growing well this season.",
          "We might have a bountiful harvest if the weather holds.",
          "Do you know anything about farming?",
        ],
      },
    ]

    this.npcs = npcConfigs.map((config) => {
      const npc = new NPC({
        id: config.id,
        x: config.x,
        y: config.y,
        size: PLAYER_SETTINGS.DEFAULT_SIZE,
        spritesheet: characterSprite,
        spriteRow: config.spriteRow,
        name: config.name,
        dialog: config.dialog,
        movementPattern: config.movementPattern || "static",
        patrolPoints: config.patrolPoints || [],
      })

      this.collisionSystem.registerEntity(npc)
      return npc
    })

    logger.info("GameEngine", `Created ${this.npcs.length} NPCs`)
  }

  update(deltaTime) {
    if (!this.isInitialized || this.isPaused) return

    // Get input
    this.player.handleInput(this.inputHandler.keys)

    // Check for interaction
    if (this.inputHandler.isActionJustPressed()) {
      this.checkInteractions()
    }

    // Update entities
    this.player.update(deltaTime, this.gameMap?.getCollisionMap() || [])
    this.npcs.forEach((npc) => npc.update(deltaTime, this.gameMap?.getCollisionMap() || [], this.player))

    // Update collision system
    // this.collisionSystem.update()
  }

  render() {
    if (!this.isInitialized || !this.ctx) return

    const ctx = this.ctx
    const width = this.canvasRef.current.width / this.dpr
    const height = this.canvasRef.current.height / this.dpr

    // Clear canvas with a background color to verify it's working
    ctx.fillStyle = "#4a5568" // Dark gray background
    ctx.fillRect(0, 0, width, height)

    // Draw background
    const backgroundCanvas = this.gameMap?.getBackgroundCanvas()
    if (backgroundCanvas) {
      ctx.drawImage(backgroundCanvas, 0, 0, width, height)
    } else {
      logger.warn("GameEngine", "Background canvas is null")
    }

    // Draw NPCs
    this.npcs.forEach((npc) => {
      npc.draw(ctx)

      // Draw interaction indicator
      if (this.isNPCInRange(npc)) {
        ctx.fillStyle = "white"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Press E to talk", npc.x + npc.width / 2, npc.y - 10)
      }
    })

    // Draw player
    this.player?.draw(ctx)

    // Draw debug information if enabled
    this.collisionSystem.drawDebug(ctx)
  }

  isNPCInRange(npc) {
    const dx = this.player.x - npc.x
    const dy = this.player.y - npc.y
    const distanceSquared = dx * dx + dy * dy
    return distanceSquared <= this.interactionDistance * this.interactionDistance
  }

  checkInteractions() {
    // Find the closest NPC in range
    const nearbyNPC = this.npcs.find((npc) => this.isNPCInRange(npc))

    if (nearbyNPC) {
      logger.debug("GameEngine", `Interacting with NPC: ${nearbyNPC.name}`)
      this.onInteraction(nearbyNPC)
    }
  }

  setPaused(isPaused) {
    this.isPaused = isPaused
  }

  cleanup() {
    this.inputHandler.cleanup()
    logger.info("GameEngine", "Game engine resources cleaned up")
  }
}

