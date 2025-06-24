# FitFinder MVP

Find luxury clothing that fits you perfectly from The Real Real based on your measurements rather than branded sizing.

## Features

- **Personal Measurement Input**: Enter your height, bust, waist, and hip measurements
- **Fit Preference Settings**: Choose loose, regular, or fitted preferences for different garment types
- **Intelligent Fit Scoring**: Algorithm calculates fit scores based on your measurements and preferences
- **Advanced Filtering**: Filter by category, brand, price, condition, and minimum fit score
- **Product Search**: Search for specific items with fit recommendations
- **Brand-Specific Adjustments**: Accounts for known brand sizing variations
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Local Storage** for measurement persistence

### Backend  
- **Node.js** with Express
- **Cheerio** for web scraping
- **Axios** for HTTP requests
- **JSON** file storage (Phase 1)

## Quick Start

### Development Mode

1. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

2. **Start both frontend and backend:**
   ```bash
   npm run dev
   ```

   This runs:
   - Frontend on http://localhost:5173
   - Backend API on http://localhost:3001

### Frontend Only (Demo Mode)

```bash
npm run dev:frontend
```

Uses static demo data when backend is not available.

### Backend Only

```bash
npm run dev:backend
```

## Usage

1. **Enter Your Measurements**: Input height, bust, waist, and hip measurements in inches
2. **Set Fit Preferences**: Choose how you prefer different garment types to fit
3. **Browse Products**: View personalized fit scores for each item
4. **Filter & Search**: Use filters and search to find specific items
5. **View Details**: Click through to The Real Real for purchase

## Data Sources

- **Static Demo Data**: 12+ luxury items from Chanel, Hermès, Prada, Gucci, Saint Laurent
- **Live Scraping**: Respectful scraping of The Real Real (when enabled)
- **Brand Sizing Charts**: Comprehensive sizing data for accurate fit calculations

## Fit Calculation

The algorithm considers:
- **Your measurements** vs **garment measurements**
- **Fit preferences** (loose/regular/fitted)
- **Brand-specific adjustments** (e.g., Saint Laurent runs small)
- **Category variations** (different criteria for tops vs dresses)

### Fit Scores
- **90-100%**: Perfect Fit
- **70-89%**: Good Fit  
- **50-69%**: Maybe
- **<50%**: Poor Fit

## API Endpoints

```
GET /api/products                    # Get filtered products
GET /api/products/:id               # Get specific product
POST /api/products/search           # Search products with fit scores
GET /api/products/meta/brands       # Get available brands
GET /api/sizing/charts              # Get all sizing charts
GET /api/sizing/:brand/:category    # Get specific sizing chart
POST /api/sizing/fit-analysis       # Calculate fit score
GET /health                         # API health check
```

## Scripts

```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Frontend only (demo mode)
npm run dev:backend      # Backend only
npm run build           # Build frontend for production
npm run preview         # Preview production build
npm run scrape          # Run The Real Real scraper
npm run lint            # Lint frontend code
```

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

## Project Structure

```
fitfinder/
├── src/                 # Frontend React app
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   ├── utils/          # Utility functions
│   └── data/           # Static demo data
├── server/             # Backend Express app
│   ├── routes/         # API route handlers
│   ├── services/       # Business logic & scraping
│   ├── utils/          # Server utilities
│   └── data/           # Scraped data storage
└── spec/               # Technical specification
```

## Development Phases

### ✅ Phase 1: Core MVP
- React frontend with measurement input
- Static product data and sizing charts
- Basic fit calculation algorithm
- Product grid with fit indicators
- Local storage persistence

### ✅ Phase 2: Dynamic Data  
- Node.js/Express backend
- Web scraper for The Real Real
- Product search and filtering APIs
- Enhanced fit algorithm
- Frontend/backend integration

### 🚧 Phase 3: Polish & Features (Next)
- Advanced filtering options
- Improved fit confidence scoring
- Enhanced UX and error handling
- Performance optimization
- Comprehensive testing

## Contributing

This is an MVP implementation. Current focus areas:
- Improving fit prediction accuracy
- Adding more brand sizing data
- Enhancing scraping reliability
- Mobile experience optimization

## Legal & Ethics

- Respectful scraping practices (2-second delays, robots.txt compliance)
- Clear attribution to The Real Real
- No data storage of personal information beyond local browser storage
- Educational/prototype purposes

## Support

For issues or questions about the codebase, please refer to the technical specification in `spec/fitfinder_spec.md`.