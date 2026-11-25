import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/600.css'
import '@fontsource/jetbrains-mono/400.css'
import App from './App'
import './styles/tokens.css'
import './styles/base.css'
import './styles/app.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element missing')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
