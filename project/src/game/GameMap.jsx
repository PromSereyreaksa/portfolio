/**
 * GameMap Class
 *
 * Handles map rendering and collision detection
 */

import { WORLD_SETTINGS } from "../game-config.jsx"

export class GameMap {
  constructor(layers, tilesets) {
    this.layers = layers
    this.tilesets = tilesets
    this.tileSize = WORLD_SETTINGS.TILE_SIZE
    this.collisionMap = []
    this.backgroundCanvas = null

    // Initialize collision map
    this.initCollisionMap()
  }

  initCollisionMap() {
    // Extract collision data from layers
    if (this.layers.collisions) {
      this.layers.collisions.forEach((row, y) => {
        row.forEach((symbol, x) => {
          if (symbol === 1) {
            this.collisionMap.push({
              x: x * this.tileSize,
              y: y * this.tileSize,
              width: this.tileSize,
              height: this.tileSize,
            })
          }
        })
      })
    }
  }

  async renderToCanvas(width, height, progressCallback) {
    // Create offscreen canvas for static map elements
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")

    // Fill with a background color first
    ctx.fillStyle = "#6b7280" // Medium gray
    ctx.fillRect(0, 0, width, height)

    // Get layer names and count for progress tracking
    const layerNames = Object.keys(this.layers)
    const totalLayers = layerNames.length
    let loadedLayers = 0

    // Render each layer
    for (const layerName of layerNames) {
      // Skip collision layer as it's not visual
      if (layerName === "collisions" || layerName === "l_Collisions") {
        loadedLayers++
        if (progressCallback) {
          progressCallback(Math.floor((loadedLayers / totalLayers) * 100))
        }
        continue
      }

      const tilesetInfo = this.tilesets[layerName]
      if (tilesetInfo) {
        try {
          // Load tileset image
          const tilesetImage = await this.loadImage(tilesetInfo.imageUrl)
          console.log(`Loaded tileset for ${layerName}: ${tilesetInfo.imageUrl}`)

          // Render layer
          this.renderLayer(this.layers[layerName], tilesetImage, tilesetInfo.tileSize, ctx)

          // Update progress
          loadedLayers++
          if (progressCallback) {
            progressCallback(Math.floor((loadedLayers / totalLayers) * 100))
          }
        } catch (error) {
          console.error(`Failed to load image for layer ${layerName}:`, error)

          // Create a fallback colored pattern for the missing tileset
          const patternCanvas = document.createElement("canvas")
          patternCanvas.width = 16
          patternCanvas.height = 16
          const patternCtx = patternCanvas.getContext("2d")
          patternCtx.fillStyle = "#ff00ff" // Magenta
          patternCtx.fillRect(0, 0, 8, 8)
          patternCtx.fillRect(8, 8, 8, 8)
          patternCtx.fillStyle = "#000000" // Black
          patternCtx.fillRect(0, 8, 8, 8)
          patternCtx.fillRect(8, 0, 8, 8)

          // Use the pattern to render this layer
          const pattern = ctx.createPattern(patternCanvas, "repeat")
          ctx.fillStyle = pattern
          ctx.fillRect(0, 0, width, height)

          loadedLayers++
          if (progressCallback) {
            progressCallback(Math.floor((loadedLayers / totalLayers) * 100))
          }
        }
      }
    }

    this.backgroundCanvas = canvas
    return canvas
  }

  renderLayer(tilesData, tilesetImage, tileSize, context) {
    tilesData.forEach((row, y) => {
      row.forEach((symbol, x) => {
        if (symbol !== 0) {
          const srcX = ((symbol - 1) % (tilesetImage.width / tileSize)) * tileSize
          const srcY = Math.floor((symbol - 1) / (tilesetImage.width / tileSize)) * tileSize

          context.drawImage(
            tilesetImage,
            srcX,
            srcY,
            tileSize,
            tileSize,
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize,
          )
        }
      })
    })
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      console.log(`Loading image: ${src}`)
      const img = new Image()
      img.crossOrigin = "anonymous" // Add this to handle CORS issues
      img.onload = () => {
        console.log(`Successfully loaded image: ${src}`)
        resolve(img)
      }
      img.onerror = (e) => {
        console.error(`Error loading image: ${src}`, e)
        reject(new Error(`Failed to load image: ${src}`))
      }
      img.src = src
    })
  }

  getCollisionMap() {
    return this.collisionMap || []
  }

  getBackgroundCanvas() {
    return this.backgroundCanvas
  }

  // Check if a point is in a collision area
  isCollision(x, y) {
    return this.collisionMap.some(
      (block) => x >= block.x && x < block.x + block.width && y >= block.y && y < block.y + block.height,
    )
  }
}

