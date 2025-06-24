import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load products from JSON file (will be replaced by database later)
const loadProducts = async () => {
  try {
    const productsPath = path.join(__dirname, '../data/products.json')
    
    // Check if scraped data exists, otherwise use static data
    if (await fs.pathExists(productsPath)) {
      return await fs.readJSON(productsPath)
    } else {
      // Fallback to frontend static data
      const staticPath = path.join(__dirname, '../../src/data/products.json')
      return await fs.readJSON(staticPath)
    }
  } catch (error) {
    console.error('Error loading products:', error)
    return []
  }
}

export const getProducts = async (filters = {}, options = {}) => {
  const { page = 1, limit = 24, sort = 'newest' } = options
  let products = await loadProducts()

  // Apply filters
  if (filters.category) {
    products = products.filter(p => p.category === filters.category)
  }

  if (filters.brand && filters.brand.length > 0) {
    products = products.filter(p => filters.brand.includes(p.brand))
  }

  if (filters.priceRange) {
    const [min, max] = filters.priceRange
    products = products.filter(p => p.price >= min && p.price <= max)
  }

  if (filters.condition) {
    products = products.filter(p => p.condition === filters.condition)
  }

  if (filters.size) {
    products = products.filter(p => p.size === filters.size)
  }

  // Apply sorting
  switch (sort) {
    case 'price-low':
      products.sort((a, b) => a.price - b.price)
      break
    case 'price-high':
      products.sort((a, b) => b.price - a.price)
      break
    case 'newest':
    default:
      // Assuming products are already sorted by newest
      break
  }

  // Apply pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedProducts = products.slice(startIndex, endIndex)

  return {
    items: paginatedProducts,
    total: products.length,
    page,
    limit,
    totalPages: Math.ceil(products.length / limit)
  }
}

export const getProductById = async (id) => {
  const products = await loadProducts()
  return products.find(p => p.id === id)
}

export const searchProducts = async (query, filters = {}) => {
  const products = await loadProducts()
  
  if (!query) {
    return await getProducts(filters)
  }

  const searchTerms = query.toLowerCase().split(' ')
  
  const matchingProducts = products.filter(product => {
    const searchText = `
      ${product.title} 
      ${product.brand} 
      ${product.description} 
      ${product.category}
    `.toLowerCase()

    return searchTerms.every(term => searchText.includes(term))
  })

  // Apply filters to search results
  let filteredProducts = matchingProducts

  if (filters.category) {
    filteredProducts = filteredProducts.filter(p => p.category === filters.category)
  }

  if (filters.brand && filters.brand.length > 0) {
    filteredProducts = filteredProducts.filter(p => filters.brand.includes(p.brand))
  }

  if (filters.priceRange) {
    const [min, max] = filters.priceRange
    filteredProducts = filteredProducts.filter(p => p.price >= min && p.price <= max)
  }

  return filteredProducts
}