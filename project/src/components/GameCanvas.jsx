"use client"

import { useRef, useEffect, useState } from "react"
import useGameEngine from "../hooks/useGameEngine.jsx"
import logger from "../utils/logger.jsx"
import FallbackRenderer from "./FallbackRenderer.jsx"

const GameCanvas = ({ onInteraction, isPaused }) => {
  const canvasRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadError, setLoadError] = useState(false)

  const { initGame, updateGame, renderGame, playerInteractWithNPC, setPaused } = useGameEngine(canvasRef, onInteraction)

  // Initialize game when component mounts
  useEffect(() => {
    const loadAssets = async () => {
      setIsLoading(true)
      setLoadError(false)
      try {
        // Load all required assets
        const success = await initGame(setLoadingProgress)
        if (success) {
          logger.info("GameCanvas", "Game assets loaded successfully")
          setIsLoading(false)
        } else {
          logger.error("GameCanvas", "Failed to load game assets")
          setLoadError(true)
          setIsLoading(false)
        }
      } catch (error) {
        logger.error("GameCanvas", "Error loading game assets", error)
        setLoadError(true)
        setIsLoading(false)
      }
    }

    loadAssets()
  }, [initGame])

  // Update pause state when prop changes
  useEffect(() => {
    setPaused(isPaused)
  }, [isPaused, setPaused])

  // Game loop
  useEffect(() => {
    if (isLoading || loadError) return

    let animationFrameId
    let lastTime = performance.now()

    const gameLoop = (currentTime) => {
      try {
        // Calculate delta time in seconds
        const deltaTime = (currentTime - lastTime) / 1000
        lastTime = currentTime

        // Only update game if not paused
        if (!isPaused) {
          updateGame(deltaTime)
        }

        // Always render the game, even when paused
        renderGame()

        animationFrameId = requestAnimationFrame(gameLoop)
      } catch (error) {
        logger.error("GameCanvas", "Game loop error", error)
        setLoadError(true)
        cancelAnimationFrame(animationFrameId)
      }
    }

    // Start the game loop
    animationFrameId = requestAnimationFrame(gameLoop)
    logger.info("GameCanvas", "Game loop started")

    return () => {
      cancelAnimationFrame(animationFrameId)
      logger.info("GameCanvas", "Game loop stopped")
    }
  }, [isLoading, isPaused, loadError, updateGame, renderGame])

  // Handle interaction key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "e" && !isPaused && !isLoading && !loadError) {
        playerInteractWithNPC()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPaused, isLoading, loadError, playerInteractWithNPC])

  return (
    <div className="game-canvas-container">
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-bar">
            <div className="loading-progress" style={{ width: `${loadingProgress}%` }}></div>
          </div>
          <div className="loading-text">Loading game assets: {loadingProgress}%</div>
        </div>
      )}

      {loadError ? (
        <FallbackRenderer />
      ) : (
        <canvas
          ref={canvasRef}
          width={1024}
          height={576}
          style={{
            display: isLoading ? "none" : "block",
            imageRendering: "pixelated",
          }}
        />
      )}

      {!isLoading && !loadError && (
        <div className="game-controls-hint">
          <p>WASD or Arrow Keys to move | E to interact</p>
        </div>
      )}
    </div>
  )
}

export default GameCanvas

