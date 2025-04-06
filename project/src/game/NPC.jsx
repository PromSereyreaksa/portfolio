import { NPC_SETTINGS } from "../game-config.jsx"

const { SPEED, SPRITE_SIZE, ANIMATION_SPEED } = NPC_SETTINGS

export class NPC {
  constructor({
    id,
    x,
    y,
    size,
    spritesheet,
    spriteRow = 4,
    name = "Villager",
    dialog = ["Hello!"],
    movementPattern = "static", // 'static', 'patrol', 'random'
    patrolPoints = [],
  }) {
    this.id = id
    this.x = x
    this.y = y
    this.width = size
    this.height = size
    this.velocity = { x: 0, y: 0 }
    this.spritesheet = spritesheet
    this.spriteSize = SPRITE_SIZE
    this.frameX = 0
    this.frameY = spriteRow // Different row for different character
    this.animationSpeed = ANIMATION_SPEED
    this.animationTimer = 0
    this.moving = false
    this.name = name
    this.dialog = dialog

    // Movement pattern
    this.movementPattern = movementPattern
    this.patrolPoints = patrolPoints
    this.currentPatrolIndex = 0
    this.waitTimer = 0
    this.waitDuration = NPC_SETTINGS.PATROL_WAIT_TIME
    this.randomMoveTimer = 0
    this.randomMoveDuration = 0
    this.randomMoveDirection = { x: 0, y: 0 }
  }

  draw(ctx) {
    // Draw NPC sprite from spritesheet
    ctx.drawImage(
      this.spritesheet,
      this.frameX * this.spriteSize,
      this.frameY * this.spriteSize,
      this.spriteSize,
      this.spriteSize,
      this.x,
      this.y,
      this.width,
      this.height,
    )
  }

  update(deltaTime, collisionBlocks = [], player) {
    if (!deltaTime) return

    // Update animation
    if (this.moving) {
      this.animationTimer += deltaTime
      if (this.animationTimer >= this.animationSpeed) {
        this.frameX = (this.frameX + 1) % 4
        this.animationTimer = 0
      }
    } else {
      this.frameX = 0
    }

    // Handle movement based on pattern
    this.handleMovementPattern(deltaTime, player)

    // Update position and check collisions
    if (this.moving) {
      this.updateHorizontalPosition(deltaTime)
      this.checkForHorizontalCollisions(collisionBlocks)
      this.updateVerticalPosition(deltaTime)
      this.checkForVerticalCollisions(collisionBlocks)
    }
  }

  handleMovementPattern(deltaTime, player) {
    switch (this.movementPattern) {
      case "static":
        // No movement
        this.velocity.x = 0
        this.velocity.y = 0
        this.moving = false
        break

      case "patrol":
        this.handlePatrolMovement(deltaTime)
        break

      case "random":
        this.handleRandomMovement(deltaTime)
        break

      default:
        this.velocity.x = 0
        this.velocity.y = 0
        this.moving = false
    }
  }

  handlePatrolMovement(deltaTime) {
    if (this.patrolPoints.length === 0) return

    // If waiting at a point
    if (this.waitTimer > 0) {
      this.waitTimer -= deltaTime
      this.velocity.x = 0
      this.velocity.y = 0
      this.moving = false
      return
    }

    const targetPoint = this.patrolPoints[this.currentPatrolIndex]
    const dx = targetPoint.x - this.x
    const dy = targetPoint.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // If reached the target point
    if (distance < 5) {
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length
      this.waitTimer = this.waitDuration
      this.velocity.x = 0
      this.velocity.y = 0
      this.moving = false
      return
    }

    // Move towards the target point
    const angle = Math.atan2(dy, dx)
    this.velocity.x = Math.cos(angle) * SPEED
    this.velocity.y = Math.sin(angle) * SPEED
    this.moving = true

    // Update sprite direction
    if (Math.abs(dx) > Math.abs(dy)) {
      this.frameY = dx > 0 ? 3 : 2 // Right or Left
    } else {
      this.frameY = dy > 0 ? 0 : 1 // Down or Up
    }
  }

  handleRandomMovement(deltaTime) {
    // If timer is up, choose a new direction
    if (this.randomMoveTimer <= 0) {
      // Decide whether to move or stand still
      const shouldMove = Math.random() > 0.3

      if (shouldMove) {
        // Choose a random direction
        const angle = Math.random() * Math.PI * 2
        this.randomMoveDirection = {
          x: Math.cos(angle),
          y: Math.sin(angle),
        }
        this.moving = true

        // Update sprite direction
        if (Math.abs(this.randomMoveDirection.x) > Math.abs(this.randomMoveDirection.y)) {
          this.frameY = this.randomMoveDirection.x > 0 ? 3 : 2 // Right or Left
        } else {
          this.frameY = this.randomMoveDirection.y > 0 ? 0 : 1 // Down or Up
        }
      } else {
        this.randomMoveDirection = { x: 0, y: 0 }
        this.moving = false
      }

      // Set a random duration for this movement
      this.randomMoveDuration = 1 + Math.random() * 2 // 1-3 seconds
      this.randomMoveTimer = this.randomMoveDuration
    } else {
      // Continue current movement
      this.randomMoveTimer -= deltaTime
    }

    // Apply the movement
    this.velocity.x = this.randomMoveDirection.x * SPEED
    this.velocity.y = this.randomMoveDirection.y * SPEED
  }

  updateHorizontalPosition(deltaTime) {
    this.x += this.velocity.x * deltaTime
  }

  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime
  }

  checkForHorizontalCollisions(collisionBlocks = []) {
    if (!collisionBlocks || collisionBlocks.length === 0) return

    const buffer = 0.0001
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]

      if (
        this.x <= collisionBlock.x + collisionBlock.width &&
        this.x + this.width >= collisionBlock.x &&
        this.y + this.height >= collisionBlock.y &&
        this.y <= collisionBlock.y + collisionBlock.height
      ) {
        if (this.velocity.x < 0) {
          this.x = collisionBlock.x + collisionBlock.width + buffer
          break
        }

        if (this.velocity.x > 0) {
          this.x = collisionBlock.x - this.width - buffer
          break
        }
      }
    }
  }

  checkForVerticalCollisions(collisionBlocks = []) {
    if (!collisionBlocks || collisionBlocks.length === 0) return

    const buffer = 0.0001
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]

      if (
        this.x <= collisionBlock.x + collisionBlock.width &&
        this.x + this.width >= collisionBlock.x &&
        this.y + this.height >= collisionBlock.y &&
        this.y <= collisionBlock.y + collisionBlock.height
      ) {
        if (this.velocity.y < 0) {
          this.velocity.y = 0
          this.y = collisionBlock.y + collisionBlock.height + buffer
          break
        }

        if (this.velocity.y > 0) {
          this.velocity.y = 0
          this.y = collisionBlock.y - this.height - buffer
          break
        }
      }
    }
  }

  isPlayerInRange(player, distance) {
    const dx = this.x - player.x
    const dy = this.y - player.y
    const distanceSquared = dx * dx + dy * dy
    return distanceSquared <= distance * distance
  }
}

