import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import './index.css'
import App from './App.jsx'

// Replace with your Privy App ID from https://dashboard.privy.io
const PRIVY_APP_ID = 'cm5pgksxs05f9428uup8tuyd4'

const hasValidPrivyId = PRIVY_APP_ID && PRIVY_APP_ID !== 'YOUR_PRIVY_APP_ID'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {hasValidPrivyId ? (
      <PrivyProvider appId={PRIVY_APP_ID}>
        <App privyEnabled={true} />
      </PrivyProvider>
    ) : (
      <App privyEnabled={false} />
    )}
  </StrictMode>,
)
