import { useState, useEffect } from 'react'
import MeasurementForm from './components/MeasurementForm'
import ProductGrid from './components/ProductGrid'
import FilterSidebar from './components/FilterSidebar'
import { calculateFitScore, applyFilters } from './utils/fitCalculator'
import productsData from './data/products.json'
import apiService from './services/api'

function App() {
  const [userProfile, setUserProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [filters, setFilters] = useState({
    category: '',
    brands: [],
    priceRange: [0, 5000],
    condition: '',
    minFitScore: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [brands, setBrands] = useState([])
  const [useApi, setUseApi] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Check if API is available on mount
  useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        const isApiHealthy = await apiService.healthCheck()
        setUseApi(isApiHealthy)
        
        if (isApiHealthy) {
          const apiBrands = await apiService.getBrands()
          setBrands(apiBrands)
        } else {
          // Fallback to static data
          const staticBrands = [...new Set(productsData.map(p => p.brand))].sort()
          setBrands(staticBrands)
        }
      } catch (error) {
        console.log('API not available, using static data')
        setUseApi(false)
        const staticBrands = [...new Set(productsData.map(p => p.brand))].sort()
        setBrands(staticBrands)
      }
    }

    checkApiAvailability()
  }, [])

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      
      try {
        let productsToProcess = []
        
        if (useApi) {
          // Use API to get products
          if (searchQuery) {
            const response = await apiService.searchProducts(searchQuery, filters, userProfile)
            productsToProcess = Array.isArray(response) ? response : response.items || []
          } else {
            const response = await apiService.getProducts(filters)
            productsToProcess = response.items || []
          }
        } else {
          // Use static data
          productsToProcess = productsData
        }

        // Calculate fit scores if not already provided by API
        const productsWithFitScores = productsToProcess.map(product => {
          if (product.fitScore !== undefined) {
            return product // Already has fit score from API
          }
          
          if (userProfile && userProfile.measurements) {
            const fitResult = calculateFitScore(userProfile, product)
            return {
              ...product,
              fitScore: fitResult.overallScore,
              fitDetails: fitResult
            }
          }
          return { ...product, fitScore: 0 }
        })

        // Sort by fit score (highest first)
        productsWithFitScores.sort((a, b) => b.fitScore - a.fitScore)
        
        setProducts(productsWithFitScores)
      } catch (error) {
        console.error('Error loading products:', error)
        // Fallback to static data
        const fallbackProducts = productsData.map(product => {
          if (userProfile && userProfile.measurements) {
            const fitResult = calculateFitScore(userProfile, product)
            return {
              ...product,
              fitScore: fitResult.overallScore,
              fitDetails: fitResult
            }
          }
          return { ...product, fitScore: 0 }
        })
        setProducts(fallbackProducts)
      }
      
      setIsLoading(false)
    }

    loadProducts()
  }, [userProfile, useApi, searchQuery, filters])

  useEffect(() => {
    // Apply filters when filters or products change
    const filtered = applyFilters(products, filters, userProfile)
    setFilteredProducts(filtered)
  }, [products, filters, userProfile])

  const handleMeasurementsChange = (profile) => {
    setUserProfile(profile)
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const hasValidMeasurements = userProfile && 
    userProfile.measurements && 
    userProfile.measurements.height && 
    userProfile.measurements.bust && 
    userProfile.measurements.waist && 
    userProfile.measurements.hips

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">FitFinder</h1>
          <p className="text-gray-600 mt-2">Find luxury clothing that fits you perfectly</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <MeasurementForm onMeasurementsChange={handleMeasurementsChange} />
        </div>

        {hasValidMeasurements ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-1/4">
              <FilterSidebar 
                brands={brands}
                onFiltersChange={handleFiltersChange}
              />
            </aside>
            
            <section className="lg:w-3/4">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {filteredProducts.length} items found
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Sorted by fit score for your measurements
                      {useApi && <span className="text-green-600 ml-2">• Live data</span>}
                      {!useApi && <span className="text-amber-600 ml-2">• Demo mode</span>}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <ProductGrid 
                products={filteredProducts}
                userProfile={userProfile}
                isLoading={isLoading}
              />
            </section>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Please enter your measurements above to see personalized fit recommendations
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App