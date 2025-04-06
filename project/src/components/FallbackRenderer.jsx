"use client"

import { useEffect, useRef } from "react"

const FallbackRenderer = ({ width = 1024, height = 576 }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    // Draw a checkerboard pattern
    const tileSize = 32
    for (let y = 0; y < height; y += tileSize) {
      for (let x = 0; x < width; x += tileSize) {
        ctx.fillStyle = (x + y) % (tileSize * 2) === 0 ? "#2d3748" : "#4a5568"
        ctx.fillRect(x, y, tileSize, tileSize)
      }
    }

    // Draw error message
    ctx.fillStyle = "#f56565"
    ctx.font = "24px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Error loading game assets", width / 2, height / 2 - 50)

    ctx.fillStyle = "#e2e8f0"
    ctx.font = "16px Arial"
    ctx.fillText("Check console for details", width / 2, height / 2)
    ctx.fillText(
      "Missing: /images/terrain.png, /images/decorations.png, /images/characters.png",
      width / 2,
      height / 2 + 30,
    )

    // Draw border
    ctx.strokeStyle = "#f56565"
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, width - 4, height - 4)
  }, [width, height])

  return <canvas ref={canvasRef} width={width} height={height} />
}

export default FallbackRenderer

