import express from 'express'
import cors from 'cors'
import productsRouter from './routes/products.js'
import sizingRouter from './routes/sizing.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/products', productsRouter)
app.use('/api/sizing', sizingRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// Start server
app.listen(PORT, () => {
  console.log(`FitFinder server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})

export default app