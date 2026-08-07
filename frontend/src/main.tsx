import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './setupAuth' // must load before any API calls
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
