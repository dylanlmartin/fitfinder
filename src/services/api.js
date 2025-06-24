const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error)
      throw error
    }
  }

  // Product endpoints
  async getProducts(filters = {}, page = 1, limit = 24) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            acc[key] = value.join(',')
          } else if (key === 'priceRange') {
            acc.minPrice = value[0]
            acc.maxPrice = value[1]
          } else {
            acc[key] = value
          }
        }
        return acc
      }, {})
    })

    return this.request(`/products?${queryParams}`)
  }

  async getProductById(id) {
    return this.request(`/products/${id}`)
  }

  async searchProducts(query, filters = {}, userMeasurements = null) {
    return this.request('/products/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        filters,
        userMeasurements
      })
    })
  }

  async getBrands() {
    return this.request('/products/meta/brands')
  }

  // Sizing endpoints
  async getSizingCharts() {
    return this.request('/sizing/charts')
  }

  async getSizingChart(brand, category) {
    return this.request(`/sizing/${encodeURIComponent(brand)}/${encodeURIComponent(category)}`)
  }

  async calculateFitScore(userMeasurements, product) {
    return this.request('/sizing/fit-analysis', {
      method: 'POST',
      body: JSON.stringify({
        userMeasurements,
        product
      })
    })
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`)
      return response.ok
    } catch {
      return false
    }
  }
}

export default new ApiService()