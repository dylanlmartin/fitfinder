# Technical Specification: FitFinder MVP - The Real Real Integration

## Project Overview

Build a web application that allows users to input body measurements and find well-fitting women's clothing from The Real Real based on size-to-measurement mapping rather than branded sizing.

## Core Features

### User Measurement Input
- **Measurement Collection**: Height, bust, waist, hips (inches)
- **Profile Persistence**: Save measurements locally (localStorage initially)
- **Fit Preferences**: Loose/fitted preference slider for different garment types

### Product Discovery
- **Category Filtering**: Tops, Bottoms, Dresses, Outerwear
- **Brand Filtering**: Multi-select from available brands
- **Size Confidence**: Display fit confidence score (Good Fit/Maybe/Poor Fit)
- **Search**: Text search within filtered results
- **Sorting**: By price, size confidence, newest listings

### Product Display
- **Fit Indicator**: Clear visual indication of predicted fit quality
- **Size Translation**: Show "Your predicted size" vs "Listed size"
- **Product Details**: Price, condition, measurements (when available)
- **External Link**: Direct link to product on The Real Real

## Technical Architecture

### Frontend (React Application)
```
src/
├── components/
│   ├── MeasurementForm/
│   ├── ProductGrid/
│   ├── FilterSidebar/
│   └── ProductCard/
├── pages/
│   ├── Home/
│   ├── Profile/
│   └── Search/
├── services/
│   ├── api.js
│   └── sizingLogic.js
├── utils/
│   ├── measurements.js
│   └── fitCalculator.js
└── data/
    └── sizingCharts.json
```

### Backend (Node.js/Express)
```
server/
├── routes/
│   ├── products.js
│   └── sizing.js
├── services/
│   ├── scraper.js
│   └── fitAnalyzer.js
├── data/
│   ├── products.json
│   └── brandSizing.json
└── utils/
    └── dataProcessor.js
```

## Data Requirements

### User Data Structure
```json
{
  "measurements": {
    "height": 65, // inches
    "bust": 34,
    "waist": 28,
    "hips": 36
  },
  "preferences": {
    "tops": "fitted", // fitted, regular, loose
    "bottoms": "regular",
    "dresses": "fitted"
  }
}
```

### Product Data Structure
```json
{
  "id": "trr_12345",
  "title": "Chanel Tweed Jacket",
  "brand": "Chanel",
  "category": "tops",
  "subcategory": "jackets",
  "size": "38",
  "price": 2450,
  "condition": "Excellent",
  "url": "https://therealreal.com/...",
  "images": ["url1", "url2"],
  "measurements": {
    "bust": 36,
    "length": 24,
    "shoulder": 15
  },
  "description": "..."
}
```

### Brand Sizing Chart Structure
```json
{
  "brand": "Chanel",
  "category": "tops",
  "sizingChart": {
    "34": { "bust": 32, "waist": 26 },
    "36": { "bust": 34, "waist": 28 },
    "38": { "bust": 36, "waist": 30 }
  },
  "fitNotes": "Runs small, size up one size"
}
```

## Implementation Phases

### Phase 1: Core MVP (Week 1-2)
1. **Frontend Setup**: React app with measurement input form
2. **Static Data**: Hardcoded product data and sizing charts for 3-5 brands
3. **Basic Fit Logic**: Simple measurement comparison algorithm
4. **Product Display**: Grid view with basic fit indicators
5. **Local Storage**: Persist user measurements

### Phase 2: Dynamic Data (Week 3-4)
1. **Web Scraping**: Build scraper for The Real Real product listings
2. **Data Processing**: Extract and normalize product information
3. **Backend API**: Create endpoints for product search and filtering
4. **Enhanced Fit Algorithm**: Incorporate brand-specific fit characteristics
5. **Improved UI**: Better filtering and search capabilities

### Phase 3: Polish & Features (Week 5-6)
1. **Advanced Filtering**: Size, price range, condition filters
2. **Fit Confidence Scoring**: More sophisticated fit prediction
3. **User Experience**: Loading states, error handling, responsive design
4. **Performance**: Optimize data loading and search performance
5. **Testing**: Comprehensive testing suite

## Key Technical Decisions

### Data Acquisition Strategy
- **Primary Method**: Web scraping The Real Real product pages
- **Data Refresh**: Daily batch processing for new listings
- **Storage**: JSON files initially, migrate to database if needed
- **Rate Limiting**: Respectful scraping with delays between requests

### Fit Calculation Algorithm
- **Base Logic**: Compare user measurements to garment measurements
- **Tolerance Ranges**: Define acceptable fit ranges (±2 inches for most measurements)
- **Brand Adjustments**: Apply known brand sizing characteristics
- **Category Variations**: Different fit criteria for tops vs bottoms vs dresses

### Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Cheerio for scraping
- **Data Storage**: JSON files (Phase 1), SQLite (Phase 2+)
- **Deployment**: Vercel (frontend), Railway/Render (backend)

## Technical Specifications

### API Endpoints
```
GET /api/products
  Query params: category, brand, minPrice, maxPrice, size
  Returns: Array of products with fit scores

POST /api/fit-analysis
  Body: { userMeasurements, product }
  Returns: { fitScore, recommendation, sizeAdvice }

GET /api/brands
  Returns: List of available brands with product counts

GET /api/sizing/:brand/:category
  Returns: Sizing chart for specific brand/category
```

### Fit Scoring Logic
- **Perfect Fit (90-100%)**: All measurements within ±1 inch
- **Good Fit (70-89%)**: Most measurements within ±2 inches
- **Maybe (50-69%)**: Some measurements outside ideal range
- **Poor Fit (<50%)**: Multiple measurements significantly off

### Scraping Requirements
- **Target Pages**: The Real Real women's clothing category pages and product detail pages
- **Data Points**: Title, brand, size, price, measurements (when available), images, condition
- **Frequency**: Daily scraping run, detect new listings
- **Error Handling**: Graceful failure for missing data points
- **Respectful Practices**: User-agent rotation, request delays, robots.txt compliance

## Success Metrics

### Technical KPIs
- **Data Accuracy**: >85% of products have usable measurement data
- **Fit Prediction**: User feedback validation of fit recommendations
- **Performance**: Page load times <2 seconds, search results <1 second
- **Uptime**: >99% availability for core search functionality

### User Experience Goals
- **Onboarding**: <2 minutes to input measurements and see first results
- **Search Experience**: Relevant results with clear fit indicators
- **Conversion**: Clear path to purchase on The Real Real

## Future Considerations

### Scalability Preparation
- Database schema design for multiple retailers
- API structure to support additional data sources
- User account system for cross-device measurement sync
- Analytics tracking for user behavior and fit accuracy

### Legal & Compliance
- Respectful data usage practices
- Clear attribution to The Real Real
- Terms of service addressing data sources
- User privacy for measurement data

## Development Priorities

1. **Core Functionality**: Get basic measurement input and product matching working
2. **Data Quality**: Ensure reliable product data extraction and processing
3. **User Experience**: Intuitive interface with clear fit guidance
4. **Performance**: Responsive search and filtering
5. **Error Handling**: Graceful degradation when data is incomplete

This specification provides the foundation for building a focused MVP that validates the core value proposition before expanding to additional retailers or features.