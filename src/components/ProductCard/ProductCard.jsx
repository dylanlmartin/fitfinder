const ProductCard = ({ product, fitScore }) => {
  const getFitBadge = (score) => {
    if (score >= 90) return { text: 'Perfect Fit', color: 'bg-green-500' }
    if (score >= 70) return { text: 'Good Fit', color: 'bg-blue-500' }
    if (score >= 50) return { text: 'Maybe', color: 'bg-yellow-500' }
    return { text: 'Poor Fit', color: 'bg-red-500' }
  }

  const fitBadge = getFitBadge(fitScore)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'}
          alt={product.title}
          className="w-full h-48 sm:h-56 md:h-64 object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'
          }}
        />
        <div className={`absolute top-2 right-2 ${fitBadge.color} text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md`}>
          {fitBadge.text}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2 leading-tight">{product.title}</h3>
        <p className="text-gray-600 mb-2 text-sm font-medium">{product.brand}</p>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-xl sm:text-2xl font-bold text-green-600">${product.price}</span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{product.condition}</span>
        </div>
        
        <div className="text-sm text-gray-500 mb-3 space-y-1">
          <div className="flex justify-between">
            <span>Listed Size:</span>
            <span className="font-medium">{product.size}</span>
          </div>
          <div className="flex justify-between">
            <span>Fit Score:</span>
            <span className={`font-bold ${fitScore >= 70 ? 'text-green-600' : fitScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {fitScore}%
            </span>
          </div>
        </div>
        
        {product.measurements && Object.keys(product.measurements).length > 0 && (
          <div className="text-xs text-gray-400 mb-3 bg-gray-50 p-2 rounded">
            <div className="font-medium text-gray-600 mb-1">Measurements:</div>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(product.measurements).slice(0, 4).map(([key, value]) => (
                <span key={key} className="capitalize">{key}: {value}"</span>
              ))}
            </div>
          </div>
        )}
        
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-black text-white text-center py-2 px-4 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          View on The RealReal
        </a>
      </div>
    </div>
  )
}

export default ProductCard