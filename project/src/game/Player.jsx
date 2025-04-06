import { PLAYER_SETTINGS } from "../game-config.jsx"

const { SPEED, SPRITE_SIZE, ANIMATION_SPEED } = PLAYER_SETTINGS

export class Player {
  constructor({ x, y, size, spritesheet }) {
    this.x = x
    this.y = y
    this.width = size
    this.height = size
    this.velocity = { x: 0, y: 0 }
    this.spritesheet = spritesheet
    this.spriteSize = SPRITE_SIZE
    this.frameX = 0 // Current frame in animation
    this.frameY = 0 // Direction (0: down, 1: up, 2: left, 3: right)
    this.animationSpeed = ANIMATION_SPEED
    this.animationTimer = 0
    this.moving = false
  }

  // Add this method to handle movement direction from InputHandler
  handleMovement(direction) {
    this.velocity.x = 0
    this.velocity.y = 0
    this.moving = false
  
    if (direction.x !== 0 || direction.y !== 0) {
      this.moving = true
    }
  
    if (direction.x > 0) {
      this.velocity.x = SPEED
      this.frameY = 1 // Right-facing
    } else if (direction.x < 0) {
      this.velocity.x = -SPEED
      this.frameY = 1 // Left-facing
    }
  
    if (direction.y < 0) {
      this.velocity.y = -SPEED
  
      // Only override direction if not also moving left/right
      if (direction.x === 0) {
        this.frameY = 1 // Up-facing
      }
    } else if (direction.y > 0) {
      this.velocity.y = SPEED
  
      if (direction.x === 0) {
        this.frameY = 0 // Down-facing
      }
    }
  }
  

  draw(ctx) {
    // Draw character sprite from spritesheet
    ctx.drawImage(
      this.spritesheet,
      8 * 8, // x: first character
      0,     // y: only one row
      16,     // width
      16,     // height
      this.x,
      this.y,
      this.width,
      this.height
    )
    
  }

  update(deltaTime, collisionBlocks) {
    if (!deltaTime) return

    // Update animation
    if (this.moving) {
      this.animationTimer += deltaTime
      if (this.animationTimer >= this.animationSpeed) {
        this.frameX = (this.frameX + 1) % 4 // 4 frames per animation
        this.animationTimer = 0
      }
    } else {
      this.frameX = 0 // Reset to standing frame when not moving
    }

    // Update horizontal position and check collisions
    this.updateHorizontalPosition(deltaTime)
    this.checkForHorizontalCollisions(collisionBlocks)

    // Update vertical position and check collisions
    this.updateVerticalPosition(deltaTime)
    this.checkForVerticalCollisions(collisionBlocks)
  }

  updateHorizontalPosition(deltaTime) {
    this.x += this.velocity.x * deltaTime
  }

  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime
  }

  handleInput(keys) {
    this.velocity.x = 0
    this.velocity.y = 0
    this.moving = false

    if (keys.d.pressed || keys.a.pressed || keys.w.pressed || keys.s.pressed) {
      this.moving = true
    }

    if (keys.d.pressed) {
      this.velocity.x = SPEED
      this.frameY = 3 // Right-facing sprites
    } else if (keys.a.pressed) {
      this.velocity.x = -SPEED
      this.frameY = 2 // Left-facing sprites
    }

    if (keys.w.pressed) {
      this.velocity.y = -SPEED
      if (!keys.a.pressed && !keys.d.pressed) {
        this.frameY = 1 // Up-facing sprites
      }
    } else if (keys.s.pressed) {
      this.velocity.y = SPEED
      if (!keys.a.pressed && !keys.d.pressed) {
        this.frameY = 0 // Down-facing sprites
      }
    }
  }

  checkForHorizontalCollisions(collisionBlocks) {
    const buffer = 0.0001
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]

      // Check if a collision exists on all axes
      if (
        this.x <= collisionBlock.x + collisionBlock.width &&
        this.x + this.width >= collisionBlock.x &&
        this.y + this.height >= collisionBlock.y &&
        this.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going left
        if (this.velocity.x < 0) {
          this.x = collisionBlock.x + collisionBlock.width + buffer
          break
        }

        // Check collision while player is going right
        if (this.velocity.x > 0) {
          this.x = collisionBlock.x - this.width - buffer
          break
        }
      }
    }
  }

  checkForVerticalCollisions(collisionBlocks) {
    const buffer = 0.0001
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]

      // If a collision exists
      if (
        this.x <= collisionBlock.x + collisionBlock.width &&
        this.x + this.width >= collisionBlock.x &&
        this.y + this.height >= collisionBlock.y &&
        this.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going up
        if (this.velocity.y < 0) {
          this.velocity.y = 0
          this.y = collisionBlock.y + collisionBlock.height + buffer
          break
        }

        // Check collision while player is going down
        if (this.velocity.y > 0) {
          this.velocity.y = 0
          this.y = collisionBlock.y - this.height - buffer
          break
        }
      }
    }
  }
}

