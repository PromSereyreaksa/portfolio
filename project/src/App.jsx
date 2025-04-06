"use client"

import { useState, useEffect } from "react"
import GameCanvas from "./components/GameCanvas.jsx"
import DialogBox from "./components/DialogBox.jsx"
import "./App.css"

function App() {
  const [dialog, setDialog] = useState(null)
  const [gameState, setGameState] = useState({
    playerInteracting: false,
  })

  // Handle dialog interactions
  const handleInteraction = (npcData) => {
    setDialog(npcData)
    setGameState((prev) => ({ ...prev, playerInteracting: true }))
  }

  const closeDialog = () => {
    setDialog(null)
    setGameState((prev) => ({ ...prev, playerInteracting: false }))
  }

  // Close dialog with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && dialog) {
        closeDialog()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [dialog])

  return (
    <div className="game-container">
      <GameCanvas onInteraction={handleInteraction} isPaused={gameState.playerInteracting} />
      {dialog && <DialogBox npc={dialog} onClose={closeDialog} />}
    </div>
  )
}

export default App

