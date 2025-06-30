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
    this.userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ]
    this.headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1'
    }
    this.delayMs = 2000 // 2 second delay between requests
  }

  getRandomHeaders() {
    return {
      ...this.headers,
      'User-Agent': this.userAgents[Math.floor(Math.random() * this.userAgents.length)]
    }
  }

  async delay(ms = this.delayMs) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async scrapeProductListings(category = 'womens-clothing', maxPages = 5, targetProducts = 200) {
    const products = []
    
    try {
      console.log(`Starting scrape of ${category} with max ${maxPages} pages...`)
      console.log(`Target: ${targetProducts} available products`)
      
      for (let page = 1; page <= maxPages; page++) {
        console.log(`Scraping page ${page}...`)
        
        const url = `${this.baseUrl}/shop/women/clothing?page=${page}`
        
        try {
          const response = await axios.get(url, { 
            headers: this.getRandomHeaders(),
            timeout: 30000 // 30 second timeout
          })
          const $ = cheerio.load(response.data)
          
          // Extract product links from the page, filtering out sold items
          const productLinks = []
          $('a[href*="/products/"]').each((i, element) => {
            const href = $(element).attr('href')
            if (href && href.includes('/products/')) {
              const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`
              
              // Check if this product appears sold in the listing
              const productCard = $(element).closest('.product-item, .product-card, .product, [data-testid="product"]')
              const isSoldInListing = this.checkSoldInListing(productCard)
              
              if (!isSoldInListing) {
                productLinks.push(fullUrl)
              } else {
                console.log(`Skipping sold product in listing: ${fullUrl}`)
              }
            }
          })
          
          console.log(`Found ${productLinks.length} product links on page ${page}`)
          
          // Scrape each product detail page
          for (const productUrl of productLinks.slice(0, 25)) { // Increased limit per page to 25
            try {
              await this.delay(this.delayMs) // Respectful delay
              const product = await this.scrapeProductDetail(productUrl)
              if (product) {
                products.push(product)
                console.log(`✓ Scraped available product: ${product.brand} ${product.title} - $${product.price}`)
                
                // Check if we've reached our target
                if (products.length >= targetProducts) {
                  console.log(`🎯 Reached target of ${targetProducts} products!`)
                  return products
                }
              }
            } catch (error) {
              console.error(`Error scraping product ${productUrl}:`, error.message)
            }
          }
          
        } catch (error) {
          console.error(`Error scraping page ${page}:`, error.message)
        }
        
        await this.delay(this.delayMs) // Delay between pages
      }
      
    } catch (error) {
      console.error('Error in scrapeProductListings:', error)
    }
    
    return products
  }

  async scrapeProductDetail(url, retries = 2) {
    try {
      const response = await axios.get(url, { 
        headers: this.getRandomHeaders(),
        timeout: 30000 // 30 second timeout
      })
      const $ = cheerio.load(response.data)
      
      // Extract product information
      const title = $('h1[data-testid="product-title"]').text().trim() || 
                   $('.product-title').text().trim() ||
                   $('h1').first().text().trim()
      
      const brand = $('[data-testid="product-brand"]').text().trim() ||
                   $('.product-brand').text().trim() ||
                   $('.brand-name').text().trim()
      
      // Check if product is available for purchase
      const isAvailable = this.checkAvailability($)
      if (!isAvailable) {
        console.log(`Skipping sold/unavailable product: ${url}`)
        return null
      }

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
        availability: 'available', // Only available products reach this point
        scrapedAt: new Date().toISOString()
      }
      
    } catch (error) {
      if (retries > 0 && (error.code === 'ECONNRESET' || error.response?.status >= 500)) {
        console.log(`Retrying ${url} (${retries} retries left)...`)
        await this.delay(this.delayMs * 2) // Double delay on retry
        return this.scrapeProductDetail(url, retries - 1)
      }
      
      console.error(`Error scraping product detail ${url}:`, error.message)
      return null
    }
  }

  checkSoldInListing(productCard) {
    // Only check for explicit sold indicators, be more permissive
    const soldSelectors = [
      '.sold-out', 
      '.unavailable',
      '[data-sold="true"]',
      '.product-sold'
    ]
    
    for (const selector of soldSelectors) {
      if (productCard.find(selector).length > 0) {
        return true
      }
    }
    
    // Only check for very explicit sold text
    const cardText = productCard.text().toLowerCase()
    if (cardText.includes('sold out') || 
        cardText.includes('no longer available')) {
      return true
    }
    
    return false // Default to available
  }

  checkAvailability($) {
    // Only check for very explicit sold indicators
    const soldIndicators = [
      '.sold-out',
      '[data-testid="sold-out"]',
      '.product-sold'
    ]
    
    // Check if any explicit sold indicators are present
    for (const indicator of soldIndicators) {
      if ($(indicator).length > 0) {
        return false
      }
    }
    
    // Check for explicit "Sold Out" text only
    const soldTextElements = [
      '.product-status',
      '[data-testid="product-status"]'
    ]
    
    for (const element of soldTextElements) {
      const text = $(element).text().toLowerCase()
      if (text.includes('sold out') || 
          text.includes('no longer available')) {
        return false
      }
    }
    
    // If we have basic product info, consider it available
    const hasTitle = $('h1[data-testid="product-title"], .product-title, h1').text().trim().length > 0
    const hasBrand = $('[data-testid="product-brand"], .product-brand, .brand-name').text().trim().length > 0
    
    return hasTitle && hasBrand // Very permissive - just need basic product info
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
    $('img[src*="product"], img[alt*="product"], .product-image img, .product-images img').each((i, element) => {
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
  
  // Reduce delay to collect data faster
  scraper.delayMs = 3000 // 3 seconds between requests
  
  console.log('Starting The Real Real scraper...')
  console.log('Target: 200 products')
  console.log('Using 3 second delays between requests')
  
  scraper.scrapeProductListings('womens-clothing', 50, 200) // Increase to 50 pages to find 200 products
    .then(products => {
      console.log(`\n✅ Scraping completed!`)
      console.log(`📊 Scraped ${products.length} available products`)
      if (products.length > 0) {
        console.log(`💰 Price range: $${Math.min(...products.map(p => p.price))} - $${Math.max(...products.map(p => p.price))}`)
        console.log(`🏷️  Categories: ${[...new Set(products.map(p => p.category))].join(', ')}`)
        console.log(`👔 Brands: ${[...new Set(products.map(p => p.brand))].slice(0, 5).join(', ')}...`)
        console.log(`✅ All products are currently available for purchase`)
      }
      return scraper.saveProducts(products)
    })
    .then(() => {
      console.log('🎉 Products saved successfully!')
    })
    .catch(error => {
      console.error('❌ Scraper error:', error.message)
    })
}

export default TheRealRealScraper