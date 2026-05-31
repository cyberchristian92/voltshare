import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Fontes offline (empacotadas via @fontsource — não dependem de internet na gravação)
import '@fontsource-variable/archivo'
import '@fontsource/hanken-grotesk/400.css'
import '@fontsource/hanken-grotesk/500.css'
import '@fontsource/hanken-grotesk/600.css'
import '@fontsource/hanken-grotesk/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/700.css'

import './index.css'
import App from './App.jsx'
import { StoreProvider } from './store.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)
