# Changelog

All notable changes to the FitFinder project will be documented in this file.

## [0.1.0] - 2024-12-24

### Added
- Initial MVP implementation
- React frontend with Vite and Tailwind CSS
- Measurement input form with localStorage persistence
- Product grid with fit score visualization
- Filter sidebar with category, brand, price, and condition filters
- Basic fit calculation algorithm with brand-specific adjustments
- Static demo data for 5 luxury brands (Chanel, Hermès, Prada, Gucci, Saint Laurent)
- Node.js/Express backend with RESTful API
- Web scraper for The Real Real (respectful, with delays)
- Product search and filtering endpoints
- Sizing chart integration
- Responsive design for mobile and desktop
- API health checking with fallback to static data
- Comprehensive documentation and setup instructions

### Features
- **Intelligent Fit Scoring**: 90%+ Perfect Fit, 70%+ Good Fit, 50%+ Maybe, <50% Poor Fit
- **Brand Adjustments**: Accounts for known brand sizing variations
- **Fit Preferences**: Loose/Regular/Fitted settings per garment type
- **Advanced Filtering**: By category, brand, price range, condition, minimum fit score
- **Search Functionality**: Text search with fit score integration
- **Graceful Degradation**: Works with static data when backend unavailable

### Technical Stack
- Frontend: React 18, Vite, Tailwind CSS
- Backend: Node.js, Express, Cheerio, Axios
- Data: JSON files (Phase 1), prepared for database migration
- Deployment Ready: Vercel (frontend), Railway/Render (backend)

### API Endpoints
- `GET /api/products` - Get filtered products
- `POST /api/products/search` - Search with fit scores
- `GET /api/products/meta/brands` - Available brands
- `GET /api/sizing/charts` - Sizing charts
- `POST /api/sizing/fit-analysis` - Calculate fit scores
- `GET /health` - API health check