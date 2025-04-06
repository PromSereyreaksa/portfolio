"use client"

import { useState, useEffect } from "react"

const DialogBox = ({ npc, onClose }) => {
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [displayedText, setDisplayedText] = useState("")

  const dialogLines = npc.dialog || ["Hello there!"]
  const currentLine = dialogLines[currentDialogIndex]

  // Text typing effect
  useEffect(() => {
    setIsTyping(true)
    setDisplayedText("")

    let index = 0
    const typingInterval = setInterval(() => {
      if (index < currentLine.length) {
        setDisplayedText((prev) => prev + currentLine.charAt(index))
        index++
      } else {
        setIsTyping(false)
        clearInterval(typingInterval)
      }
    }, 30) // Adjust typing speed here

    return () => clearInterval(typingInterval)
  }, [currentLine, currentDialogIndex])

  const handleNext = () => {
    if (isTyping) {
      // If still typing, show full text immediately
      setDisplayedText(currentLine)
      setIsTyping(false)
      return
    }

    if (currentDialogIndex < dialogLines.length - 1) {
      setCurrentDialogIndex((prev) => prev + 1)
    } else {
      onClose()
    }
  }

  return (
    <div className="dialog-box">
      <div className="dialog-header">
        <h3>{npc.name}</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="dialog-content">
        <p>{displayedText}</p>
      </div>
      <div className="dialog-footer">
        <button onClick={handleNext}>
          {isTyping ? "Skip" : currentDialogIndex < dialogLines.length - 1 ? "Next" : "Close"}
        </button>
      </div>
    </div>
  )
}

export default DialogBox

