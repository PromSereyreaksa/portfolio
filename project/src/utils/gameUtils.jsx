// Load an image and return a promise
export const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    console.log(`Loading image: ${src}`)
    const img = new Image()
    img.crossOrigin = "anonymous" // Add this to handle CORS issues
    img.onload = () => {
      console.log(`Successfully loaded image: ${src}`)
      resolve(img)
    }
    img.onerror = (e) => {
      console.error(`Error loading image: ${src}`, e)
      reject(new Error(`Failed to load image: ${src}`))
    }
    img.src = src
  })
}

// Calculate distance between two points
export const calculateDistance = (x1, y1, x2, y2) => {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

// Check if two rectangles overlap
export const checkRectangleOverlap = (rect1, rect2) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  )
}

