import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class TheRealRealScraper {
  constructor() {
    this.baseUrl = 'https://www.therealreal.com'
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    }
    this.delay = 2000 // 2 second delay between requests
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async scrapeProductListings(category = 'womens-clothing', maxPages = 5) {
    const products = []
    
    try {
      console.log(`Starting scrape of ${category} with max ${maxPages} pages...`)
      
      for (let page = 1; page <= maxPages; page++) {
        console.log(`Scraping page ${page}...`)
        
        const url = `${this.baseUrl}/shop/women/clothing?page=${page}`
        
        try {
          const response = await axios.get(url, { headers: this.headers })
          const $ = cheerio.load(response.data)
          
          // Extract product links from the page
          const productLinks = []
          $('a[href*="/products/"]').each((i, element) => {
            const href = $(element).attr('href')
            if (href && href.includes('/products/')) {
              const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`
              productLinks.push(fullUrl)
            }
          })
          
          console.log(`Found ${productLinks.length} product links on page ${page}`)
          
          // Scrape each product detail page
          for (const productUrl of productLinks.slice(0, 10)) { // Limit to 10 per page for demo
            try {
              await this.delay(this.delay) // Respectful delay
              const product = await this.scrapeProductDetail(productUrl)
              if (product) {
                products.push(product)
              }
            } catch (error) {
              console.error(`Error scraping product ${productUrl}:`, error.message)
            }
          }
          
        } catch (error) {
          console.error(`Error scraping page ${page}:`, error.message)
        }
        
        await this.delay(this.delay) // Delay between pages
      }
      
    } catch (error) {
      console.error('Error in scrapeProductListings:', error)
    }
    
    return products
  }

  async scrapeProductDetail(url) {
    try {
      const response = await axios.get(url, { headers: this.headers })
      const $ = cheerio.load(response.data)
      
      // Extract product information
      const title = $('h1[data-testid="product-title"]').text().trim() || 
                   $('.product-title').text().trim() ||
                   $('h1').first().text().trim()
      
      const brand = $('[data-testid="product-brand"]').text().trim() ||
                   $('.product-brand').text().trim() ||
                   $('.brand-name').text().trim()
      
      const price = this.extractPrice($)
      const condition = this.extractCondition($)
      const size = this.extractSize($)
      const description = this.extractDescription($)
      const images = this.extractImages($)
      const measurements = this.extractMeasurements($)
      const category = this.categorizeProduct(title, description)
      
      // Generate unique ID
      const id = `trr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      if (!title || !brand || !price) {
        console.log(`Skipping product with missing core data: ${url}`)
        return null
      }
      
      return {
        id,
        title,
        brand,
        category,
        subcategory: this.getSubcategory(category, title),
        size,
        price,
        condition,
        url,
        images,
        measurements,
        description,
        scrapedAt: new Date().toISOString()
      }
      
    } catch (error) {
      console.error(`Error scraping product detail ${url}:`, error.message)
      return null
    }
  }

  extractPrice($) {
    const priceSelectors = [
      '[data-testid="product-price"]',
      '.product-price',
      '.price',
      '.current-price',
      '.sale-price'
    ]
    
    for (const selector of priceSelectors) {
      const priceText = $(selector).text().trim()
      if (priceText) {
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))
        if (!isNaN(price)) return price
      }
    }
    
    return null
  }

  extractCondition($) {
    const conditionSelectors = [
      '[data-testid="product-condition"]',
      '.product-condition',
      '.condition',
      '.item-condition'
    ]
    
    for (const selector of conditionSelectors) {
      const condition = $(selector).text().trim()
      if (condition) return condition
    }
    
    return 'Unknown'
  }

  extractSize($) {
    const sizeSelectors = [
      '[data-testid="product-size"]',
      '.product-size',
      '.size',
      '.item-size'
    ]
    
    for (const selector of sizeSelectors) {
      const size = $(selector).text().trim()
      if (size && size.toLowerCase() !== 'size') return size
    }
    
    return 'Unknown'
  }

  extractDescription($) {
    const descSelectors = [
      '[data-testid="product-description"]',
      '.product-description',
      '.description',
      '.product-details'
    ]
    
    for (const selector of descSelectors) {
      const desc = $(selector).text().trim()
      if (desc) return desc
    }
    
    return ''
  }

  extractImages($) {
    const images = []
    $('img[src*="product"], img[alt*="product"], .product-image img').each((i, element) => {
      const src = $(element).attr('src')
      if (src && !src.includes('placeholder')) {
        const fullUrl = src.startsWith('http') ? src : `${this.baseUrl}${src}`
        images.push(fullUrl)
      }
    })
    
    return images.slice(0, 5) // Limit to 5 images
  }

  extractMeasurements($) {
    const measurements = {}
    
    // Look for measurement tables or lists
    $('.measurements, .size-chart, .product-measurements').each((i, element) => {
      const text = $(element).text().toLowerCase()
      
      // Extract bust/chest
      const bustMatch = text.match(/bust[:\s]*(\d+(?:\.\d+)?)/i) || 
                       text.match(/chest[:\s]*(\d+(?:\.\d+)?)/i)
      if (bustMatch) measurements.bust = parseFloat(bustMatch[1])
      
      // Extract waist
      const waistMatch = text.match(/waist[:\s]*(\d+(?:\.\d+)?)/i)
      if (waistMatch) measurements.waist = parseFloat(waistMatch[1])
      
      // Extract hips
      const hipsMatch = text.match(/hips?[:\s]*(\d+(?:\.\d+)?)/i)
      if (hipsMatch) measurements.hips = parseFloat(hipsMatch[1])
      
      // Extract length
      const lengthMatch = text.match(/length[:\s]*(\d+(?:\.\d+)?)/i)
      if (lengthMatch) measurements.length = parseFloat(lengthMatch[1])
      
      // Extract shoulder
      const shoulderMatch = text.match(/shoulder[:\s]*(\d+(?:\.\d+)?)/i)
      if (shoulderMatch) measurements.shoulder = parseFloat(shoulderMatch[1])
    })
    
    return measurements
  }

  categorizeProduct(title, description) {
    const text = `${title} ${description}`.toLowerCase()
    
    if (text.match(/dress|gown|frock/)) return 'dresses'
    if (text.match(/jacket|coat|blazer|cardigan|sweater|hoodie/)) return 'outerwear'
    if (text.match(/pants|trouser|jean|legging|short/)) return 'bottoms'
    if (text.match(/skirt|pant|bottom/)) return 'bottoms'
    if (text.match(/top|blouse|shirt|tee|tank|camisole/)) return 'tops'
    
    return 'tops' // Default category
  }

  getSubcategory(category, title) {
    const text = title.toLowerCase()
    
    switch (category) {
      case 'dresses':
        if (text.includes('midi')) return 'midi'
        if (text.includes('maxi')) return 'maxi'
        if (text.includes('mini')) return 'mini'
        return 'midi'
      
      case 'tops':
        if (text.includes('blouse')) return 'blouses'
        if (text.includes('shirt')) return 'shirts'
        if (text.includes('sweater')) return 'sweaters'
        return 'tops'
      
      case 'bottoms':
        if (text.includes('jean')) return 'jeans'
        if (text.includes('trouser')) return 'trousers'
        if (text.includes('skirt')) return 'skirts'
        return 'pants'
      
      case 'outerwear':
        if (text.includes('jacket')) return 'jackets'
        if (text.includes('coat')) return 'coats'
        return 'jackets'
      
      default:
        return 'other'
    }
  }

  async saveProducts(products) {
    const dataPath = path.join(__dirname, '../data/products.json')
    await fs.ensureDir(path.dirname(dataPath))
    await fs.writeJSON(dataPath, products, { spaces: 2 })
    console.log(`Saved ${products.length} products to ${dataPath}`)
  }
}

// Run scraper if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const scraper = new TheRealRealScraper()
  
  console.log('Starting The Real Real scraper...')
  scraper.scrapeProductListings('womens-clothing', 2)
    .then(products => {
      console.log(`Scraped ${products.length} products`)
      return scraper.saveProducts(products)
    })
    .catch(error => {
      console.error('Scraper error:', error)
    })
}

export default TheRealRealScraper