import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/effects.css'
import './styles/leaflet-cluster.css'
import AppRouter from './app/AppRouter'

const container = document.getElementById('root')
if (!container) throw new Error('Elemento #root não encontrado no index.html')

createRoot(container).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
)
