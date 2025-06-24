const calculateFitScore = (userMeasurements, product, userPreferences) => {
  if (!userMeasurements || !product) return 0

  const { measurements: userMeas, preferences = {} } = userMeasurements
  const productMeas = product.measurements

  if (!userMeas || !productMeas) return 0

  let totalScore = 0
  let measurementCount = 0

  // Define tolerance ranges based on fit preference
  const getToleranceRange = (category, preference) => {
    const baseRanges = {
      loose: { min: -1, max: 4 },
      regular: { min: -2, max: 2 },
      fitted: { min: -3, max: 1 }
    }
    return baseRanges[preference] || baseRanges.regular
  }

  // Get fit preference for this product category
  const fitPreference = preferences[product.category] || 'regular'
  const tolerance = getToleranceRange(product.category, fitPreference)

  // Calculate scores for each measurement
  const measurementScores = []

  // Bust/Chest measurement
  if (userMeas.bust && productMeas.bust) {
    const diff = productMeas.bust - userMeas.bust
    const score = calculateMeasurementScore(diff, tolerance)
    measurementScores.push({ measurement: 'bust', score, diff })
    totalScore += score
    measurementCount++
  }

  // Waist measurement
  if (userMeas.waist && productMeas.waist) {
    const diff = productMeas.waist - userMeas.waist
    const score = calculateMeasurementScore(diff, tolerance)
    measurementScores.push({ measurement: 'waist', score, diff })
    totalScore += score
    measurementCount++
  }

  // Hip measurement
  if (userMeas.hips && productMeas.hips) {
    const diff = productMeas.hips - userMeas.hips
    const score = calculateMeasurementScore(diff, tolerance)
    measurementScores.push({ measurement: 'hips', score, diff })
    totalScore += score
    measurementCount++
  }

  // Length considerations for dresses and tops
  if (product.category === 'dresses' || product.category === 'tops') {
    if (userMeas.height && productMeas.length) {
      const idealLength = getIdealLength(userMeas.height, product.category)
      const diff = Math.abs(productMeas.length - idealLength)
      const lengthScore = Math.max(0, 100 - (diff * 10))
      measurementScores.push({ measurement: 'length', score: lengthScore, diff })
      totalScore += lengthScore
      measurementCount++
    }
  }

  // Apply brand-specific adjustments
  const brandAdjustment = getBrandFitAdjustment(product.brand, product.category)
  const adjustedScore = Math.min(100, Math.max(0, (totalScore / measurementCount) + brandAdjustment))

  return {
    overallScore: Math.round(adjustedScore),
    measurementScores,
    recommendation: getFitRecommendation(adjustedScore),
    details: {
      tolerance,
      fitPreference,
      brandAdjustment,
      measurementCount
    }
  }
}

const calculateMeasurementScore = (diff, tolerance) => {
  if (diff >= tolerance.min && diff <= tolerance.max) {
    return 100 // Perfect fit
  }
  
  if (diff < tolerance.min) {
    // Too small
    const excessTightness = Math.abs(diff - tolerance.min)
    return Math.max(0, 100 - (excessTightness * 25))
  } else {
    // Too large
    const excessLooseness = diff - tolerance.max
    return Math.max(0, 100 - (excessLooseness * 15))
  }
}

const getIdealLength = (height, category) => {
  const heightInches = parseFloat(height)
  
  if (category === 'dresses') {
    if (heightInches < 62) return 36 // Petite
    if (heightInches > 68) return 42 // Tall
    return 39 // Regular
  }
  
  if (category === 'tops') {
    if (heightInches < 62) return 22 // Petite
    if (heightInches > 68) return 26 // Tall
    return 24 // Regular
  }
  
  return 24
}

const getBrandFitAdjustment = (brand, category) => {
  const brandAdjustments = {
    'Chanel': { tops: 5, dresses: 5, bottoms: 0 },
    'Hermes': { tops: 3, dresses: 3, bottoms: 2 },
    'Prada': { tops: -2, dresses: -2, bottoms: -3 },
    'Gucci': { tops: 0, dresses: 0, bottoms: -2 },
    'Saint Laurent': { tops: -5, dresses: -5, bottoms: -5 }
  }
  
  return brandAdjustments[brand]?.[category] || 0
}

const getFitRecommendation = (score) => {
  if (score >= 90) return 'Perfect Fit'
  if (score >= 70) return 'Good Fit'
  if (score >= 50) return 'Maybe'
  return 'Poor Fit'
}

const applyFilters = (products, filters, userProfile) => {
  return products.filter(product => {
    // Category filter
    if (filters.category && product.category !== filters.category) {
      return false
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
      return false
    }

    // Price filter
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false
    }

    // Condition filter
    if (filters.condition && product.condition !== filters.condition) {
      return false
    }

    // Fit score filter
    const fitResult = calculateFitScore(userProfile, product)
    if (fitResult.overallScore < filters.minFitScore) {
      return false
    }

    return true
  })
}

export { calculateFitScore, applyFilters }