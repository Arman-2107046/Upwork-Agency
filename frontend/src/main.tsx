import '@fontsource/barlow/latin-600.css'
import '@fontsource/barlow/latin-700.css'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './styles/globals.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { App } from './App'
import { ThemeProvider } from './hooks/ThemeProvider'
import { MotionProvider } from './motion/MotionProvider'
import { SmoothScroll } from './motion/SmoothScroll'
import { applyMotionCssVars } from './motion/tokens'

applyMotionCssVars()

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

createRoot(root).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <MotionProvider>
          <SmoothScroll>
            <App />
          </SmoothScroll>
        </MotionProvider>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>,
)
