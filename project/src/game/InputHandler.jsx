/**
 * InputHandler Class
 *
 * Manages keyboard and touch input for the game
 */

export class InputHandler {
  constructor() {
    this.keys = {
      w: { pressed: false },
      a: { pressed: false },
      s: { pressed: false },
      d: { pressed: false },
      ArrowUp: { pressed: false },
      ArrowLeft: { pressed: false },
      ArrowDown: { pressed: false },
      ArrowRight: { pressed: false },
      e: { pressed: false, justPressed: false },
      Escape: { pressed: false, justPressed: false },
    }

    this.touchControls = {
      up: { pressed: false },
      left: { pressed: false },
      down: { pressed: false },
      right: { pressed: false },
      action: { pressed: false, justPressed: false },
    }

    this.setupEventListeners()
  }

  setupEventListeners() {
    // Keyboard events
    window.addEventListener("keydown", this.handleKeyDown.bind(this))
    window.addEventListener("keyup", this.handleKeyUp.bind(this))

    // Reset justPressed flags on each frame
    this.resetJustPressedInterval = setInterval(() => {
      for (const key in this.keys) {
        if (this.keys[key].justPressed) {
          this.keys[key].justPressed = false
        }
      }

      for (const control in this.touchControls) {
        if (this.touchControls[control].justPressed) {
          this.touchControls[control].justPressed = false
        }
      }
    }, 100) // Reset every 100ms

    // Handle visibility change to prevent stuck keys
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.resetAllKeys()
      }
    })
  }

  handleKeyDown(event) {
    if (this.keys[event.key] !== undefined) {
      // Only set justPressed if the key wasn't already pressed
      if (!this.keys[event.key].pressed) {
        this.keys[event.key].justPressed = true
      }
      this.keys[event.key].pressed = true

      // Prevent default for game controls to avoid scrolling
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", " "].includes(event.key)) {
        event.preventDefault()
      }
    }
  }

  handleKeyUp(event) {
    if (this.keys[event.key] !== undefined) {
      this.keys[event.key].pressed = false
    }
  }

  resetAllKeys() {
    for (const key in this.keys) {
      this.keys[key].pressed = false
      this.keys[key].justPressed = false
    }

    for (const control in this.touchControls) {
      this.touchControls[control].pressed = false
      this.touchControls[control].justPressed = false
    }
  }

  // Get movement direction based on current key states
  getMovementDirection() {
    const direction = { x: 0, y: 0 }

    // Check keyboard input
    if (this.keys.w.pressed || this.keys.ArrowUp.pressed || this.touchControls.up.pressed) {
      direction.y = -1
    } else if (this.keys.s.pressed || this.keys.ArrowDown.pressed || this.touchControls.down.pressed) {
      direction.y = 1
    }

    if (this.keys.a.pressed || this.keys.ArrowLeft.pressed || this.touchControls.left.pressed) {
      direction.x = -1
    } else if (this.keys.d.pressed || this.keys.ArrowRight.pressed || this.touchControls.right.pressed) {
      direction.x = 1
    }

    return direction
  }

  // Check if action button was just pressed
  isActionJustPressed() {
    return this.keys.e.justPressed || this.touchControls.action.justPressed
  }

  // Check if escape was just pressed
  isEscapeJustPressed() {
    return this.keys.Escape.justPressed
  }

  cleanup() {
    window.removeEventListener("keydown", this.handleKeyDown)
    window.removeEventListener("keyup", this.handleKeyUp)
    clearInterval(this.resetJustPressedInterval)
  }
}

