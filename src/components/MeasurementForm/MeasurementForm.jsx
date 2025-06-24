import { useState, useEffect } from 'react'

const MeasurementForm = ({ onMeasurementsChange }) => {
  const [measurements, setMeasurements] = useState({
    height: '',
    bust: '',
    waist: '',
    hips: ''
  })

  const [preferences, setPreferences] = useState({
    tops: 'regular',
    bottoms: 'regular',
    dresses: 'regular'
  })

  useEffect(() => {
    const savedData = localStorage.getItem('fitfinder-profile')
    if (savedData) {
      const parsed = JSON.parse(savedData)
      setMeasurements(parsed.measurements || measurements)
      setPreferences(parsed.preferences || preferences)
    }
  }, [])

  useEffect(() => {
    const profileData = { measurements, preferences }
    localStorage.setItem('fitfinder-profile', JSON.stringify(profileData))
    if (onMeasurementsChange) {
      onMeasurementsChange(profileData)
    }
  }, [measurements, preferences, onMeasurementsChange])

  const handleMeasurementChange = (field, value) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePreferenceChange = (category, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }))
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Your Measurements</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height (inches)
          </label>
          <input
            type="number"
            value={measurements.height}
            onChange={(e) => handleMeasurementChange('height', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 65"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bust (inches)
          </label>
          <input
            type="number"
            value={measurements.bust}
            onChange={(e) => handleMeasurementChange('bust', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 34"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Waist (inches)
          </label>
          <input
            type="number"
            value={measurements.waist}
            onChange={(e) => handleMeasurementChange('waist', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 28"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hips (inches)
          </label>
          <input
            type="number"
            value={measurements.hips}
            onChange={(e) => handleMeasurementChange('hips', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 36"
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-4">Fit Preferences</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['tops', 'bottoms', 'dresses'].map(category => (
          <div key={category}>
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
              {category}
            </label>
            <select
              value={preferences[category]}
              onChange={(e) => handlePreferenceChange(category, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="loose">Loose Fit</option>
              <option value="regular">Regular Fit</option>
              <option value="fitted">Fitted</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MeasurementForm