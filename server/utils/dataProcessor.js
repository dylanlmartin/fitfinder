import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const processScrapedData = async (rawProducts) => {
  const processedProducts = rawProducts
    .filter(product => product && product.title && product.brand)
    .map(product => ({
      ...product,
      // Normalize price
      price: parseFloat(product.price) || 0,
      
      // Clean and normalize brand names
      brand: normalizeBrandName(product.brand),
      
      // Ensure category is valid
      category: normalizeCategory(product.category),
      
      // Clean title
      title: product.title.trim(),
      
      // Validate measurements
      measurements: validateMeasurements(product.measurements || {}),
      
      // Ensure images array
      images: Array.isArray(product.images) ? product.images : [],
      
      // Add processing timestamp
      processedAt: new Date().toISOString()
    }))
    .filter(product => product.price > 0) // Remove products without valid prices

  return processedProducts
}

const normalizeBrandName = (brand) => {
  const brandMap = {
    'chanel': 'Chanel',
    'hermès': 'Hermes',
    'hermes': 'Hermes',
    'prada': 'Prada',
    'gucci': 'Gucci',
    'saint laurent': 'Saint Laurent',
    'yves saint laurent': 'Saint Laurent',
    'ysl': 'Saint Laurent'
  }

  const normalized = brand.toLowerCase().trim()
  return brandMap[normalized] || brand.trim()
}

const normalizeCategory = (category) => {
  const categoryMap = {
    'dress': 'dresses',
    'dresses': 'dresses',
    'top': 'tops',
    'tops': 'tops',
    'shirt': 'tops',
    'blouse': 'tops',
    'bottom': 'bottoms',
    'bottoms': 'bottoms',
    'pants': 'bottoms',
    'skirt': 'bottoms',
    'jacket': 'outerwear',
    'coat': 'outerwear',
    'outerwear': 'outerwear'
  }

  const normalized = category?.toLowerCase().trim()
  return categoryMap[normalized] || 'tops'
}

const validateMeasurements = (measurements) => {
  const validated = {}

  // Validate bust measurement
  if (measurements.bust && measurements.bust > 20 && measurements.bust < 60) {
    validated.bust = Math.round(measurements.bust * 100) / 100
  }

  // Validate waist measurement
  if (measurements.waist && measurements.waist > 15 && measurements.waist < 50) {
    validated.waist = Math.round(measurements.waist * 100) / 100
  }

  // Validate hips measurement
  if (measurements.hips && measurements.hips > 20 && measurements.hips < 65) {
    validated.hips = Math.round(measurements.hips * 100) / 100
  }

  // Validate length measurement
  if (measurements.length && measurements.length > 10 && measurements.length < 60) {
    validated.length = Math.round(measurements.length * 100) / 100
  }

  // Validate shoulder measurement
  if (measurements.shoulder && measurements.shoulder > 8 && measurements.shoulder < 25) {
    validated.shoulder = Math.round(measurements.shoulder * 100) / 100
  }

  return validated
}

export const deduplicateProducts = (products) => {
  const seen = new Set()
  return products.filter(product => {
    // Create a unique key based on title, brand, and price
    const key = `${product.title.toLowerCase()}-${product.brand.toLowerCase()}-${product.price}`
    
    if (seen.has(key)) {
      return false
    }
    
    seen.add(key)
    return true
  })
}

export const enrichProductData = async (products) => {
  // Load sizing charts for brand-specific enhancements
  const sizingChartsPath = path.join(__dirname, '../../src/data/sizingCharts.json')
  let sizingCharts = {}
  
  try {
    sizingCharts = await fs.readJSON(sizingChartsPath)
  } catch (error) {
    console.log('Could not load sizing charts:', error.message)
  }

  return products.map(product => {
    const brandChart = sizingCharts[product.brand]
    const categoryChart = brandChart?.[product.category]
    
    // Add estimated measurements if missing but size is available
    if (!Object.keys(product.measurements).length && product.size && categoryChart) {
      const sizeChart = categoryChart[product.size]
      if (sizeChart) {
        product.measurements = { ...sizeChart }
        product.measurementsSource = 'estimated'
      }
    }

    // Add brand fit notes
    if (brandChart?.fitNotes) {
      product.brandFitNotes = brandChart.fitNotes
    }

    return product
  })
}

export const generateProductStats = (products) => {
  const stats = {
    total: products.length,
    byBrand: {},
    byCategory: {},
    byCondition: {},
    priceRange: {
      min: Math.min(...products.map(p => p.price)),
      max: Math.max(...products.map(p => p.price)),
      average: products.reduce((sum, p) => sum + p.price, 0) / products.length
    },
    withMeasurements: products.filter(p => Object.keys(p.measurements).length > 0).length
  }

  products.forEach(product => {
    // Count by brand
    stats.byBrand[product.brand] = (stats.byBrand[product.brand] || 0) + 1
    
    // Count by category
    stats.byCategory[product.category] = (stats.byCategory[product.category] || 0) + 1
    
    // Count by condition
    stats.byCondition[product.condition] = (stats.byCondition[product.condition] || 0) + 1
  })

  return stats
}