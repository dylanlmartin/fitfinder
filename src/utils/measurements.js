const validateMeasurements = (measurements) => {
  const errors = []
  
  if (!measurements.height || measurements.height < 48 || measurements.height > 84) {
    errors.push('Height must be between 48 and 84 inches')
  }
  
  if (!measurements.bust || measurements.bust < 24 || measurements.bust > 60) {
    errors.push('Bust measurement must be between 24 and 60 inches')
  }
  
  if (!measurements.waist || measurements.waist < 20 || measurements.waist > 50) {
    errors.push('Waist measurement must be between 20 and 50 inches')
  }
  
  if (!measurements.hips || measurements.hips < 26 || measurements.hips > 65) {
    errors.push('Hip measurement must be between 26 and 65 inches')
  }
  
  // Logical consistency checks
  if (measurements.waist && measurements.bust && measurements.waist > measurements.bust + 10) {
    errors.push('Waist measurement seems unusually large compared to bust')
  }
  
  if (measurements.hips && measurements.waist && measurements.hips < measurements.waist - 5) {
    errors.push('Hip measurement seems unusually small compared to waist')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

const convertToInches = (measurement, unit) => {
  if (unit === 'cm') {
    return Math.round(measurement / 2.54 * 100) / 100
  }
  return measurement
}

const convertToCentimeters = (measurement) => {
  return Math.round(measurement * 2.54 * 100) / 100
}

const getSizeRecommendation = (measurements, brand, category) => {
  // This would normally use brand-specific sizing charts
  // For now, return a basic US size estimate
  const bust = parseFloat(measurements.bust)
  
  if (category === 'tops' || category === 'dresses') {
    if (bust <= 32) return 'XS/0-2'
    if (bust <= 34) return 'S/4-6'
    if (bust <= 36) return 'M/8-10'
    if (bust <= 38) return 'L/12-14'
    return 'XL/16+'
  }
  
  const waist = parseFloat(measurements.waist)
  if (category === 'bottoms') {
    if (waist <= 26) return 'XS/0-2'
    if (waist <= 28) return 'S/4-6'
    if (waist <= 30) return 'M/8-10'
    if (waist <= 32) return 'L/12-14'
    return 'XL/16+'
  }
  
  return 'Size varies by item'
}

export { validateMeasurements, convertToInches, convertToCentimeters, getSizeRecommendation }