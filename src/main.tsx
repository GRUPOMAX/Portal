// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './styles/effects.css';
import './styles/leaflet-cluster.css'

import AppRouter from './app/AppRouter'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)
