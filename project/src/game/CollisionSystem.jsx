/**
 * CollisionSystem Class
 *
 * Handles collision detection and resolution between game entities
 */

import { DEBUG_SETTINGS } from "../game-config.jsx"

export class CollisionSystem {
  constructor() {
    this.collisionMap = []
    this.entities = []
    this.debugMode = DEBUG_SETTINGS.SHOW_COLLISION_BOXES
  }

  setCollisionMap(collisionMap) {
    this.collisionMap = collisionMap
  }

  registerEntity(entity) {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity)
    }
  }

  unregisterEntity(entity) {
    this.entities = this.entities.filter((e) => e !== entity)
  }

  update() {
    // Check entity-to-map collisions
    this.entities.forEach((entity) => {
      this.checkMapCollision(entity)
    })

    // Check entity-to-entity collisions
    for (let i = 0; i < this.entities.length; i++) {
      for (let j = i + 1; j < this.entities.length; j++) {
        this.checkEntityCollision(this.entities[i], this.entities[j])
      }
    }
  }

  checkMapCollision(entity) {
    // Skip entities that don't have collision enabled
    if (!entity.hasCollision) return

    const nextX = entity.x + entity.velocity.x
    const nextY = entity.y + entity.velocity.y

    // Check horizontal movement
    if (entity.velocity.x !== 0) {
      const horizontalCollision = this.collisionMap.find(
        (block) =>
          nextX < block.x + block.width &&
          nextX + entity.width > block.x &&
          entity.y < block.y + block.height &&
          entity.y + entity.height > block.y,
      )

      if (horizontalCollision) {
        // Resolve horizontal collision
        if (entity.velocity.x > 0) {
          entity.x = horizontalCollision.x - entity.width
        } else {
          entity.x = horizontalCollision.x + horizontalCollision.width
        }
        entity.velocity.x = 0

        // Trigger collision event
        entity.onCollision && entity.onCollision("horizontal", horizontalCollision)
      }
    }

    // Check vertical movement
    if (entity.velocity.y !== 0) {
      const verticalCollision = this.collisionMap.find(
        (block) =>
          entity.x < block.x + block.width &&
          entity.x + entity.width > block.x &&
          nextY < block.y + block.height &&
          nextY + entity.height > block.y,
      )

      if (verticalCollision) {
        // Resolve vertical collision
        if (entity.velocity.y > 0) {
          entity.y = verticalCollision.y - entity.height
        } else {
          entity.y = verticalCollision.y + verticalCollision.height
        }
        entity.velocity.y = 0

        // Trigger collision event
        entity.onCollision && entity.onCollision("vertical", verticalCollision)
      }
    }
  }

  checkEntityCollision(entityA, entityB) {
    // Skip if either entity doesn't have collision enabled
    if (!entityA.hasCollision || !entityB.hasCollision) return

    // Check if entities are colliding
    const isColliding =
      entityA.x < entityB.x + entityB.width &&
      entityA.x + entityA.width > entityB.x &&
      entityA.y < entityB.y + entityB.height &&
      entityA.y + entityA.height > entityB.y

    if (isColliding) {
      // Trigger collision events
      entityA.onEntityCollision && entityA.onEntityCollision(entityB)
      entityB.onEntityCollision && entityB.onEntityCollision(entityA)
    }
  }

  // Draw collision boxes for debugging
  drawDebug(ctx) {
    if (!this.debugMode) return

    // Draw map collision boxes
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
    this.collisionMap.forEach((block) => {
      ctx.fillRect(block.x, block.y, block.width, block.height)
    })

    // Draw entity collision boxes
    ctx.fillStyle = "rgba(0, 255, 0, 0.3)"
    this.entities.forEach((entity) => {
      if (entity.hasCollision) {
        ctx.fillRect(entity.x, entity.y, entity.width, entity.height)
      }
    })
  }
}

