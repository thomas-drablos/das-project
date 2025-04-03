import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import 'bulma/css/bulma.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import App from './App.tsx'

const root = document.getElementById('root')

if (root == null) {
  console.error("Failed to instantiate application. Unable to locate `root` element.")
} else {
  createRoot(root).render(
    <StrictMode>
      {/* Required for Auth0 Authentication/Login */}
      <Auth0Provider
        domain="dev-olcmjrm1xuqtgb8o.us.auth0.com"
        clientId="zqvb0HiU9R5WVx2KObs9wGepXr46sTwO"
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
      >
        <App />
      </Auth0Provider>
    </StrictMode>,
  )
}
