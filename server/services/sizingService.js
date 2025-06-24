import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load sizing charts from JSON file
const loadSizingCharts = async () => {
  try {
    const chartsPath = path.join(__dirname, '../../src/data/sizingCharts.json')
    return await fs.readJSON(chartsPath)
  } catch (error) {
    console.error('Error loading sizing charts:', error)
    return {}
  }
}

export const getAllSizingCharts = async () => {
  return await loadSizingCharts()
}

export const getSizingChart = async (brand, category) => {
  const charts = await loadSizingCharts()
  
  const brandChart = charts[brand]
  if (!brandChart) {
    return null
  }

  return {
    brand,
    category,
    sizingChart: brandChart[category],
    fitNotes: brandChart.fitNotes
  }
}

export const getRecommendedSize = async (brand, category, userMeasurements) => {
  const chart = await getSizingChart(brand, category)
  
  if (!chart || !chart.sizingChart) {
    return null
  }

  const { bust, waist, hips } = userMeasurements
  let bestMatch = null
  let bestScore = Infinity

  // Find the closest size match
  Object.entries(chart.sizingChart).forEach(([size, measurements]) => {
    let score = 0
    let measurementCount = 0

    if (bust && measurements.bust) {
      score += Math.abs(bust - measurements.bust)
      measurementCount++
    }

    if (waist && measurements.waist) {
      score += Math.abs(waist - measurements.waist)
      measurementCount++
    }

    if (hips && measurements.hips) {
      score += Math.abs(hips - measurements.hips)
      measurementCount++
    }

    if (measurementCount > 0) {
      const avgScore = score / measurementCount
      if (avgScore < bestScore) {
        bestScore = avgScore
        bestMatch = {
          size,
          measurements,
          confidence: Math.max(0, 100 - (avgScore * 10))
        }
      }
    }
  })

  return bestMatch
}