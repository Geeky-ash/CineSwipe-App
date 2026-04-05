import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Registry } from 'boneyard-js'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Registry>
      <App />
    </Registry>
  </StrictMode>,
)
