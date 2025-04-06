/**
 * Logger Utility
 *
 * Provides consistent logging with different levels and formatting
 */

import { DEBUG_SETTINGS } from "../game-config.jsx"

// Log levels in order of severity
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// Current log level from config
const currentLevel = LOG_LEVELS[DEBUG_SETTINGS.LOG_LEVEL] || LOG_LEVELS.info

// Style for each log level
const LOG_STYLES = {
  debug: "color: #9e9e9e",
  info: "color: #2196f3",
  warn: "color: #ff9800; font-weight: bold",
  error: "color: #f44336; font-weight: bold",
}

/**
 * Log a message if its level is at or above the current log level
 * @param {string} level - The log level (debug, info, warn, error)
 * @param {string} component - The component or module name
 * @param {string} message - The message to log
 * @param {any} data - Optional data to include
 */
export const log = (level, component, message, data) => {
  if (LOG_LEVELS[level] >= currentLevel) {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, -1)
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${component}]`

    if (data) {
      console.groupCollapsed(`%c${prefix} ${message}`, LOG_STYLES[level])
      console.log(data)
      console.groupEnd()
    } else {
      console.log(`%c${prefix} ${message}`, LOG_STYLES[level])
    }
  }
}

// Convenience methods for different log levels
export const debug = (component, message, data) => log("debug", component, message, data)
export const info = (component, message, data) => log("info", component, message, data)
export const warn = (component, message, data) => log("warn", component, message, data)
export const error = (component, message, data) => log("error", component, message, data)

export default {
  debug,
  info,
  warn,
  error,
}

