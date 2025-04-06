"use client"

import { useCallback, useRef, useEffect } from "react"
import { GameEngine } from "../game/GameEngine.jsx"
import { collisions } from "../data/collisions.jsx"
import { layersData, tilesets } from "../data/mapData.jsx"
import logger from "../utils/logger.jsx"

const useGameEngine = (canvasRef, onInteraction) => {
  const gameEngineRef = useRef(null)

  // Initialize game engine
  const initGame = useCallback(
    async (progressCallback) => {
      logger.info("useGameEngine", "Initializing game")

      // Create game engine if it doesn't exist
      if (!gameEngineRef.current) {
        gameEngineRef.current = new GameEngine(canvasRef, onInteraction)
      }

      try {
        // Initialize with map data and tilesets
        const success = await gameEngineRef.current.init({ ...layersData, collisions }, tilesets, progressCallback)

        if (success) {
          logger.info("useGameEngine", "Game initialized successfully")
          return true
        } else {
          logger.error("useGameEngine", "Failed to initialize game")
          return false
        }
      } catch (error) {
        logger.error("useGameEngine", "Error initializing game", error)
        return false
      }
    },
    [canvasRef, onInteraction],
  )

  // Update game state
  const updateGame = useCallback((deltaTime) => {
    try {
      if (gameEngineRef.current) {
        gameEngineRef.current.update(deltaTime)
      }
    } catch (error) {
      logger.error("useGameEngine", "Error updating game", error)
    }
  }, [])

  // Render game
  const renderGame = useCallback(() => {
    try {
      if (gameEngineRef.current) {
        gameEngineRef.current.render()
      }
    } catch (error) {
      logger.error("useGameEngine", "Error rendering game", error)
    }
  }, [])

  // Handle player interaction with NPCs
  const playerInteractWithNPC = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.checkInteractions()
    }
  }, [])

  // Set game pause state
  const setPaused = useCallback((isPaused) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.setPaused(isPaused)
    }
  }, [])

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.cleanup()
        gameEngineRef.current = null
        logger.info("useGameEngine", "Game engine cleaned up")
      }
    }
  }, [])

  return {
    initGame,
    updateGame,
    renderGame,
    playerInteractWithNPC,
    setPaused,
    gameEngine: gameEngineRef.current,
  }
}

export default useGameEngine

