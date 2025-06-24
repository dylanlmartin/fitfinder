import express from 'express'
import { getSizingChart, getAllSizingCharts } from '../services/sizingService.js'
import { calculateFitScore } from '../services/fitAnalyzer.js'

const router = express.Router()

// GET /api/sizing/charts
router.get('/charts', async (req, res) => {
  try {
    const charts = await getAllSizingCharts()
    res.json(charts)
  } catch (error) {
    console.error('Error fetching sizing charts:', error)
    res.status(500).json({ error: 'Failed to fetch sizing charts' })
  }
})

// GET /api/sizing/:brand/:category
router.get('/:brand/:category', async (req, res) => {
  try {
    const { brand, category } = req.params
    const chart = await getSizingChart(brand, category)
    
    if (!chart) {
      return res.status(404).json({ error: 'Sizing chart not found' })
    }
    
    res.json(chart)
  } catch (error) {
    console.error('Error fetching sizing chart:', error)
    res.status(500).json({ error: 'Failed to fetch sizing chart' })
  }
})

// POST /api/sizing/fit-analysis
router.post('/fit-analysis', async (req, res) => {
  try {
    const { userMeasurements, product } = req.body
    
    if (!userMeasurements || !product) {
      return res.status(400).json({ 
        error: 'User measurements and product information required' 
      })
    }
    
    const fitResult = calculateFitScore(userMeasurements, product)
    res.json(fitResult)
  } catch (error) {
    console.error('Error calculating fit:', error)
    res.status(500).json({ error: 'Failed to calculate fit' })
  }
})

export default router