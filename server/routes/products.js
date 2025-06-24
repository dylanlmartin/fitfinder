import express from 'express'
import { getProducts, getProductById, searchProducts } from '../services/productService.js'
import { calculateFitScore } from '../services/fitAnalyzer.js'

const router = express.Router()

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      brand, 
      minPrice, 
      maxPrice, 
      condition,
      size,
      page = 1,
      limit = 24,
      sort = 'newest'
    } = req.query

    const filters = {
      category,
      brand: brand ? brand.split(',') : [],
      priceRange: [
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 10000
      ],
      condition,
      size
    }

    const products = await getProducts(filters, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort
    })

    res.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// POST /api/products/search
router.post('/search', async (req, res) => {
  try {
    const { query, filters = {}, userMeasurements } = req.body
    
    const products = await searchProducts(query, filters)
    
    // Add fit scores if user measurements provided
    if (userMeasurements) {
      const productsWithFitScores = products.map(product => {
        const fitResult = calculateFitScore(userMeasurements, product)
        return {
          ...product,
          fitScore: fitResult.overallScore,
          fitDetails: fitResult
        }
      })
      
      // Sort by fit score
      productsWithFitScores.sort((a, b) => b.fitScore - a.fitScore)
      return res.json(productsWithFitScores)
    }
    
    res.json(products)
  } catch (error) {
    console.error('Error searching products:', error)
    res.status(500).json({ error: 'Failed to search products' })
  }
})

// GET /api/products/brands
router.get('/meta/brands', async (req, res) => {
  try {
    const products = await getProducts({}, { limit: 10000 })
    const brands = [...new Set(products.items.map(p => p.brand))].sort()
    res.json(brands)
  } catch (error) {
    console.error('Error fetching brands:', error)
    res.status(500).json({ error: 'Failed to fetch brands' })
  }
})

export default router