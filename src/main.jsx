import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppDataProviderSupabase } from './store/AppDataProviderSupabase'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AppDataProviderSupabase>
        <App />
      </AppDataProviderSupabase>
    </ErrorBoundary>
  </StrictMode>,
)