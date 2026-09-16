import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LiquidFilters from './components/LiquidFilters.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LiquidFilters />
    <App />
  </StrictMode>,
)
